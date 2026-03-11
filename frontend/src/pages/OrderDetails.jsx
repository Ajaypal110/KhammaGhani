import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import API from "../api/axios";
import Loader from "../components/Loader";
import { IoArrowBack, IoCallOutline, IoDocumentTextOutline, IoChevronForward } from "react-icons/io5";
import "../styles/orders.css";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, clearCart } = useCart();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // REORDER FUNCTIONALITY
  const handleReorder = (order) => {
    if (window.confirm("This will clear your current cart and add these items. Proceed?")) {
      clearCart();
      order.items.forEach((item) => {
        let itemPrice = item.price || (item.menuId && item.menuId.price) || 0;
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

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const { data } = await API.get(`/orders/myorders`);
        const foundOrder = data.find((o) => o._id === id);
        setOrder(foundOrder);
      } catch (err) {
        console.error("Error fetching order details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [id]);

  if (loading) return <Loader />;
  if (!order) return <div className="orders-container">Order not found.</div>;

  const handleCopyId = () => {
    navigator.clipboard.writeText(order._id);
    alert("Order ID copied to clipboard!");
  };

  return (
    <div className="order-details-page">
      {/* Header */}
      <div className="order-status-banner">
        <IoArrowBack size={20} onClick={() => navigate(-1)} style={{ cursor: "pointer" }} />
        <div style={{ flex: 1, textAlign: "center" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "600", margin: 0, color: "#4a4a4a" }}>Order Details</h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#ff4d4f", cursor: "pointer" }}>
          <IoDocumentTextOutline size={16} />
          <span style={{ fontWeight: "600", fontSize: "14px" }}>Support</span>
        </div>
      </div>

      <div className="orders-container" style={{ paddingTop: "15px" }}>
        {/* Status Card */}
        <div className="white-card" style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <div style={{ width: "45px", height: "45px", display: "flex", alignItems: "center", justifyContent: "center", background: "#fdf2f2", borderRadius: "10px" }}>
            <span style={{ fontSize: "24px" }}>🛍️</span>
          </div>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#1c1c1c" }}>Order was {order.status.toLowerCase()}</h3>
        </div>

        {/* Restaurant Card */}
        <div className="white-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <img 
              src={order.restaurant?.profileImage || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=100"} 
              alt="Restaurant" 
              style={{ width: "50px", height: "50px", borderRadius: "50%", objectFit: "cover", border: "1px solid #eee" }}
            />
            <div>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#1c1c1c" }}>{order.restaurant?.name || "Panchmukhi Restaurant"}</h3>
              <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#666" }}>{order.deliveryAddress?.split(",").slice(-2).join(", ") || "Hiran Magri, Udaipur"}</p>
            </div>
          </div>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <IoCallOutline size={20} color="#ff4d4f" />
          </div>
        </div>

        {/* Items Card */}
        <div className="white-card">
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "15px", color: "#666" }}>
            <span style={{ fontSize: "13px", fontWeight: "500" }}>Order ID: #{order._id.slice(-10).toUpperCase()}</span>
            <span style={{ cursor: "pointer", fontSize: "12px" }} onClick={handleCopyId}>📋</span>
          </div>
          
          {order.items.map((item, idx) => (
            <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                <span style={{ color: "#27ae60", fontSize: "12px", marginTop: "4px" }}>⊡</span>
                <span style={{ fontSize: "14px", fontWeight: "500", color: "#1c1c1c" }}>
                  {item.qty} x {item.menuId?.name} {item.variant ? `[ ${item.variant} ]` : ""}
                </span>
              </div>
              <span style={{ fontSize: "14px", fontWeight: "700", color: "#1c1c1c" }}>₹{item.price * item.qty}</span>
            </div>
          ))}
        </div>

        {/* Bill Summary Section with Wavy Pattern */}
        <div className="bill-summary-wrap">
          <div className="bill-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "35px", height: "35px", background: "#f0f4f8", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                   <IoDocumentTextOutline size={18} color="#64748b" />
                </div>
                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#1c1c1c" }}>Bill Summary</h3>
              </div>
              <div style={{ width: "30px", height: "30px", border: "1px solid #eee", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                 <span style={{ fontSize: "14px", color: "#ff4d4f" }}>📥</span>
              </div>
            </div>

            <div className="bill-summary-row">
              <span>Item total</span>
              <div style={{ display: "flex", alignItems: "center" }}>
                {order.discount > 0 && <span className="struck-price">₹{(order.itemsPrice + 25).toFixed(2)}</span>}
                <span style={{ color: "#1c1c1c", fontWeight: "500" }}>₹{order.itemsPrice.toFixed(2)}</span>
              </div>
            </div>
            <div className="bill-summary-row">
              <span>GST & restaurant packaging</span>
              <span style={{ color: "#1c1c1c", fontWeight: "500" }}>₹{order.gst?.toFixed(2) || "26.09"}</span>
            </div>
            <div className="bill-summary-row">
              <span>Delivery partner fee</span>
              <div style={{ display: "flex", alignItems: "center" }}>
                {order.deliveryFee > 0 && <span className="struck-price">₹17.00</span>}
                <span style={{ color: "#1c1c1c", fontWeight: "500" }}>₹{order.deliveryFee?.toFixed(2) || "7.00"}</span>
              </div>
            </div>
            <div className="bill-summary-row">
              <span>Platform fee</span>
              <span style={{ color: "#1c1c1c", fontWeight: "500" }}>₹{order.platformFee?.toFixed(2) || "5.00"}</span>
            </div>
            <div className="bill-summary-row">
              <span>Feeding India donation</span>
              <span style={{ color: "#1c1c1c", fontWeight: "500" }}>₹2.00</span>
            </div>
            
            <div style={{ margin: "15px 0", borderBottom: "1px dashed #eee" }}></div>

            <div className="bill-summary-row" style={{ color: "#1c1c1c", fontSize: "16px", fontWeight: "700" }}>
              <span>Grand total</span>
              <span>₹{order.totalAmount?.toFixed(2)}</span>
            </div>

            {order.discount > 0 && (
              <div className="bill-summary-row" style={{ color: "#2563eb", fontWeight: "500" }}>
                <span>Coupon applied - ONLY4U</span>
                <span>- ₹{order.discount?.toFixed(2)}</span>
              </div>
            )}
            
            <div className="bill-summary-row" style={{ color: "#666" }}>
              <span>Cash round off</span>
              <span>- ₹0.09</span>
            </div>

            <div className="bill-summary-row" style={{ marginTop: "10px", fontWeight: "700", color: "#1c1c1c", fontSize: "16px" }}>
              <span>Paid</span>
              <span style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                 ₹{order.totalAmount?.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="wavy-footer" style={{ background: "#e0f2fe", height: "15px" }}></div>
        </div>
      </div>

      {/* Action Buttons Footer */}
      <div className="details-footer">
        {(order.status === "Placed" || order.status === "Confirmed" || order.status === "Preparing") && (
          <button 
            className="footer-btn secondary" 
            style={{ color: "#ef4444", borderColor: "#ef4444", flex: 1, borderRadius: "10px", height: "48px" }}
            onClick={() => {
              if (window.confirm("Are you sure you want to cancel this order?")) {
                API.put(`/orders/${order._id}/cancel`, { reason: "User cancelled" })
                  .then(() => navigate("/profile"))
                  .catch(err => alert(err.response?.data?.message || "Failed to cancel"));
              }
            }}
          >
            ✕ Cancel
          </button>
        )}
        <button className="footer-btn primary" onClick={() => handleReorder(order)} style={{ flex: 1, borderRadius: "10px", height: "48px" }}>
          <span style={{ fontSize: "18px" }}>↻</span> Reorder
        </button>
        <button className="footer-btn secondary" onClick={() => window.print()} style={{ flex: 1, borderRadius: "10px", height: "48px" }}>
          <span style={{ fontSize: "18px" }}>📥</span> Invoice
        </button>
      </div>
    </div>
  );
};

export default OrderDetails;
