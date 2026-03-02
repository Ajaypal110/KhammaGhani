import { useEffect, useState, useRef } from "react";
import API from "../api/axios";
import "../styles/profile.css";

/* ================================================================
   CROP MODAL — Instagram-style circular crop with zoom + drag
================================================================ */
function CropModal({ imageSrc, onCrop, onCancel }) {
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imgRef = useRef(null);

  const CANVAS_SIZE = 300;
  const CIRCLE_RADIUS = 130;

  useEffect(() => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      imgRef.current = img;
      // Auto-fit: scale image so smallest dimension fills circle
      const minDim = Math.min(img.width, img.height);
      const fitZoom = (CIRCLE_RADIUS * 2) / minDim;
      setZoom(fitZoom);
      drawCanvas(fitZoom, { x: 0, y: 0 });
    };
  }, [imageSrc]);

  useEffect(() => { drawCanvas(zoom, offset); }, [zoom, offset]);

  const drawCanvas = (z, off) => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

    ctx.fillStyle = "#f5f5f5";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    const imgW = img.width * z;
    const imgH = img.height * z;
    const drawX = (CANVAS_SIZE - imgW) / 2 + off.x;
    const drawY = (CANVAS_SIZE - imgH) / 2 + off.y;

    ctx.drawImage(img, drawX, drawY, imgW, imgH);

    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CIRCLE_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CIRCLE_RADIUS, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, drawX, drawY, imgW, imgH);
    ctx.restore();

    ctx.strokeStyle = "#ff6b00";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CIRCLE_RADIUS, 0, Math.PI * 2);
    ctx.stroke();
  };

  const handleMouseDown = (e) => {
    setDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };
  const handleMouseMove = (e) => {
    if (!dragging) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleMouseUp = () => setDragging(false);

  const handleTouchStart = (e) => {
    const t = e.touches[0];
    setDragging(true);
    setDragStart({ x: t.clientX - offset.x, y: t.clientY - offset.y });
  };
  const handleTouchMove = (e) => {
    if (!dragging) return;
    const t = e.touches[0];
    setOffset({ x: t.clientX - dragStart.x, y: t.clientY - dragStart.y });
  };

  const handleCrop = () => {
    const img = imgRef.current;
    if (!img) return;
    const exportCanvas = document.createElement("canvas");
    const size = CIRCLE_RADIUS * 2;
    exportCanvas.width = size;
    exportCanvas.height = size;
    const ctx = exportCanvas.getContext("2d");

    ctx.beginPath();
    ctx.arc(CIRCLE_RADIUS, CIRCLE_RADIUS, CIRCLE_RADIUS, 0, Math.PI * 2);
    ctx.clip();

    const imgW = img.width * zoom;
    const imgH = img.height * zoom;
    const drawX = (CANVAS_SIZE - imgW) / 2 + offset.x - (CANVAS_SIZE / 2 - CIRCLE_RADIUS);
    const drawY = (CANVAS_SIZE - imgH) / 2 + offset.y - (CANVAS_SIZE / 2 - CIRCLE_RADIUS);

    ctx.drawImage(img, drawX, drawY, imgW, imgH);
    exportCanvas.toBlob((blob) => { if (blob) onCrop(blob); }, "image/jpeg", 0.92);
  };

  return (
    <div className="crop-overlay" onClick={onCancel}>
      <div className="crop-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Crop Your Photo</h3>
        <p className="crop-subtitle">Drag to reposition • Zoom to resize</p>
        <div className="crop-canvas-wrapper">
          <canvas
            ref={canvasRef}
            className="crop-canvas"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
          />
        </div>
        <div className="crop-zoom">
          <span>🔍</span>
          <input
            type="range"
            min="0.1"
            max="4"
            step="0.05"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
          />
          <span>{Math.round(zoom * 100)}%</span>
        </div>
        <div className="crop-actions">
          <button className="crop-cancel" onClick={onCancel}>Cancel</button>
          <button className="crop-confirm" onClick={handleCrop}>✓ Apply</button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   PROFILE PAGE
================================================================ */
export default function Profile() {
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState({ name: "", email: "", phone: "", dob: "" });
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState("");
  const [showReceipt, setShowReceipt] = useState(null); // booking ID to show receipt for
  const [payingBooking, setPayingBooking] = useState(null);
  const [payMethod, setPayMethod] = useState("UPI");
  const [messageType, setMessageType] = useState("success"); // "success" or "error"
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Crop modal state
  const [cropImage, setCropImage] = useState(null);
  const [showCrop, setShowCrop] = useState(false);

  // Change password state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwdMessage, setPwdMessage] = useState("");
  const [pwdMessageType, setPwdMessageType] = useState("error");
  const [changingPwd, setChangingPwd] = useState(false);

  const showMsg = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
  };

  // SELECT IMAGE → SHOW CROP
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCropImage(reader.result);
      setShowCrop(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // CROP DONE → UPLOAD TO CLOUDINARY
  const handleCropDone = async (blob) => {
    setShowCrop(false);
    setCropImage(null);
    setUploading(true);
    const formData = new FormData();
    formData.append("image", blob, "profile.jpg");
    try {
      const { data } = await API.post("/users/upload-profile-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser((prev) => ({ ...prev, profileImage: data.image }));
      showMsg("Profile photo updated!");
    } catch {
      showMsg("Failed to upload photo", "error");
    } finally {
      setUploading(false);
    }
  };

  // FETCH USER DETAILS
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await API.get("/auth/me");
        setUser(data);
      } catch {
        showMsg("Failed to load profile", "error");
      }
    };
    fetchProfile();
    fetchBookings();
  }, []);

  // FETCH MY BOOKINGS
  const fetchBookings = async () => {
    try {
      const { data } = await API.get("/reservations/my");
      setBookings(data);
    } catch (err) {
      console.log("Bookings fetch error:", err);
    }
  };

  // CANCEL BOOKING
  const cancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await API.put(`/reservations/my/${bookingId}/cancel`);
      fetchBookings();
      showMsg("Booking cancelled successfully");
    } catch (err) {
      showMsg(err.response?.data?.message || "Failed to cancel booking", "error");
    }
  };

  // UPDATE PROFILE
  const updateProfile = async () => {
    setSaving(true);
    setMessage("");
    try {
      await API.put("/auth/update-profile", {
        name: user.name,
        phone: user.phone,
        dob: user.dob,
      });
      showMsg("Profile updated successfully ✓");
    } catch {
      showMsg("Update failed", "error");
    } finally {
      setSaving(false);
    }
  };

  // PAY FOR BOOKING (RAZORPAY)
  const payForBooking = async (bookingId) => {
    setPayingBooking(bookingId);
    try {
      // Step 1: Create Razorpay order
      const { data: orderData } = await API.post(`/reservations/create-order/${bookingId}`);

      // Step 2: Open Razorpay popup
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: orderData.restaurantName,
        description: "Table Booking Fee",
        order_id: orderData.orderId,
        theme: { color: "#ff6b00" },
        handler: async (response) => {
          // Step 3: Verify payment
          try {
            await API.post(`/reservations/verify-payment/${bookingId}`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            fetchBookings();
            showMsg("Payment successful! Receipt generated.");
          } catch {
            showMsg("Payment verification failed", "error");
          }
          setPayingBooking(null);
        },
        modal: {
          ondismiss: () => setPayingBooking(null),
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      showMsg(err.response?.data?.message || "Payment failed", "error");
      setPayingBooking(null);
    }
  };

  // CHANGE PASSWORD
  const handleChangePassword = async () => {
    setPwdMessage("");
    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwdMessage("All fields are required");
      setPwdMessageType("error");
      return;
    }
    if (newPassword.length < 6) {
      setPwdMessage("Password must be at least 6 characters");
      setPwdMessageType("error");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdMessage("New passwords don't match");
      setPwdMessageType("error");
      return;
    }

    setChangingPwd(true);
    try {
      const { data } = await API.put("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      setPwdMessage(data.message);
      setPwdMessageType("success");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => {
        setShowPasswordModal(false);
        setPwdMessage("");
      }, 2000);
    } catch (err) {
      setPwdMessage(err.response?.data?.message || "Failed to change password");
      setPwdMessageType("error");
    } finally {
      setChangingPwd(false);
    }
  };

  // Auto-clear message
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="profile-page">
      {/* CROP MODAL */}
      {showCrop && cropImage && (
        <CropModal
          imageSrc={cropImage}
          onCrop={handleCropDone}
          onCancel={() => { setShowCrop(false); setCropImage(null); }}
        />
      )}

      {/* CHANGE PASSWORD MODAL */}
      {showPasswordModal && (
        <div className="crop-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="crop-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Change Password</h3>
            <p className="crop-subtitle">Enter your current and new password</p>

            <div className="pwd-form">
              <input
                type="password"
                placeholder="Current Password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              />
              <input
                type="password"
                placeholder="New Password (min 6 chars)"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              />

              {pwdMessage && (
                <p className={`pwd-msg ${pwdMessageType}`}>{pwdMessage}</p>
              )}

              <div className="crop-actions">
                <button className="crop-cancel" onClick={() => setShowPasswordModal(false)}>Cancel</button>
                <button className="crop-confirm" onClick={handleChangePassword} disabled={changingPwd}>
                  {changingPwd ? "Changing..." : "Change Password"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <div className="profile-sidebar">
        <h3>My Account</h3>
        <div
          className={activeTab === "profile" ? "active" : ""}
          onClick={() => setActiveTab("profile")}
        >
          👤 Profile
        </div>
        <div
          className={activeTab === "bookings" ? "active" : ""}
          onClick={() => { setActiveTab("bookings"); fetchBookings(); }}
        >
          📅 My Bookings
        </div>
        <div
          className={activeTab === "orders" ? "active" : ""}
          onClick={() => setActiveTab("orders")}
        >
          📦 My Orders
        </div>
        <div
          className={activeTab === "settings" ? "active" : ""}
          onClick={() => setActiveTab("settings")}
        >
          ⚙️ Settings
        </div>
      </div>

      {/* CONTENT */}
      <div className="profile-content">
        {message && (
          <p className={`profile-message ${messageType === "error" ? "error" : ""}`}>
            {message}
          </p>
        )}

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <>
            <h2>Profile Information</h2>

            {/* PROFILE PHOTO */}
            <div className="profile-photo-section">
              <div className="profile-avatar-wrapper" onClick={() => document.getElementById("profile-file-input").click()}>
                {user.profileImage ? (
                  <img src={user.profileImage} alt="Profile" className="profile-avatar" />
                ) : (
                  <div className="profile-avatar-placeholder">
                    {user.name ? user.name.charAt(0).toUpperCase() : "?"}
                  </div>
                )}
                <div className="avatar-overlay">
                  <span>📷</span>
                </div>
                {uploading && (
                  <div className="avatar-loading">
                    <div className="spinner"></div>
                  </div>
                )}
              </div>
              <input
                id="profile-file-input"
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageSelect}
              />
              <div className="profile-photo-info">
                <p className="photo-name">{user.name || "Your Name"}</p>
                <p className="photo-email">{user.email}</p>
                <button
                  className="change-photo-btn"
                  onClick={() => document.getElementById("profile-file-input").click()}
                >
                  Change Photo
                </button>
              </div>
            </div>

            <div className="profile-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={user.name || ""}
                  onChange={(e) => setUser({ ...user, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" placeholder="Email" value={user.email || ""} disabled />
              </div>
              <div className="form-group">
                <label>Mobile Number</label>
                <input
                  type="text"
                  placeholder="Mobile Number"
                  value={user.phone || ""}
                  onChange={(e) => setUser({ ...user, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  value={user.dob || ""}
                  onChange={(e) => setUser({ ...user, dob: e.target.value })}
                />
              </div>
              <button onClick={updateProfile} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>

            {/* SECURITY — CHANGE PASSWORD */}
            <div className="reset-password">
              <h3>Security</h3>
              <button className="danger" onClick={() => setShowPasswordModal(true)}>
                🔒 Change Password
              </button>
            </div>
          </>
        )}

        {/* MY BOOKINGS TAB */}
        {activeTab === "bookings" && (
          <div className="my-bookings">
            <h2>📅 My Table Bookings</h2>

            {bookings.length === 0 ? (
              <p className="empty-msg">No bookings yet. Book a table at any restaurant!</p>
            ) : (
              <div className="bookings-list">
                {bookings.map((b) => (
                  <div key={b._id} className="booking-card">
                    <div className="booking-card-header">
                      <h3>{b.restaurant?.name || "Restaurant"}</h3>
                      <span className={`booking-status status-${b.status?.toLowerCase()}`}>
                        {b.status}
                      </span>
                    </div>
                    <div className="booking-card-body">
                      <div className="booking-detail">
                        <span className="detail-label">📅 Date</span>
                        <span className="detail-value">{b.date}</span>
                      </div>
                      <div className="booking-detail">
                        <span className="detail-label">⏰ Time</span>
                        <span className="detail-value">{b.timeFrom} – {b.timeTo}</span>
                      </div>
                      <div className="booking-detail">
                        <span className="detail-label">🪑 Table</span>
                        <span className="detail-value">Table {b.tableNo}</span>
                      </div>
                      <div className="booking-detail">
                        <span className="detail-label">👥 Guests</span>
                        <span className="detail-value">{b.guests}</span>
                      </div>
                      <div className="booking-detail">
                        <span className="detail-label">💰 Payment</span>
                        <span className={`detail-value payment-badge ${b.paymentStatus === "Paid" ? "paid" : "unpaid"}`}>
                          {b.paymentStatus === "Paid" ? "✓ Paid" : "Unpaid"}
                          {b.bookingAmount ? ` (₹${b.bookingAmount})` : ""}
                        </span>
                      </div>
                      {b.paymentStatus === "Paid" && (
                        <div className="booking-detail">
                          <span className="detail-label">🧾 Receipt</span>
                          <span className="detail-value" style={{ fontFamily: "monospace", fontSize: 12 }}>{b.receiptId}</span>
                        </div>
                      )}
                      {b.specialRequests && (
                        <div className="booking-detail full-width">
                          <span className="detail-label">📝 Note</span>
                          <span className="detail-value">{b.specialRequests}</span>
                        </div>
                      )}
                    </div>
                    <div className="booking-card-footer">
                      <span>
                        Booked on {new Date(b.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </span>
                      <div style={{ display: "flex", gap: 6 }}>
                        {b.paymentStatus === "Paid" && (
                          <button
                            className="view-receipt-btn"
                            onClick={() => setShowReceipt(showReceipt === b._id ? null : b._id)}
                          >
                            🧾 {showReceipt === b._id ? "Hide" : "View"} Receipt
                          </button>
                        )}
                        {b.paymentStatus !== "Paid" && b.status !== "Cancelled" && (
                          <button
                            className="pay-now-btn"
                            onClick={() => payForBooking(b._id)}
                            disabled={payingBooking === b._id}
                          >
                            {payingBooking === b._id ? "Paying..." : "💳 Pay Now"}
                          </button>
                        )}
                        {(b.status === "Pending" || b.status === "Confirmed") && (
                          <button className="cancel-booking-btn" onClick={() => cancelBooking(b._id)}>
                            ✕ Cancel
                          </button>
                        )}
                      </div>
                    </div>

                    {/* INLINE RECEIPT */}
                    {showReceipt === b._id && b.paymentStatus === "Paid" && (
                      <div className="inline-receipt">
                        <div className="receipt-card" id={`receipt-${b._id}`}>
                          <div className="receipt-header">
                            <div className="receipt-brand">Khamma Ghani</div>
                            <div className="receipt-id">Receipt #{b.receiptId}</div>
                          </div>
                          <div className="receipt-body">
                            <div className="receipt-row"><span>Restaurant</span><strong>{b.restaurant?.name}</strong></div>
                            <div className="receipt-row"><span>Guest</span><strong>{b.name}</strong></div>
                            <div className="receipt-row"><span>Date</span><strong>{b.date}</strong></div>
                            <div className="receipt-row"><span>Time</span><strong>{b.timeFrom} – {b.timeTo}</strong></div>
                            <div className="receipt-row"><span>Table</span><strong>Table {b.tableNo}</strong></div>
                            <div className="receipt-row"><span>Guests</span><strong>{b.guests}</strong></div>
                            <div className="receipt-row"><span>Method</span><strong>{b.paymentMethod}</strong></div>
                            <div className="receipt-row"><span>Payment ID</span><strong style={{ fontFamily: 'monospace', fontSize: 12 }}>{b.paymentId}</strong></div>
                            <div className="receipt-row total-row"><span>Amount Paid</span><strong>₹{b.bookingAmount}</strong></div>
                          </div>
                          <div className="receipt-footer">
                            <span className="paid-stamp">✓ PAID</span>
                            <span className="receipt-date">{new Date(b.paidAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                        </div>
                        <button className="print-receipt-btn" onClick={() => {
                          const el = document.getElementById(`receipt-${b._id}`);
                          const w = window.open("", "_blank");
                          w.document.write(`<html><head><title>Receipt - ${b.receiptId}</title><style>body{font-family:Inter,sans-serif;padding:40px;color:#1a1a1a}.receipt-header{text-align:center;margin-bottom:20px;border-bottom:2px dashed #eee;padding-bottom:16px}.receipt-brand{font-size:24px;font-weight:800;color:#ff6b00}.receipt-id{font-size:14px;color:#888;margin-top:4px}.receipt-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f5f5f5}.receipt-row span{color:#888}.receipt-row strong{color:#1a1a1a}.total-row{border-top:2px solid #ff6b00;margin-top:8px;padding-top:12px}.total-row strong{color:#ff6b00;font-size:18px}.receipt-footer{text-align:center;margin-top:20px;padding-top:16px;border-top:2px dashed #eee}.paid-stamp{background:#f0fdf4;color:#16a34a;padding:6px 20px;border-radius:8px;font-weight:800;font-size:16px}</style></head><body>${el.innerHTML}</body></html>`);
                          w.document.close();
                          w.print();
                        }}>🖨️ Print Receipt</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PLACEHOLDERS */}
        {activeTab !== "profile" && activeTab !== "bookings" && (
          <h2>Coming Soon 🚧</h2>
        )}
      </div>
    </div>
  );
}
