import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { 
    MdMoped, 
    MdLocationOn, 
    MdNavigation, 
    MdCheckCircle, 
    MdCancel, 
    MdTimer, 
    MdAttachMoney, 
    MdPerson, 
    MdPhone,
    MdMoreVert,
    MdOutlineRadioButtonChecked,
    MdHistory
} from "react-icons/md";
import "../styles/agentDashboard.css";

// 1. Status Badge Component
const StatusBadge = ({ status }) => {
    const getStyles = () => {
        switch (status.toLowerCase()) {
            case "assigned": return { bg: "#eff6ff", text: "#3b82f6" };
            case "accepted": return { bg: "#fef3c7", text: "#d97706" };
            case "picked": return { bg: "#fff7ed", text: "#ea580c" };
            case "delivered": return { bg: "#f0fdf4", text: "#16a34a" };
            default: return { bg: "#f1f5f9", text: "#64748b" };
        }
    };
    const styles = getStyles();
    return (
        <span className="status-badge" style={{ backgroundColor: styles.bg, color: styles.text }}>
            {status}
        </span>
    );
};

// 2. Earnings Summary Component
const EarningsSummary = ({ summary }) => (
    <div className="earnings-grid">
        <div className="earning-card">
            <span className="earning-label">Today's Earnings</span>
            <span className="earning-value total">₹{summary?.todayEarnings || 0}</span>
        </div>
        <div className="earning-card">
            <span className="earning-label">Deliveries</span>
            <span className="earning-value">{summary?.todayDeliveries || 0}</span>
        </div>
        <div className="earning-card">
            <span className="earning-label">Cash Collected</span>
            <span className="earning-value">₹{summary?.cashCollected || 0}</span>
        </div>
        <div className="earning-card">
            <span className="earning-label">Online Payments</span>
            <span className="earning-value">₹{summary?.onlinePayments || 0}</span>
        </div>
    </div>
);

// 3. Individual Order Card Component
const OrderCard = ({ order, updateStatus }) => {
    const isAssigned = order.agentStatus === "assigned";
    const isAccepted = order.agentStatus === "accepted";
    const isPicked = order.agentStatus === "picked";

    const getNavUrl = () => {
        const dest = isAccepted ? order.restaurant?.address : order.deliveryAddress;
        return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}`;
    };

    return (
        <div className="order-card">
            <div className="order-card-header">
                <div>
                    <span className="order-id">#{order._id.slice(-6).toUpperCase()}</span>
                    <StatusBadge status={order.agentStatus} />
                </div>
                <div className="payment-info">
                    <div className="payment-amount">₹{order.totalAmount}</div>
                    <div className="payment-method" style={{ color: order.paymentStatus === "Paid" ? "#10b981" : "#ef4444" }}>
                        {order.paymentStatus === "Paid" ? "ONLINE PAID" : "CASH ON DELIVERY"}
                    </div>
                </div>
            </div>

            <div className="order-body">
                <div className="location-item">
                    <div className="location-connector">
                        <div className="loc-dot pickup"></div>
                        <div className="loc-line"></div>
                    </div>
                    <div className="loc-details">
                        <div className="loc-label">Pickup from</div>
                        <div className="loc-name">{order.restaurant?.name}</div>
                        <div className="loc-addr">{order.restaurant?.address}</div>
                    </div>
                </div>

                <div className="location-item">
                    <div className="location-connector">
                        <div className="loc-dot drop"></div>
                    </div>
                    <div className="loc-details" style={{ paddingBottom: 0 }}>
                        <div className="loc-label">Delivery to</div>
                        {isAssigned ? (
                            <div className="privacy-banner">
                                Accept the order to reveal customer details and exact location.
                            </div>
                        ) : (
                            <>
                                <div className="loc-name">{order.user?.name}</div>
                                <div className="loc-addr">{order.deliveryAddress}</div>
                                <div style={{ marginTop: 10 }}>
                                    <a href={`tel:${order.user?.phone}`} className="nav-btn" style={{ display: 'inline-flex', padding: '6px 12px' }}>
                                        <MdPhone /> Call Customer
                                    </a>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="items-list">
                    {order.items?.map((item, i) => (
                        <div key={i} className="item-row">
                            <span>{item.name} x {item.quantity}</span>
                            <span>₹{item.price * item.quantity}</span>
                        </div>
                    ))}
                </div>
                
                {order.paymentMethod === "Cash on Delivery" && order.agentStatus !== "delivered" && (
                    <div style={{ marginTop: 15, background: '#fff7ed', padding: 12, borderRadius: 10, color: '#9a3412', fontWeight: 800, fontSize: 13, textAlign: 'center', border: '1px solid #ffedd5' }}>
                        COLLECT ₹{order.totalAmount} FROM CUSTOMER
                    </div>
                )}
            </div>

            <div className="order-actions">
                {(isAccepted || isPicked) && (
                    <a href={getNavUrl()} target="_blank" rel="noreferrer" className="nav-btn">
                        <MdNavigation /> Navigate to {isAccepted ? "Restaurant" : "Customer"}
                    </a>
                )}

                {isAssigned && (
                    <button className="action-btn btn-accept" onClick={() => updateStatus(order._id, "accept")}>
                        Accept Order
                    </button>
                )}
                {isAccepted && (
                    <button className="action-btn btn-pick" onClick={() => updateStatus(order._id, "pick")}>
                        Mark as Picked Up
                    </button>
                )}
                {isPicked && (
                    <button className="action-btn btn-deliver" onClick={() => updateStatus(order._id, order.paymentMethod === "Cash on Delivery" ? "collect_cod" : "deliver")}>
                        {order.paymentMethod === "Cash on Delivery" ? "✅ Cash Collected & Delivered" : "✅ Mark Delivered"}
                    </button>
                )}
            </div>
        </div>
    );
};

// 4. Main Dashboard Page
export default function AgentDashboard() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [activeOrders, setActiveOrders] = useState([]);
    const [completedOrders, setCompletedOrders] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const { data } = await API.get("/agent-portal/me");
            setProfile(data.agent);
            setActiveOrders(data.activeOrders);
            setCompletedOrders(data.completedOrders || []);
            setSummary(data.earningsSummary);
        } catch (err) {
            console.error(err);
            if (err.response?.status === 401) navigate("/agent/login");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toggleStatus = async () => {
        try {
            await API.put("/agent-portal/status");
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || "Error updating status");
        }
    };

    const updateOrderStatus = async (id, action) => {
        try {
            await API.put(`/agent-portal/order/${id}/status`, { action });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || "Status update failed");
        }
    };

    if (loading) return <div className="admin-loading">Setting up your cockpit...</div>;

    return (
        <div className="agent-portal-container">
            {/* Header */}
            <header className="agent-header">
                <div className="agent-info">
                    <h2>Hi, {profile?.name}</h2>
                    <p>{profile?.vehicleType} • {profile?.vehicleNumber}</p>
                </div>
                <div className="status-toggle-container">
                    <button onClick={() => { localStorage.clear(); navigate("/agent/login"); }} style={{ border: 'none', background: 'none', color: '#ef4444', fontSize: 12, fontWeight: 700 }}>Logout</button>
                    <button 
                        className="status-btn"
                        onClick={toggleStatus}
                        disabled={profile?.status === "Busy"}
                        style={{ background: profile?.status === "Available" ? "#10b981" : profile?.status === "Busy" ? "#f59e0b" : "#ef4444" }}
                    >
                        <div className="status-dot"></div>
                        {profile?.status}
                    </button>
                </div>
            </header>

            {/* Daily Summary */}
            <h3 className="section-title"><MdAttachMoney /> Today's Performance</h3>
            <EarningsSummary summary={summary} />

            {/* Active Orders */}
            <h3 className="section-title"><MdMoped /> Assigned Orders ({activeOrders.length})</h3>
            {activeOrders.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-emoji">🍕</div>
                    <p>No active orders. Stay online to get new assignments!</p>
                </div>
            ) : (
                <div className="active-orders-list">
                    {activeOrders.map(order => (
                        <OrderCard key={order._id} order={order} updateStatus={updateOrderStatus} />
                    ))}
                </div>
            )}

            {/* History */}
            {completedOrders.length > 0 && (
                <>
                    <h3 className="section-title"><MdHistory /> Delivered Today</h3>
                    <div className="delivery-history">
                        {completedOrders.map(order => (
                            <div key={order._id} className="history-card">
                                <div className="hist-info">
                                    <h4>Order #{order._id.slice(-6).toUpperCase()}</h4>
                                    <div className="hist-time">
                                        {order.restaurant?.name} • {new Date(order.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                                <div className="hist-amount">
                                    ₹{order.totalAmount}
                                    <div style={{ fontSize: 10, color: '#16a34a' }}>SUCCESS</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
