import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import Loader from "../components/Loader";
import "../styles/restaurantDetails.css";
import { useCart } from "../context/CartContext";
import DietaryIcon from "../components/DietaryIcon";
import VariationModal from "../components/VariationModal";
import { FiHeart } from "react-icons/fi";

export default function RestaurantDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cartItems, addToCart, removeFromCart } = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);

  /* Reviews State */
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ totalReviews: 0, avgRating: 0 });

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
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedItemForModal, setSelectedItemForModal] = useState(null);
  const [userFavorites, setUserFavorites] = useState([]);

  const categoriesWithImages = [
    { name: "All", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800" },
    { name: "Starters", image: "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&q=80&w=800" },
    { name: "Main Course", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=800" },
    { name: "Rajasthani", image: "https://upload.wikimedia.org/wikipedia/commons/b/b8/Dal_bati_churma.jpg" },
    { name: "Chinese", image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=800" },
    { name: "Thai", image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=800" },
    { name: "Desserts", image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=800" },
    { name: "Beverages", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=800" },
    { name: "Thali", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800" },
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchData = async () => {
      try {
        const res = await API.get(`/restaurants/${id}`);
        setRestaurant(res.data);

        const menuRes = await API.get(`/menu/restaurant/${id}`);
        setMenu(menuRes.data);

        const imgRes = await API.get(`/restaurants/${id}/images`);
        setGalleryImages(imgRes.data || []);
        
        try {
          const revRes = await API.get(`/reviews/Restaurant/${id}`);
          setReviews(revRes.data.reviews || []);
          setReviewStats(revRes.data.stats || { totalReviews: 0, avgRating: 0 });
        } catch (e) {
          console.log("Error fetching reviews", e);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const { data } = await API.get("/auth/me");
          setUserFavorites(data.favorites || []);
        } catch (err) {
          console.error("Error fetching user:", err);
        }
      }
    };
    fetchUser();
  }, [id]);

  const handleToggleFavorite = async (e, menuId) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Optimistic UI update
    const isFavorited = userFavorites.some(fav => (fav._id || fav) === menuId);
    let newFavs;
    if (isFavorited) {
      newFavs = userFavorites.filter(fav => (fav._id || fav) !== menuId);
    } else {
      newFavs = [...userFavorites, menuId]; 
    }
    setUserFavorites(newFavs);

    try {
      const { data } = await API.post(`/auth/favorites/${menuId}`);
      setUserFavorites(data.favorites);
    } catch (err) {
      console.error("Toggle favorite error:", err);
    }
  };

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

  const sliderRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  /* Update active index on scroll */
  const handleScroll = () => {
    if (sliderRef.current) {
      const slider = sliderRef.current;
      const index = Math.round(slider.scrollLeft / slider.clientWidth);
      setActiveIndex(index);
    }
  };

  /* Auto-slide effect */
  useEffect(() => {
    if (!galleryImages.length) return;
    
    const interval = setInterval(() => {
      if (sliderRef.current && !isPaused) {
        const slider = sliderRef.current;
        const maxScroll = slider.scrollWidth - slider.clientWidth;
        
        if (slider.scrollLeft >= maxScroll - 10) {
          slider.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          slider.scrollBy({ left: slider.clientWidth, behavior: "smooth" });
        }
      }
    }, 1500); // 1.5-second interval
    
    return () => clearInterval(interval);
  }, [galleryImages, isPaused]);

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

      {/* ===== HERO SECTION (LIGHT THEME LIKE MOCKUP) ===== */}
      <div className="restaurant-hero-light">
        <div className="hero-light-content">
          {/* Left Text Side */}
          <div className="hero-light-text-area">
            <div className="hero-light-accent-line"></div>
            <div className="hero-light-text-content">
              <h1 className="hero-light-title-main">{restaurant.name}</h1>
              
              
              <p className="hero-light-desc">
                Experience authentic flavors, beautiful ambiance, and world-class service.
                Enjoy our curated menu and book your table today for an unforgettable dining experience.
              </p>
              
              <div className="hero-light-meta">
                {reviewStats.avgRating > 0 ? (
                  <span className="hero-light-rating">⭐ {reviewStats.avgRating} <span className="hero-light-rating-count">({reviewStats.totalReviews})</span></span>
                ) : (
                  <span className="hero-light-rating">⭐ {restaurant.rating || "4.5"}</span>
                )}
                <span className="hero-light-tables">🪑 {totalTables} Tables</span>
                {restaurant.address && (
                  <span className="hero-light-address" style={{ marginLeft: "12px", color: "#64748b", fontSize: "14px", fontWeight: "500" }}>
                    📍 {restaurant.address}
                  </span>
                )}
              </div>
              
              <button className="hero-light-btn" onClick={() => setShowBooking(true)}>
                Book a Table
              </button>
            </div>
          </div>
          
          {/* Right Image Side: Slider */}
          <div className="hero-light-image-area">
             {galleryImages.length > 0 ? (
               <div 
                 className="hero-gallery-container"
                 onMouseEnter={() => setIsPaused(true)}
                 onMouseLeave={() => setIsPaused(false)}
               >
                 <div className="hero-gallery-slider" ref={sliderRef} onScroll={handleScroll}>
                   {galleryImages.map((img, index) => (
                     <div key={index} className="gallery-slide">
                       <img src={img} alt={`Gallery ${index + 1}`} />
                     </div>
                   ))}
                 </div>
                 
                 {/* Dot Indicators */}
                 {galleryImages.length > 1 && (
                   <div className="slider-dots">
                     {galleryImages.map((_, i) => (
                       <div 
                         key={i} 
                         className={`dot ${activeIndex === i ? 'active' : ''}`}
                         onClick={() => sliderRef.current.scrollTo({ left: i * sliderRef.current.clientWidth, behavior: 'smooth' })}
                       ></div>
                     ))}
                   </div>
                 )}
                 {galleryImages.length > 1 && (
                   <>
                    <button className="slider-nav prev" onClick={() => sliderRef.current.scrollBy({left: -sliderRef.current.clientWidth, behavior: 'smooth'})}>❮</button>
                    <button className="slider-nav next" onClick={() => sliderRef.current.scrollBy({left: sliderRef.current.clientWidth, behavior: 'smooth'})}>❯</button>
                   </>
                 )}
               </div>
             ) : (
                <div className="hero-placeholder-light">🍽️</div>
             )}
          </div>
        </div>
        
      </div>

      {/* ===== MENU SECTION ===== */}
      <div className="menu-section">
        <h2>🍽️ Our Menu</h2>

        {/* Categories Bar (Visual Cards below heading) */}
        <div className="hero-categories-bar-wrapper">
          <div className="hero-categories-bar" style={{ paddingRight: "100px" }}>
            {categoriesWithImages.map((cat) => (
              <div
                key={cat.name}
                className={`home-category-card ${selectedCategory === cat.name ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat.name)}
              >
                <div className="category-card-icon">
                  <img src={cat.image} alt={cat.name} />
                </div>
                <span className="category-card-name">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>

        {menu.length === 0 ? (
          <p className="empty-text">No menu items available yet.</p>
        ) : (
          <div className="menu-grid">
            {menu
              .filter((item) => selectedCategory === "All" || item.category === selectedCategory)
              .map((item) => {
                const cartItem = cartItems.find((ci) => ci._id === item._id);
                const qty = cartItem ? cartItem.qty : 0;

                return (
                  <div key={item._id} className="res-card">
                    <div className="res-card-img-box" onClick={() => navigate(`/dish/${item._id}`)}>
                      <img src={item.image} alt={item.name} />
                      <button 
                        className="fav-heart-btn"
                        onClick={(e) => handleToggleFavorite(e, item._id)}
                      >
                        {(() => {
                          const isLiked = userFavorites.some(fav => (fav._id || fav) === item._id);
                          return (
                            <FiHeart 
                              fill={isLiked ? "#ef4444" : "none"} 
                              color={isLiked ? "#ef4444" : "#64748b"} 
                              size={18} 
                            />
                          );
                        })()}
                      </button>
                    </div>

                    <div className="res-card-info" onClick={() => navigate(`/dish/${item._id}`)}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                        <DietaryIcon isVeg={item.isVeg} size={14} />
                        <h4 style={{ margin: 0 }}>{item.name}</h4>
                      </div>
                      <div className="res-stars" style={{ color: "#16a34a", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                        ★ 4.8 <span style={{ color: "#94a3b8", fontWeight: "400" }}>(120+)</span>
                      </div>
                      
                      {(item.variations?.length > 0 || item.contents) && (
                        <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "8px", background: "#f8fafc", padding: "2px 6px", borderRadius: "4px", display: "inline-block" }}>
                          {item.category === "Thali" ? "📦 " : ["Beverages", "Desserts"].includes(item.category) ? "🥤 Sizes: " : "⚖️ Portions: "}
                          {item.variations?.length > 0 
                            ? item.variations.map(v => v.name).join(", ") 
                            : item.contents}
                        </div>
                      )}

                      <div className="res-meta mt-2" style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span className="res-price">₹ {item.price || (item.variations?.length > 0 ? item.variations[0].price : "0")}</span>
                        
                        <div onClick={(e) => e.stopPropagation()}>
                          {qty > 0 && !(item.variations?.length > 0 || item.category === "Roti") ? (
                             <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#f1f5f9", borderRadius: "8px", padding: "4px 8px" }}>
                               <button style={{ border: "none", background: "none", cursor: "pointer", color: "#64748b", fontWeight: "bold" }} onClick={() => removeFromCart(item._id)}>−</button>
                               <span style={{ fontWeight: "600", fontSize: "14px" }}>{qty}</span>
                               <button style={{ border: "none", background: "none", cursor: "pointer", color: "#ff6b00", fontWeight: "bold" }} onClick={() => addToCart(item, item.restaurant || id)}>+</button>
                             </div>
                           ) : (
                             <button 
                               style={{ background: "#ff6b00", color: "#fff", border: "none", borderRadius: "8px", padding: "6px 16px", fontWeight: "600", fontSize: "13px", cursor: "pointer" }}
                               onClick={() => {
                                 if (item.variations?.length > 0 || item.category === "Roti") {
                                   setSelectedItemForModal(item);
                                 } else {
                                   addToCart(item, item.restaurant || id);
                                 }
                               }}
                             >
                               ADD
                             </button>
                           )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      <VariationModal 
        isOpen={!!selectedItemForModal}
        onClose={() => setSelectedItemForModal(null)}
        item={selectedItemForModal}
        onConfirm={(item, variant, qty, addOns, spice, inst) => addToCart(item, id, variant, qty, addOns, spice, inst)}
      />

      {/* ===== REVIEWS SECTION ===== */}
      {reviews.length > 0 && (
        <div className="reviews-section-wrapper">
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "30px"}}>
            <div>
              <h2 style={{marginBottom: "8px", fontSize: "28px", fontWeight: "800", color: "#1e293b"}}>What our guests say</h2>
              <div style={{display: "flex", alignItems: "center", gap: "12px"}}>
                 <span style={{fontSize: "36px", fontWeight: "800", color: "#1e293b"}}>{reviewStats.avgRating > 0 ? reviewStats.avgRating : (restaurant.rating || "4.0")}</span>
                 <div>
                   <div style={{color: "#fbbf24", fontSize: "18px", marginBottom: "2px"}}>
                      {'★'.repeat(Math.round(reviewStats.avgRating || restaurant.rating || 4))}
                      <span style={{color: "#cbd5e1"}}>{'★'.repeat(5 - Math.round(reviewStats.avgRating || restaurant.rating || 4))}</span>
                   </div>
                   <div style={{fontSize: "13px", color: "#64748b", fontWeight: "500"}}>
                     Based on {reviewStats.totalReviews} verified reviews
                   </div>
                 </div>
              </div>
            </div>
            
            <div style={{fontSize: "12px", color: "#64748b", background: "rgba(255,255,255,0.7)", padding: "10px 16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.5)", fontWeight: "500"}}>
              ℹ️ Only diners with verified completing bookings can leave reviews.
            </div>
          </div>

          <div className="reviews-masonry-grid">
             {reviews.map(review => (
               <div key={review._id} className="review-card">
                 <div className="review-stars">
                   {'★'.repeat(review.rating)}<span className="review-empty-star">{'★'.repeat(5 - review.rating)}</span>
                 </div>
                 
                 <div className="review-title">
                   {review.rating >= 4 ? "Fantastic Experience!" : review.rating === 3 ? "It was okay" : "Could be better"}
                 </div>
                 
                 <p className="review-text">
                   {review.comment || "The food and service were notable. Highly recommend checking them out when you are in the area."}
                 </p>
                 
                 <div className="review-author">
                   {review.user?.profileImage ? (
                      <img src={review.user.profileImage} alt="User" className="review-author-img" />
                   ) : (
                      <div className="review-author-fallback">
                        {review.user?.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                   )}
                   <div className="review-author-info">
                     <span className="review-author-name">{review.user?.name || "Guest"}</span>
                     <span className="review-author-date">{new Date(review.createdAt).toLocaleDateString()}</span>
                   </div>
                 </div>
               </div>
             ))}
          </div>
        </div>
      )}

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