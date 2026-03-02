import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import Loader from "../components/Loader";
import "../styles/restaurantDetails.css";

export default function RestaurantDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [sliderIndex, setSliderIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  /* Booking Modal State */
  const [showBooking, setShowBooking] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    timeFrom: "",
    timeTo: "",
    guests: 2,
    tableNo: "",
    specialRequests: "",
  });
  const [bookingMsg, setBookingMsg] = useState("");
  const [bookedTables, setBookedTables] = useState([]);
  const [tableFilter, setTableFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get(`/restaurants/${id}`);
        setRestaurant(res.data);

        const menuRes = await API.get(`/menu/restaurant/${id}`);
        setMenu(menuRes.data);

        const imgRes = await API.get(`/restaurants/${id}/images`);
        setGalleryImages(imgRes.data || []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  /* Fetch booked tables when date or time range changes */
  useEffect(() => {
    const fetchBookedTables = async () => {
      if (!bookingForm.date || !bookingForm.timeFrom || !bookingForm.timeTo) {
        setBookedTables([]);
        return;
      }
      try {
        const { data } = await API.get(
          `/reservations/booked-tables?restaurantId=${id}&date=${bookingForm.date}&timeFrom=${bookingForm.timeFrom}&timeTo=${bookingForm.timeTo}`
        );
        setBookedTables(data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchBookedTables();
  }, [bookingForm.date, bookingForm.timeFrom, bookingForm.timeTo, id]);

  /* Payment flow state */
  const [bookingStep, setBookingStep] = useState("form"); // "form" | "payment" | "receipt"
  const [lastBooking, setLastBooking] = useState(null);
  const [paying, setPaying] = useState(false);
  const bookingFee = restaurant?.bookingFee || 199;

  /* ================= BOOK TABLE ================= */
  const handleBooking = async (e) => {
    e.preventDefault();
    setBookingMsg("");

    const token = localStorage.getItem("token");
    if (!token) {
      setBookingMsg("Please login first to book a table.");
      return;
    }

    if (!bookingForm.tableNo) {
      setBookingMsg("Please select a table number.");
      return;
    }

    try {
      const { data } = await API.post("/reservations", {
        restaurantId: id,
        ...bookingForm,
        bookingAmount: bookingFee,
      });
      setLastBooking(data);
      setBookingStep("payment");
      setBookingMsg("");
    } catch (err) {
      setBookingMsg("❌ " + (err.response?.data?.message || "Booking failed"));
    }
  };

  /* ================= RAZORPAY PAYMENT ================= */
  const handlePayment = async () => {
    if (!lastBooking) return;
    setPaying(true);
    setBookingMsg("");

    try {
      // Step 1: Create Razorpay order on backend
      const { data: orderData } = await API.post(`/reservations/create-order/${lastBooking._id}`);

      // Step 2: Open Razorpay checkout popup
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: orderData.restaurantName,
        description: `Table Booking Fee - ${restaurant.name}`,
        order_id: orderData.orderId,
        prefill: {
          name: lastBooking.name,
          email: lastBooking.email || "",
          contact: lastBooking.phone,
        },
        notes: {
          restaurant: restaurant.name,
          table: lastBooking.tableNo,
          date: lastBooking.date,
        },
        theme: {
          color: "#ff6b00",
        },
        handler: async (response) => {
          // Step 3: Verify payment on backend
          try {
            const { data: verifyData } = await API.post(`/reservations/verify-payment/${lastBooking._id}`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setLastBooking(verifyData.reservation);
            setBookingStep("receipt");
          } catch (err) {
            setBookingMsg("❌ Payment verification failed. Contact support.");
          }
          setPaying(false);
        },
        modal: {
          ondismiss: () => {
            setPaying(false);
            setBookingMsg("Payment cancelled. You can pay later from your profile.");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Razorpay error:", err);
      setBookingMsg("❌ " + (err.response?.data?.message || "Could not initiate payment"));
      setPaying(false);
    }
  };

  /* ================= CLOSE BOOKING ================= */
  const closeBookingModal = () => {
    setShowBooking(false);
    setBookingStep("form");
    setBookingMsg("");
    setLastBooking(null);
    setBookingForm({ name: "", email: "", phone: "", date: "", timeFrom: "", timeTo: "", guests: 2, tableNo: "", specialRequests: "" });
    setBookedTables([]);
  };

  if (loading) return <div className="restaurant-page"><Loader /></div>;
  if (!restaurant) return <div className="restaurant-page"><h2 className="loading">Restaurant Not Found</h2></div>;

  const totalTables = restaurant.totalTables || 10;

  return (
    <div className="restaurant-page">
      {/* ===== BACK BUTTON ===== */}
      <button className="back-btn" onClick={() => navigate("/")}>
        ← Back to Home
      </button>

      {/* ===== HERO with IMAGE SLIDER ===== */}
      <div className="restaurant-hero">
        {galleryImages.length > 0 ? (
          <>
            <img
              src={galleryImages[sliderIndex]}
              alt={`${restaurant.name} - Photo ${sliderIndex + 1}`}
              key={sliderIndex}
            />

            {galleryImages.length > 1 && (
              <>
                <button
                  className="hero-arrow hero-prev"
                  onClick={() => setSliderIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1))}
                >
                  ‹
                </button>
                <button
                  className="hero-arrow hero-next"
                  onClick={() => setSliderIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1))}
                >
                  ›
                </button>
              </>
            )}

            {galleryImages.length > 1 && (
              <div className="hero-counter">
                {sliderIndex + 1} / {galleryImages.length}
              </div>
            )}
          </>
        ) : (
          <div className="hero-placeholder" />
        )}

        <div className="hero-overlay">
          <h1>{restaurant.name}</h1>
          <p>📍 {restaurant.restaurantId || "Rajasthan"} &nbsp; ⭐ {restaurant.rating || "4.0"} &nbsp; 🪑 {totalTables} Tables</p>
          <button className="book-btn" onClick={() => setShowBooking(true)}>
            📅 Book a Table
          </button>
        </div>

        {galleryImages.length > 1 && (
          <div className="hero-dots">
            {galleryImages.map((_, idx) => (
              <button
                key={idx}
                className={`hero-dot ${idx === sliderIndex ? 'active' : ''}`}
                onClick={() => setSliderIndex(idx)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ===== MENU SECTION ===== */}
      <div className="menu-section">
        <h2>🍽️ Our Menu</h2>

        {menu.length === 0 ? (
          <p className="empty-text">No menu items available yet.</p>
        ) : (
          <div className="menu-grid">
            {menu.map((item) => (
              <div
                key={item._id}
                className="menu-card"
                onClick={() => navigate(`/dish/${item._id}`)}
              >
                <img
                  src={item.image}
                  alt={item.name}
                />
                <div className="menu-info">
                  <h4>{item.name}</h4>
                  <p>{item.description}</p>
                  <div className="menu-bottom">
                    <span>₹ {item.price}</span>
                    <button>Add</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== BOOKING MODAL ===== */}
      {showBooking && (
        <div className="booking-overlay" onClick={closeBookingModal}>
          <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeBookingModal}>
              ✕
            </button>

            {/* ===== STEP 1: BOOKING FORM ===== */}
            {bookingStep === "form" && (
              <>
                <h2>📅 Book a Table</h2>
                <p className="modal-subtitle">at {restaurant.name}</p>

                <form onSubmit={handleBooking}>
                  <input
                    type="text"
                    placeholder="Your Full Name *"
                    value={bookingForm.name}
                    required
                    onChange={(e) =>
                      setBookingForm({ ...bookingForm, name: e.target.value })
                    }
                  />

                  <input
                    type="email"
                    placeholder="Email Address"
                    value={bookingForm.email}
                    onChange={(e) =>
                      setBookingForm({ ...bookingForm, email: e.target.value })
                    }
                  />

                  <input
                    type="tel"
                    placeholder="Phone Number *"
                    value={bookingForm.phone}
                    required
                    onChange={(e) =>
                      setBookingForm({ ...bookingForm, phone: e.target.value })
                    }
                  />

                  <div className="form-row">
                    <div className="form-field">
                      <label>Date *</label>
                      <input
                        type="date"
                        value={bookingForm.date}
                        required
                        onChange={(e) =>
                          setBookingForm({ ...bookingForm, date: e.target.value, tableNo: "" })
                        }
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-field">
                      <label>From *</label>
                      <input
                        type="time"
                        value={bookingForm.timeFrom}
                        required
                        onChange={(e) =>
                          setBookingForm({ ...bookingForm, timeFrom: e.target.value, tableNo: "" })
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label>To *</label>
                      <input
                        type="time"
                        value={bookingForm.timeTo}
                        required
                        onChange={(e) =>
                          setBookingForm({ ...bookingForm, timeTo: e.target.value, tableNo: "" })
                        }
                      />
                    </div>
                  </div>

                  <div className="guests-row">
                    <label>Guests:</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={bookingForm.guests}
                      onChange={(e) =>
                        setBookingForm({ ...bookingForm, guests: e.target.value })
                      }
                    />
                  </div>

                  {/* TABLE PICKER */}
                  {bookingForm.date && bookingForm.timeFrom && bookingForm.timeTo && (
                    <div className="table-picker">
                      <label>Select Table:</label>

                      <div className="table-status-bar">
                        <span className="table-count available-count">
                          ✅ {totalTables - bookedTables.length} Available
                        </span>
                        <span className="table-count booked-count">
                          🔴 {bookedTables.length} Booked
                        </span>
                      </div>

                      <div className="table-filter-bar">
                        {["all", "available", "booked"].map((f) => (
                          <button
                            key={f}
                            type="button"
                            className={`table-filter-btn ${tableFilter === f ? "active" : ""}`}
                            onClick={() => setTableFilter(f)}
                          >
                            {f === "all" ? "All" : f === "available" ? "Available" : "Booked"}
                          </button>
                        ))}
                      </div>

                      {bookedTables.length === totalTables && (
                        <div className="all-booked-msg">
                          ⚠️ All tables are booked for this time slot. Try a different time.
                        </div>
                      )}

                      <div className="table-grid">
                        {Array.from({ length: totalTables }, (_, i) => i + 1)
                          .filter((num) => {
                            if (tableFilter === "available") return !bookedTables.includes(num);
                            if (tableFilter === "booked") return bookedTables.includes(num);
                            return true;
                          })
                          .map((num) => {
                            const isBooked = bookedTables.includes(num);
                            const isSelected = bookingForm.tableNo === num;
                            return (
                              <button
                                key={num}
                                type="button"
                                className={`table-btn ${isBooked ? "booked" : ""} ${isSelected ? "selected" : ""}`}
                                disabled={isBooked}
                                onClick={() => setBookingForm({ ...bookingForm, tableNo: num })}
                                title={isBooked ? `Table ${num} is booked` : `Select Table ${num}`}
                              >
                                <span className="table-btn-icon">🪑</span>
                                <span className="table-btn-num">{num}</span>
                                {isBooked && <span className="table-btn-label">BOOKED</span>}
                              </button>
                            );
                          })}
                      </div>
                      <div className="table-legend">
                        <span><span className="legend-dot available"></span> Available</span>
                        <span><span className="legend-dot booked-dot"></span> Booked</span>
                        <span><span className="legend-dot selected-dot"></span> Selected</span>
                      </div>
                    </div>
                  )}

                  <textarea
                    placeholder="Special Requests (optional)"
                    value={bookingForm.specialRequests}
                    onChange={(e) =>
                      setBookingForm({ ...bookingForm, specialRequests: e.target.value })
                    }
                    rows="2"
                  />

                  {/* Booking Fee Info */}
                  <div className="booking-fee-info">
                    <span>Booking Fee</span>
                    <span className="fee-amount">₹{bookingFee}</span>
                  </div>

                  <button type="submit" className="submit-booking-btn">
                    Book & Proceed to Payment →
                  </button>

                  {bookingMsg && <p className="booking-msg">{bookingMsg}</p>}
                </form>
              </>
            )}

            {/* ===== STEP 2: PAYMENT ===== */}
            {bookingStep === "payment" && lastBooking && (
              <div className="payment-step">
                <h2>💳 Complete Payment</h2>
                <p className="modal-subtitle">Booking confirmed! Pay to get your receipt.</p>

                {/* Booking Summary */}
                <div className="payment-summary">
                  <div className="summary-row">
                    <span>Restaurant</span>
                    <strong>{restaurant.name}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Date</span>
                    <strong>{lastBooking.date}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Time</span>
                    <strong>{lastBooking.timeFrom} – {lastBooking.timeTo}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Table</span>
                    <strong>🪑 Table {lastBooking.tableNo}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Guests</span>
                    <strong>{lastBooking.guests}</strong>
                  </div>
                  {restaurant.upiId && (
                    <div className="summary-row">
                      <span>Pays to (UPI)</span>
                      <strong style={{ fontFamily: "monospace" }}>{restaurant.upiId}</strong>
                    </div>
                  )}
                  <div className="summary-row total-row">
                    <span>Booking Fee</span>
                    <strong>₹{lastBooking.bookingAmount || bookingFee}</strong>
                  </div>
                </div>

                {/* Razorpay Pay Button */}
                <button
                  className="submit-booking-btn pay-btn"
                  onClick={handlePayment}
                  disabled={paying}
                >
                  {paying ? "Opening Payment..." : `Pay ₹${lastBooking.bookingAmount || bookingFee} via Razorpay`}
                </button>

                <p className="razorpay-trust">🔒 Secured by Razorpay · UPI · Cards · Net Banking</p>

                <button className="skip-pay-btn" onClick={closeBookingModal}>
                  Skip & Pay Later
                </button>

                {bookingMsg && <p className="booking-msg">{bookingMsg}</p>}
              </div>
            )}

            {/* ===== STEP 3: RECEIPT ===== */}
            {bookingStep === "receipt" && lastBooking && (
              <div className="receipt-step">
                <div className="receipt-success-icon">✅</div>
                <h2>Payment Successful!</h2>
                <p className="modal-subtitle">Show this receipt at the restaurant</p>

                <div className="receipt-card" id="booking-receipt">
                  <div className="receipt-header">
                    <div className="receipt-brand">Khamma Ghani</div>
                    <div className="receipt-id">Receipt #{lastBooking.receiptId}</div>
                  </div>

                  <div className="receipt-body">
                    <div className="receipt-row">
                      <span>Restaurant</span>
                      <strong>{lastBooking.restaurant?.name || restaurant.name}</strong>
                    </div>
                    <div className="receipt-row">
                      <span>Guest Name</span>
                      <strong>{lastBooking.name}</strong>
                    </div>
                    <div className="receipt-row">
                      <span>Date</span>
                      <strong>{lastBooking.date}</strong>
                    </div>
                    <div className="receipt-row">
                      <span>Time</span>
                      <strong>{lastBooking.timeFrom} – {lastBooking.timeTo}</strong>
                    </div>
                    <div className="receipt-row">
                      <span>Table</span>
                      <strong>🪑 Table {lastBooking.tableNo}</strong>
                    </div>
                    <div className="receipt-row">
                      <span>Guests</span>
                      <strong>{lastBooking.guests}</strong>
                    </div>
                    <div className="receipt-row">
                      <span>Payment Method</span>
                      <strong>{lastBooking.paymentMethod}</strong>
                    </div>
                    <div className="receipt-row">
                      <span>Payment ID</span>
                      <strong className="mono">{lastBooking.paymentId}</strong>
                    </div>
                    <div className="receipt-row total-row">
                      <span>Amount Paid</span>
                      <strong>₹{lastBooking.bookingAmount}</strong>
                    </div>
                  </div>

                  <div className="receipt-footer">
                    <span className="paid-stamp">✓ PAID</span>
                    <span className="receipt-date">
                      {new Date(lastBooking.paidAt).toLocaleString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                <button
                  className="submit-booking-btn"
                  onClick={() => {
                    const el = document.getElementById("booking-receipt");
                    const printWin = window.open("", "_blank");
                    printWin.document.write(`
                      <html><head><title>Receipt - ${lastBooking.receiptId}</title>
                      <style>
                        body { font-family: Inter, sans-serif; padding: 40px; color: #1a1a1a; }
                        .receipt-header { text-align: center; margin-bottom: 20px; border-bottom: 2px dashed #eee; padding-bottom: 16px; }
                        .receipt-brand { font-size: 24px; font-weight: 800; color: #ff6b00; }
                        .receipt-id { font-size: 14px; color: #888; margin-top: 4px; }
                        .receipt-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f5f5f5; }
                        .receipt-row span { color: #888; }
                        .receipt-row strong { color: #1a1a1a; }
                        .total-row { border-top: 2px solid #ff6b00; margin-top: 8px; padding-top: 12px; }
                        .total-row strong { color: #ff6b00; font-size: 18px; }
                        .receipt-footer { text-align: center; margin-top: 20px; padding-top: 16px; border-top: 2px dashed #eee; }
                        .paid-stamp { background: #f0fdf4; color: #16a34a; padding: 6px 20px; border-radius: 8px; font-weight: 800; font-size: 16px; }
                        .mono { font-family: monospace; }
                      </style></head><body>${el.innerHTML}</body></html>
                    `);
                    printWin.document.close();
                    printWin.print();
                  }}
                >
                  🖨️ Print Receipt
                </button>

                <button className="skip-pay-btn" onClick={closeBookingModal}>
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}