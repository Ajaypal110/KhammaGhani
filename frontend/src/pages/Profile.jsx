import { useEffect, useState, useRef } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Loader from "../components/Loader";
import "../styles/profile.css";
import ConfirmModal from "../components/ConfirmModal";
import "../styles/orders.css";
import { IoEllipsisVertical, IoChevronForward, IoChevronBack } from "react-icons/io5";
import { FiShoppingBag, FiMapPin, FiHeart, FiLock, FiLogOut, FiCalendar } from "react-icons/fi";

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
  const navigate = useNavigate();
  const { addToCart, clearCart } = useCart();
  const [activeTab, setActiveTab] = useState(window.innerWidth <= 768 ? "menu" : "profile");
  const [cancelBookingId, setCancelBookingId] = useState(null);
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [user, setUser] = useState({ name: "", email: "", phone: "", dob: "" });
  const [bookings, setBookings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [showReceipt, setShowReceipt] = useState(null); // booking ID or order ID
  const [payingBooking, setPayingBooking] = useState(null);
  const [payMethod, setPayMethod] = useState("UPI");
  const [messageType, setMessageType] = useState("success"); // "success" or "error"
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Addresses state
  const [newAddressLabel, setNewAddressLabel] = useState("Home");
  const [newAddressText, setNewAddressText] = useState("");

  // Crop modal state
  const [cropImage, setCropImage] = useState(null);
  const [showCrop, setShowCrop] = useState(false);

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    targetType: "",
    targetId: "",
    rating: 4,
    comment: "",
    sourceModel: "",
    sourceId: "",
    targetName: ""
  });
  const [submittingReview, setSubmittingReview] = useState(false);

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
    // Add class for handling global mobile styling (hiding navbar/footer only on mobile)
    document.body.classList.add("profile-mobile-view");

    const fetchData = async () => {
      try {
        setLoading(true);
        const { data } = await API.get("/auth/me");
        setUser(data);
        await Promise.all([fetchBookings(), fetchOrders()]);
      } catch {
        showMsg("Failed to load profile", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    return () => {
      document.body.classList.remove("profile-mobile-view");
    };
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

  // FETCH MY ORDERS
  const fetchOrders = async () => {
    try {
      const { data } = await API.get("/orders/myorders");
      // Sort the latest orders first based on the createdAt date string
      const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(sortedData);
    } catch (err) {
      console.log("Orders fetch error:", err);
    }
  };

  // REORDER FUNCTIONALITY
  const handleReorder = (order) => {
    if (window.confirm("This will clear your current cart and add these items. Proceed?")) {
      clearCart();
      order.items.forEach((item) => {
        let itemPrice = 0;
        if (item.price) itemPrice = item.price;
        else if (item.menuId && item.menuId.price) itemPrice = item.menuId.price;
        addToCart(
          { ...item.menuId, price: itemPrice }, 
          order.restaurant._id, 
          item.variant, 
          item.qty, 
          item.addOns, 
          item.spiceLevel, 
          item.instructions
        );
      });
      navigate("/cart");
    }
  };

  // CANCEL BOOKING
  const cancelBooking = (bookingId) => {
    setCancelBookingId(bookingId);
  };

  const confirmCancelBooking = async () => {
    if (!cancelBookingId) return;
    try {
      await API.put(`/reservations/my/${cancelBookingId}/cancel`);
      fetchBookings();
      showMsg("Booking cancelled successfully");
    } catch (err) {
      showMsg(err.response?.data?.message || "Failed to cancel booking", "error");
    } finally {
      setCancelBookingId(null);
    }
  };

  // CANCEL ORDER
  const handleCancelOrder = async () => {
    if (!cancelOrderId) return;
    try {
      await API.put(`/orders/${cancelOrderId}/cancel`, { reason: cancelReason });
      fetchOrders();
      showMsg("Order cancelled successfully");
    } catch (err) {
      showMsg(err.response?.data?.message || "Failed to cancel order", "error");
    } finally {
      setCancelOrderId(null);
      setCancelReason("");
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
        addresses: user.addresses,
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

  // PAY FOR ORDER (RAZORPAY)
  const payForOrder = async (orderId) => {
    try {
      // Step 1: Create Razorpay order
      const { data: rzpData } = await API.post(`/orders/razorpay-order/${orderId}`);

      // Step 2: Open Razorpay popup
      const options = {
        key: rzpData.keyId,
        amount: rzpData.amount,
        currency: rzpData.currency,
        name: rzpData.restaurantName,
        description: "Food Delivery Payment",
        order_id: rzpData.orderId,
        theme: { color: "#ff6b00" },
        handler: async (response) => {
          try {
            await API.post(`/orders/verify-payment/${orderId}`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            showMsg("Payment Successful! Order Confirmed.");
            fetchOrders();
          } catch (err) {
            showMsg("Payment verification failed.", "error");
          }
        },
        modal: {
          ondismiss: () => {
            showMsg("Payment Cancelled.", "error");
          },
        },
      };

      if (!window.Razorpay) {
        showMsg("Payment system not loaded. Please refresh the page.", "error");
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        showMsg(`Payment failed: ${response.error.description || 'Unknown error'}`, "error");
      });
      rzp.open();
    } catch (err) {
      showMsg(err.response?.data?.message || "Payment initiation failed", "error");
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

  // SUBMIT REVIEW
  const handleReviewSubmit = async () => {
    if (!reviewData.rating) return showMsg("Please select a rating", "error");
    setSubmittingReview(true);
    try {
      await API.post("/reviews", reviewData);
      showMsg("Review submitted successfully!");
      setShowReviewModal(false);
      // Refresh the active tab lists
      if (activeTab === "bookings") fetchBookings();
      if (activeTab === "orders") fetchOrders();
    } catch (err) {
      showMsg(err.response?.data?.message || "Failed to submit review", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  const openReviewModal = (type, targetId, name, sourceModel, sourceId) => {
    setReviewData({
      targetType: type,
      targetId,
      rating: 4,
      comment: "",
      sourceModel,
      sourceId,
      targetName: name
    });
    setShowReviewModal(true);
  };

  // ADD ADDRESS
  const handleAddAddress = () => {
    if (!newAddressText) return;
    const updatedAddresses = [...(user.addresses || []), { label: newAddressLabel, address: newAddressText }];
    setUser({ ...user, addresses: updatedAddresses });
    setNewAddressText("");
  };

  // REMOVE ADDRESS
  const handleRemoveAddress = (idx) => {
    const updatedAddresses = (user.addresses || []).filter((_, i) => i !== idx);
    setUser({ ...user, addresses: updatedAddresses });
  };

  // Auto-clear message
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (loading) {
    return (
      <div className="profile-page">
        <Loader />
      </div>
    );
  }

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

      {/* REVIEW MODAL */}
      {showReviewModal && (
        <div className="crop-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="crop-modal" onClick={(e) => e.stopPropagation()} style={{maxWidth: "400px"}}>
            <h3 style={{marginBottom: "4px"}}>Write a Review</h3>
            <p className="crop-subtitle" style={{marginBottom: "20px"}}>Rate your experience with <strong>{reviewData.targetName}</strong></p>
            
            <div style={{display: "flex", flexDirection: "column", gap: "16px"}}>
              <div>
                <label style={{display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "8px", color: "#334155"}}>Rating (1-5 Stars)</label>
                <div style={{display: "flex", gap: "10px", fontSize: "28px", cursor: "pointer"}}>
                   {[1,2,3,4,5].map(star => (
                     <span key={star} onClick={() => setReviewData({...reviewData, rating: star})} style={{color: star <= reviewData.rating ? "#fbbf24" : "#e2e8f0"}}>★</span>
                   ))}
                </div>
              </div>

              <div>
                <label style={{display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "8px", color: "#334155"}}>Comment (Optional)</label>
                <textarea 
                  placeholder="Share details of your own experience..."
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({...reviewData, comment: e.target.value})}
                  style={{width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", minHeight: "100px", fontFamily: "inherit"}}
                />
              </div>

              <div className="crop-actions" style={{marginTop: "10px"}}>
                <button className="crop-cancel" onClick={() => setShowReviewModal(false)}>Cancel</button>
                <button className="crop-confirm" onClick={handleReviewSubmit} disabled={submittingReview}>
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR (Zomato-Style Menu) */}
      <div className={`profile-sidebar ${activeTab !== "menu" ? "hide-on-mobile" : ""}`}>
        {/* Mobile App Header - Back to Home (Zomato style) */}
        <div className="profile-mobile-top-bar hide-on-desktop">
          <IoChevronBack className="zomato-back-arrow" onClick={() => navigate("/")} />
        </div>

        {/* User Card */}
        <div className="profile-user-card" onClick={() => setActiveTab("profile")}>
          <div className="profile-user-avatar">
            {user.profileImage ? (
              <img src={user.profileImage} alt="Profile" />
            ) : (
              <div className="profile-avatar-placeholder-small">
                {user.name ? user.name.charAt(0).toUpperCase() : "?"}
              </div>
            )}
          </div>
          <div className="profile-user-info">
            <h4>{user.name || "Your Name"}</h4>
            <span className="edit-profile-link">Edit profile <IoChevronForward style={{fontSize:"14px", marginTop:"1px"}}/></span>
          </div>
        </div>

        {/* Section: Food delivery */}
        <div className="profile-menu-section">
          <div className="section-title">Food delivery</div>
          <div className={`menu-item ${activeTab === "orders" ? "active" : ""}`} onClick={() => { setActiveTab("orders"); fetchOrders(); }}>
             <FiShoppingBag className="menu-icon" /> Your orders <IoChevronForward className="arrow" />
          </div>
          <div className={`menu-item ${activeTab === "addresses" ? "active" : ""}`} onClick={() => setActiveTab("addresses")}>
             <FiMapPin className="menu-icon" /> Address book <IoChevronForward className="arrow" />
          </div>
          <div className={`menu-item ${activeTab === "favorites" ? "active" : ""}`} onClick={() => setActiveTab("favorites")}>
             <FiHeart className="menu-icon" /> Your collections <IoChevronForward className="arrow" />
          </div>
        </div>

        {/* Section: Dining & experiences */}
        <div className="profile-menu-section">
          <div className="section-title">Dining & experiences</div>
          <div className={`menu-item ${activeTab === "bookings" ? "active" : ""}`} onClick={() => { setActiveTab("bookings"); fetchBookings(); }}>
             <FiCalendar className="menu-icon" /> Your bookings <IoChevronForward className="arrow" />
          </div>
        </div>

        {/* Section: More */}
        <div className="profile-menu-section">
          <div className="section-title">More</div>
          <div className="menu-item" onClick={() => setShowPasswordModal(true)}>
             <FiLock className="menu-icon" /> Change Password <IoChevronForward className="arrow" />
          </div>
          <div className="menu-item" onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("restaurantToken"); localStorage.removeItem("agentToken"); window.location.href="/login"; }}>
             <FiLogOut className="menu-icon" /> Log out <IoChevronForward className="arrow" />
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className={`profile-content ${activeTab === "menu" ? "hide-on-mobile" : ""}`}>
        {/* Mobile Header with Back Button */}
        {activeTab !== "menu" && (
          <div className="mobile-content-header" onClick={() => setActiveTab("menu")}>
             <IoChevronBack className="back-arrow" /> Back to Menu
          </div>
        )}
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

              <button onClick={updateProfile} disabled={saving} style={{ marginTop: "16px" }}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </>
        )}

        {/* ADDRESSES TAB */}
        {activeTab === "addresses" && (
          <>
            <h2>Address Book</h2>
            <div className="profile-form">
              {/* SAVED ADDRESSES */}
              <div className="form-group saved-addresses-section">
                <label>Saved Delivery Addresses</label>
                {(user.addresses || []).length === 0 ? (
                  <p style={{ fontSize: 13, color: "#888", marginBottom: "12px" }}>No saved addresses yet.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: "16px" }}>
                    {user.addresses.map((addr, idx) => (
                      <div key={idx} style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <span style={{ background: "#eee", padding: "4px 8px", borderRadius: "4px", fontSize: 12, fontWeight: "bold", marginRight: 8 }}>{addr.label}</span>
                          <span style={{ fontSize: 14 }}>{addr.address}</span>
                        </div>
                        <button style={{ background: "none", color: "red", border: "none", cursor: "pointer", fontSize: 18 }} onClick={() => handleRemoveAddress(idx)}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginTop: "12px" }}>
                  <select 
                    style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "8px", background: "#f9f9f9" }}
                    value={newAddressLabel} onChange={(e) => setNewAddressLabel(e.target.value)}
                  >
                    <option value="Home">Home</option>
                    <option value="Office">Office</option>
                    <option value="Other">Other</option>
                  </select>
                  <input
                    type="text"
                    style={{ flex: 1 }}
                    placeholder="Enter new address"
                    value={newAddressText}
                    onChange={(e) => setNewAddressText(e.target.value)}
                  />
                  <button type="button" onClick={handleAddAddress} style={{ width: "auto", padding: "12px 16px", background: "#f0f0f0", color: "#333" }}>+ Add</button>
                </div>
              </div>

              <button onClick={updateProfile} disabled={saving} style={{ marginTop: "16px" }}>
                {saving ? "Saving..." : "Save Changes"}
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
                        {/* REVIEW BUTTON FOR BOOKINGS */}
                        {b.status === "Confirmed" && b.paymentStatus === "Paid" && !b.isReviewed && (
                          <button
                            className="pay-now-btn" style={{background: "#eab308"}}
                            onClick={() => openReviewModal("Restaurant", b.restaurant?._id, b.restaurant?.name, "Reservation", b._id)}
                          >
                            ⭐ Write Review
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

        {/* MY ORDERS TAB */}
        {activeTab === "orders" && (
          <div className="my-bookings">
            <h2>📦 My Food Orders</h2>

            {orders.length === 0 ? (
              <p className="empty-msg">No orders yet. Discover restaurants and order food!</p>
            ) : (
              <div className="bookings-list">
                {orders.map((o) => {
                  const firstItemImage = o.items?.[0]?.menuId?.image || "https://via.placeholder.com/60";
                  
                  return (
                    <div key={o._id} className="order-card-zomato" onClick={() => navigate(`/order/${o._id}`)} style={{ cursor: "pointer" }}>
                      <div className="order-card-top">
                        <img src={firstItemImage} alt="Order Item" className="order-dish-img" />
                        <div className="order-rest-details">
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <h3 className="order-rest-name">{o.restaurant?.name || "Restaurant"}</h3>
                            <IoEllipsisVertical size={18} color="#999" onClick={(e) => { e.stopPropagation(); /* Options */ }} />
                          </div>
                          <p className="order-rest-loc">{o.deliveryAddress?.split(",").slice(-2).join(", ") || "Udaipur"}</p>
                          <span className="order-view-menu" onClick={(e) => { e.stopPropagation(); navigate(`/restaurant/${o.restaurant?._id}`); }}>View menu ›</span>
                        </div>
                      </div>

                      <div className="order-card-mid">
                        <ul className="order-item-list">
                          {o.items?.slice(0, 2).map((item, idx) => (
                            <li key={idx}>
                              <span className="veg-icon">⊡</span> {item.qty} x {item.menuId?.name}
                            </li>
                          ))}
                          {o.items?.length > 2 && (
                            <li style={{ color: "#999", fontSize: "11px" }}>+ {o.items.length - 2} more items</li>
                          )}
                        </ul>
                      </div>

                      <div className="order-card-bottom">
                        <div className="order-info-text">
                          Order placed on {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}, {new Date(o.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                          <br />
                          <span style={{ color: o.status === "Delivered" ? "#16a34a" : "#ffb800", fontWeight: "600" }}>{o.status}</span>
                        </div>
                        <div className="order-total-price">
                          ₹{o.totalAmount.toFixed(2)} ›
                        </div>
                      </div>

                      <div className="order-actions" onClick={(e) => e.stopPropagation()}>
                        <button className="reorder-btn" onClick={() => handleReorder(o)}>
                          ↻ Reorder
                        </button>
                        {(o.status === "Placed" || o.status === "Confirmed" || o.status === "Preparing") && (
                          <button 
                            className="reorder-btn cancel" 
                            onClick={() => setCancelOrderId(o._id)}
                          >
                            ✕ Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* FAVORITES TAB */}
        {activeTab === "favorites" && (
          <div className="my-bookings">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ marginBottom: 0 }}>❤️ My Favorite Dishes</h2>
              <span style={{ fontSize: "14px", color: "#64748b", fontWeight: "600", background: "#f1f5f9", padding: "4px 12px", borderRadius: "20px" }}>
                {user.favorites?.length || 0} Saved
              </span>
            </div>

            {(!user.favorites || user.favorites.length === 0) ? (
              <div className="empty-msg" style={{ padding: "60px 20px" }}>
                <div style={{ fontSize: "40px", marginBottom: "16px" }}>💔</div>
                <p style={{ margin: 0, color: "#94a3b8" }}>You haven't favorited any dishes yet.</p>
                <button 
                  onClick={() => navigate("/")}
                  style={{ marginTop: "20px", background: "#ff6b00", color: "#fff", border: "none", padding: "10px 24px", borderRadius: "10px", fontWeight: "700", cursor: "pointer" }}
                >
                  Explore Menu
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "20px" }}>
                {user.favorites.map((item) => (
                  <div key={item._id} className="booking-card" style={{ cursor: "pointer" }} onClick={() => navigate(`/dish/${item._id}`)}>
                    <div style={{ height: "140px", width: "100%", overflow: "hidden" }}>
                      <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div style={{ padding: "15px" }}>
                      <h4 style={{ margin: "0 0 5px 0", fontSize: "16px", fontWeight: "700", color: "#1e293b" }}>{item.name}</h4>
                      <p style={{ margin: "0 0 12px 0", color: "#ff6b00", fontWeight: "800", fontSize: "15px" }}>₹ {item.price}</p>
                      <button 
                        className="view-receipt-btn" 
                        style={{ width: "100%", padding: "10px", textAlign: "center", justifyContent: "center" }}
                      >
                        Order Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PLACEHOLDERS */}
        {activeTab !== "profile" && activeTab !== "bookings" && activeTab !== "orders" && activeTab !== "favorites" && activeTab !== "addresses" && (
          <h2>Coming Soon 🚧</h2>
        )}
      </div>

      {cancelBookingId && (
        <ConfirmModal
          title="Cancel Booking?"
          message="Are you sure you want to cancel this reservation? This action cannot be undone."
          confirmText="Yes, Cancel Booking"
          cancelText="No, Keep It"
          confirmColor="#ef4444"
          onConfirm={confirmCancelBooking}
          onCancel={() => setCancelBookingId(null)}
        />
      )}

      {cancelOrderId && (
        <ConfirmModal
          title="Cancel Order?"
          message={
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <p style={{ margin: 0 }}>
                Are you sure you want to cancel this order?<br /><br />
                • Within 2 mins: <strong>100% Refund</strong><br />
                • After 2 mins: <strong>90% Refund (10% Fee)</strong><br />
                • No refund if food is already prepared or out for delivery.
              </p>
              <textarea 
                placeholder="Reason for cancellation (optional)"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", minHeight: "60px", fontSize: "14px", fontFamily: "inherit" }}
              />
            </div>
          }
          confirmText="Yes, Cancel Order"
          cancelText="No, Keep It"
          confirmColor="#ef4444"
          onConfirm={handleCancelOrder}
          onCancel={() => { setCancelOrderId(null); setCancelReason(""); }}
        />
      )}
    </div>
  );
}
