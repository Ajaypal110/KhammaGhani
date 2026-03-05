import React from "react";

export default function OrderStatusBadge({ status, isNew }) {
  const statusColors = {
    Placed: "#f59e0b",
    Confirmed: "#3b82f6",
    Preparing: "#eab308",
    Ready: "#a855f7",
    Assigned: "#8b5cf6",
    "Out for Delivery": "#06b6d4",
    Delivered: "#16a34a",
    Cancelled: "#ef4444",
  };

  const bgColor = statusColors[status] || "#f1f5f9";
  const textColor = ["Placed", "Preparing"].includes(status) ? "#1a1a1a" : "#fff";

  return (
    <div style={{ textAlign: "right" }}>
      <span
        style={{
          background: bgColor,
          color: textColor,
          padding: "6px 12px",
          borderRadius: "12px",
          fontSize: "12px",
          fontWeight: "800",
          display: "inline-block",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        }}
      >
        {status}
      </span>
      {isNew && (
        <span
          className="new-badge-pulse"
          style={{
            display: "block",
            marginTop: "6px",
            fontSize: "10px",
            color: "#ef4444",
            fontWeight: "800",
            textTransform: "uppercase",
            letterSpacing: "1px",
            animation: "pulse 1.5s infinite",
          }}
        >
          ● New Order
        </span>
      )}
    </div>
  );
}
