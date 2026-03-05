import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import Loader from "../components/Loader";
import "../styles/profile.css"; // Reuse profile styles for general structure
import "../styles/tracking.css";

export default function OrderTracking() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await API.get(`/orders/${orderId}`);
        setOrder(data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch order details", err);
        setLoading(false);
      }
    };
    if (orderId) fetchOrder();
  }, [orderId]);

  if (loading) return <Loader />;

  if (!order) {
    return (
      <div className="tracking-page-container">
        <div className="tracking-error">
          <h2>Order Not Found</h2>
          <p>We couldn't find the tracking details for this order.</p>
          <button className="btn-pay-online" onClick={() => navigate("/profile")}>Back to My Orders</button>
        </div>
      </div>
    );
  }

  // Determine active step
  const statuses = ["Placed", "Confirmed", "Preparing", "Out for Delivery", "Delivered"];
  // Handle assigned gracefully (often happens between Confirmed/Preparing)
  let currentStatusIndex = statuses.indexOf(order.status);
  if (order.status === "Assigned") currentStatusIndex = 2; // Treat assigned similarly to preparing for UI timeline
  
  const isCancelled = order.status === "Cancelled";

  return (
    <div className="tracking-page-container">
      <div className="tracking-header">
        <button className="btn-back" onClick={() => navigate("/profile")}>← Back</button>
        <h2>Track Your Order</h2>
        <p className="tracking-order-id">Order ID: #{order._id.slice(-6).toUpperCase()}</p>
      </div>

      <div className="tracking-card">
        <div className="tracking-rest-summary">
          <h3>{order.restaurant?.name || "Restaurant"}</h3>
          <p>{order.items?.length || 0} items • ₹{order.totalAmount}</p>
        </div>

        {isCancelled ? (
          <div className="tracking-cancelled">
            <div className="icon-cancelled">✖</div>
            <h3>Order Cancelled</h3>
            <p>This order has been cancelled. If you have been charged, a refund will be initiated shortly.</p>
          </div>
        ) : (
          <div className="tracking-timeline">
            {statuses.map((step, index) => {
              const isActive = index <= currentStatusIndex;
              const isLast = index === statuses.length - 1;
              return (
                <div key={step} className={`timeline-step ${isActive ? "active" : ""}`}>
                  <div className="timeline-connector-wrapper">
                    <div className="timeline-dot"></div>
                    {!isLast && <div className="timeline-line"></div>}
                  </div>
                  <div className="timeline-content">
                    <h4>{step}</h4>
                    {index === 0 && <p className="timeline-meta">{new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>}
                    {index === currentStatusIndex && step === "Out for Delivery" && order.deliveryAgent && (
                      <div className="timeline-agent-box">
                        <p><strong>{order.deliveryAgent.name}</strong> is on the way!</p>
                        <p>Vehicle: {order.deliveryAgent.vehicleNumber}</p>
                        <a href={`tel:${order.deliveryAgent.phone}`} className="btn-call">📞 Call Agent</a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Delivery Address Box */}
        <div className="tracking-address-box">
          <h4>Delivery Address</h4>
          <p>{order.deliveryAddress}</p>
        </div>

      </div>
    </div>
  );
}
