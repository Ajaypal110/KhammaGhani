import React from "react";
import OrderStatusBadge from "./OrderStatusBadge";
import OrderActions from "./OrderActions";
import DeliveryAgentSelector from "./DeliveryAgentSelector";

export default function OrderCard({ order, availableAgents, refreshOrders, refreshAgents }) {
  const isNew = order.status === "Placed";

  return (
    <div
      className={`order-card ${isNew ? "order-card-new" : ""}`}
      style={{
        borderLeft: `5px solid ${isNew ? "#f59e0b" : order.status === "Delivered" ? "#16a34a" : "#94a3b8"}`,
        animation: isNew ? "pulseBorder 2s infinite" : "none",
      }}
    >
      {/* Card Header */}
      <div className="order-header" style={{ alignItems: "flex-start", marginBottom: "12px", borderBottom: "1px dashed #eee", paddingBottom: "12px", display: "flex", justifyContent: "space-between" }}>
        <div>
          <span className="order-id" style={{ display: "block", fontSize: "16px", fontWeight: "800", color: "#1e293b" }}>
            #{order._id.slice(-6).toUpperCase()}
          </span>
          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>
            {new Date(order.createdAt).toLocaleString("en-IN", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <OrderStatusBadge status={order.status} isNew={isNew} />
      </div>

      {/* Customer Info */}
      <div className="order-customer-info" style={{ marginBottom: "16px", background: "#f8fafc", padding: "12px", borderRadius: "12px" }}>
        <div style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b", marginBottom: "4px" }}>
          👤 {order.user?.name || "Guest"}
        </div>
        <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>
          📞 {order.user?.phone || "No phone provided"}
        </div>
        {order.deliveryAddress && (
          <div style={{ fontSize: "13px", color: "#475569", lineHeight: "1.4", marginTop: "6px" }}>
            📍 {order.deliveryAddress}
          </div>
        )}
      </div>

      {/* Order Items */}
      <div className="order-items" style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "12px", textTransform: "uppercase", fontWeight: "700", color: "#94a3b8", marginBottom: "6px" }}>
          📝 Order Details ({order.items?.length || 0} items)
        </div>
        <div style={{ fontSize: "13px", color: "#334155", fontWeight: "500", lineHeight: "1.5" }}>
          {order.items?.map((item, idx) => (
            <span key={idx} style={{ display: "block", marginBottom: "4px" }}>
              <span style={{ fontWeight: "700", color: "#0f172a" }}>{item.qty}x</span> {item.menuId?.name}
              {item.variant ? ` (${item.variant})` : ""}
            </span>
          ))}
        </div>
      </div>

      {/* Financials */}
      <div className="order-finance" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", padding: "10px", border: "1px solid #f1f5f9", borderRadius: "10px", backgroundColor: "#fff" }}>
        <div>
          <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Total Amount</div>
          <div style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>₹{order.totalAmount || 0}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Payment</div>
          <div style={{ fontSize: "13px", fontWeight: "700", color: order.paymentMethod === "Cash on Delivery" ? "#d97706" : "#16a34a" }}>
            {order.paymentMethod === "Cash on Delivery" ? (order.cashCollected || order.paymentStatus === "Paid" ? "COD ✅" : "COD ⚠️") : order.paymentStatus}
          </div>
        </div>
      </div>

      {order.paymentMethod === "Cash on Delivery" && !order.cashCollected && order.paymentStatus !== "Paid" && (
        <div style={{ background: "#fffbeb", color: "#92400e", padding: "8px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "700", marginBottom: "16px", border: "1px dashed #fcd34d" }}>
          ⚠️ Customer will pay ₹{order.totalAmount} on delivery.
        </div>
      )}

      {/* Delivery Agent Info */}
      {order.deliveryAgent?.name && (
        <div style={{ background: "#f5f3ff", padding: "12px 14px", borderRadius: "12px", marginBottom: "16px", border: "1px solid #ede9fe" }}>
          <div style={{ fontWeight: "800", fontSize: "12px", color: "#7c3aed", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            🚴 Assigned Partner
          </div>
          <div style={{ fontSize: "14px", fontWeight: "700", color: "#4c1d95" }}>{order.deliveryAgent.name}</div>
          <div style={{ fontSize: "13px", color: "#5b21b6", marginTop: "2px" }}>
            📞 {order.deliveryAgent.phone} • {order.deliveryAgent.vehicleType}
          </div>
        </div>
      )}

      {/* Components */}
      <DeliveryAgentSelector order={order} availableAgents={availableAgents} refreshOrders={refreshOrders} refreshAgents={refreshAgents} />
      
      <OrderActions order={order} refreshOrders={refreshOrders} refreshAgents={refreshAgents} />
    </div>
  );
}
