import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function AgentDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const { data } = await API.get("/agent-portal/me");
      setProfile(data.agent);
      setOrders(data.activeOrders);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("agentToken");
    localStorage.removeItem("agentName");
    navigate("/agent/login");
  };

  const toggleStatus = async () => {
    try {
      await API.put("/agent-portal/status");
      fetchData(); // Refresh to get new status
    } catch (err) {
      alert(err.response?.data?.message || "Error changing status");
    }
  };

  const updateOrderStatus = async (orderId, action) => {
    try {
      await API.put(`/agent-portal/order/${orderId}/status`, { action });
      fetchData(); // Refresh UI
    } catch (err) {
      alert(err.response?.data?.message || "Error updating status");
    }
  };

  const getGoogleMapsLink = (address) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  };

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center", fontSize: "18px", color: "#64748b" }}>Loading Agent Portal...</div>;
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px", fontFamily: "system-ui, sans-serif" }}>
      {/* Header Profile Section */}
      <div style={{ background: "#fff", padding: "20px", borderRadius: "16px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 style={{ margin: "0 0 4px", fontSize: "22px", color: "#1e293b" }}>Hello, {profile?.name}</h2>
          <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>{profile?.vehicleType} • {profile?.vehicleNumber}</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "12px" }}>
          <button onClick={handleLogout} style={{ border: "none", background: "transparent", color: "#ef4444", fontWeight: "600", cursor: "pointer", padding: 0 }}>Logout</button>
          
          <button 
            onClick={toggleStatus}
            style={{
              background: profile?.status === "Available" ? "#10b981" : profile?.status === "Busy" ? "#f59e0b" : "#ef4444",
              color: "#fff", border: "none", padding: "8px 16px", borderRadius: "20px", fontWeight: "bold", cursor: profile?.status === "Busy" ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: "6px"
            }}
            disabled={profile?.status === "Busy"}
          >
            <span style={{ display: "inline-block", width: "8px", height: "8px", background: "#fff", borderRadius: "50%" }}></span>
            {profile?.status}
          </button>
        </div>
      </div>

      <h3 style={{ margin: "0 0 16px", color: "#334155" }}>Active Deliveries ({orders.length})</h3>

      {orders.length === 0 ? (
        <div style={{ background: "#f8fafc", padding: "40px", borderRadius: "16px", textAlign: "center", color: "#64748b", border: "2px dashed #e2e8f0" }}>
          <div style={{ fontSize: "40px", marginBottom: "10px" }}>😴</div>
          <p style={{ margin: 0, fontWeight: "500" }}>No active orders assigned to you right now.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {orders.map(order => (
            <div key={order._id} style={{ background: "#fff", borderRadius: "16px", overflow: "hidden", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
              {/* Order Header */}
              <div style={{ background: order.agentStatus === "assigned" ? "#fef3c7" : "#ecfdf5", padding: "16px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: "700", color: order.agentStatus === "assigned" ? "#b45309" : "#047857", textTransform: "uppercase", fontSize: "12px", letterSpacing: "1px", marginBottom: "4px" }}>
                    STATUS: {order.agentStatus}
                  </div>
                  <div style={{ fontSize: "13px", color: "#64748b" }}>Order #{order._id.slice(-6).toUpperCase()}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "18px", fontWeight: "800", color: "#1e293b" }}>₹{order.totalAmount}</div>
                  <div style={{ fontSize: "12px", fontWeight: "600", color: order.paymentStatus === "Paid" ? "#10b981" : "#ef4444" }}>
                    {order.paymentStatus === "Paid" ? "✅ ONLINE PAID" : "⚠️ CASH ON DELIVERY"}
                  </div>
                </div>
              </div>

              {/* Locations Data */}
              <div style={{ padding: "20px" }}>
                {/* Pickup */}
                <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: "#3b82f6", border: "3px solid #bfdbfe" }}></div>
                    <div style={{ width: "2px", height: "40px", background: "#e2e8f0", margin: "4px 0" }}></div>
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>Pickup Point</div>
                    <div style={{ fontWeight: "600", fontSize: "16px", color: "#1e293b" }}>{order.restaurant?.name}</div>
                    <div style={{ fontSize: "14px", color: "#475569" }}>{order.restaurant?.address || "Address not provided"}</div>
                  </div>
                </div>

                {/* Dropoff */}
                <div style={{ display: "flex", gap: "16px" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "4px" }}>
                    <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: "#ef4444", border: "3px solid #fecaca" }}></div>
                  </div>
                  <div style={{ width: "100%" }}>
                    <div style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>Delivery Point</div>
                    
                    {order.agentStatus === "assigned" ? (
                       <div style={{ background: "#f1f5f9", padding: "12px", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>
                         <div style={{ fontWeight: "600", color: "#334155", marginBottom: "4px" }}>Customer info hidden for privacy.</div>
                         <div style={{ color: "#64748b", fontSize: "14px" }}>📍 Area Approx: <span style={{fontWeight: "600"}}>{order.deliveryAddress}</span></div>
                         <div style={{ color: "#f59e0b", fontSize: "12px", marginTop: "8px", fontWeight: "600" }}>Accept the order to reveal exact address and phone number.</div>
                       </div>
                    ) : (
                      <>
                        <div style={{ fontWeight: "600", fontSize: "16px", color: "#1e293b" }}>{order.user?.name}</div>
                        <div style={{ fontSize: "14px", color: "#475569", marginBottom: "8px" }}>{order.deliveryAddress}</div>
                        <a href={`tel:${order.user?.phone}`} style={{ display: "inline-block", background: "#f0fdf4", color: "#16a34a", padding: "6px 12px", borderRadius: "6px", textDecoration: "none", fontWeight: "600", fontSize: "13px" }}>
                          📞 {order.user?.phone}
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ padding: "16px 20px", background: "#f8fafc", borderTop: "1px solid #e2e8f0", display: "flex", gap: "12px" }}>
                {/* Navigation Button (Only if Accepted or Picked) */}
                {(order.agentStatus === "accepted" || order.agentStatus === "picked") && (
                  <a 
                    href={getGoogleMapsLink(order.agentStatus === "accepted" ? order.restaurant?.address : order.deliveryAddress)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ flex: 1, textAlign: "center", background: "#fff", border: "1.5px solid #cbd5e1", padding: "12px", borderRadius: "10px", color: "#334155", fontWeight: "600", textDecoration: "none" }}
                  >
                    🗺️ Navigate to {order.agentStatus === "accepted" ? "Restaurant" : "Customer"}
                  </a>
                )}
                
                {/* Status Update Flow Button */}
                {order.agentStatus === "assigned" && (
                  <button onClick={() => updateOrderStatus(order._id, "accept")} style={{ flex: 1, background: "#ff6b00", color: "#fff", border: "none", padding: "12px", borderRadius: "10px", fontWeight: "bold", fontSize: "15px", cursor: "pointer" }}>
                    Accept Order
                  </button>
                )}
                {order.agentStatus === "accepted" && (
                  <button onClick={() => updateOrderStatus(order._id, "pick")} style={{ flex: 1, background: "#3b82f6", color: "#fff", border: "none", padding: "12px", borderRadius: "10px", fontWeight: "bold", fontSize: "15px", cursor: "pointer" }}>
                    Mark as Picked Up
                  </button>
                )}
                {order.agentStatus === "picked" && (
                  <button onClick={() => updateOrderStatus(order._id, "deliver")} style={{ flex: 1, background: "#10b981", color: "#fff", border: "none", padding: "12px", borderRadius: "10px", fontWeight: "bold", fontSize: "15px", cursor: "pointer" }}>
                    ✅ Mark Delivered
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
