import React, { useState } from "react";
import API from "../../api/axios";

export default function OrderActions({ order, refreshOrders, refreshAgents }) {
  const [loadingAction, setLoadingAction] = useState(null); // specific status loader

  const handleUpdateStatus = async (status) => {
    setLoadingAction(status);
    try {
      await API.put(`/orders/${order._id}/status`, { status });
      refreshOrders();
      if (status === "Delivered") refreshAgents();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to update status to ${status}`);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
      {order.status === "Placed" && (
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => handleUpdateStatus("Confirmed")}
            disabled={loadingAction !== null}
            style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "none", background: "#3b82f6", color: "#fff", fontWeight: "700", cursor: "pointer", fontSize: "13px", transition: "0.2s", opacity: loadingAction === "Confirmed" ? 0.7 : 1 }}
          >
            {loadingAction === "Confirmed" ? "⏳..." : "✅ Accept Order"}
          </button>
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to reject this order?")) {
                handleUpdateStatus("Cancelled");
              }
            }}
            disabled={loadingAction !== null}
            style={{ padding: "12px 16px", borderRadius: "10px", border: "1.5px solid #ffedd5", background: "#fff", color: "#ef4444", fontWeight: "700", cursor: "pointer", fontSize: "13px", opacity: loadingAction === "Cancelled" ? 0.7 : 1 }}
          >
            {loadingAction === "Cancelled" ? "..." : "Reject"}
          </button>
        </div>
      )}

      {order.status === "Confirmed" && (
        <button
          onClick={() => handleUpdateStatus("Preparing")}
          disabled={loadingAction !== null}
          style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "none", background: "#eab308", color: "#fff", fontWeight: "700", cursor: "pointer", fontSize: "13px", opacity: loadingAction === "Preparing" ? 0.7 : 1 }}
        >
          {loadingAction === "Preparing" ? "⏳ Updating..." : "👨‍🍳 Mark Preparing"}
        </button>
      )}

      {order.status === "Preparing" && (
        <button
          onClick={() => handleUpdateStatus("Ready")}
          disabled={loadingAction !== null}
          style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "none", background: "#f97316", color: "#fff", fontWeight: "700", cursor: "pointer", fontSize: "13px", opacity: loadingAction === "Ready" ? 0.7 : 1 }}
        >
          {loadingAction === "Ready" ? "⏳ Updating..." : "🍱 Mark Ready"}
        </button>
      )}

      {order.status === "Assigned" && (
        <button
          onClick={() => handleUpdateStatus("Delivered")}
          disabled={loadingAction !== null}
          style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "none", background: "#10b981", color: "#fff", fontWeight: "700", cursor: "pointer", fontSize: "13px", marginTop: "4px", opacity: loadingAction === "Delivered" ? 0.7 : 1 }}
        >
          {loadingAction === "Delivered" ? "⏳ Updating..." : "📬 Manual Force Deliver"}
        </button>
      )}
    </div>
  );
}
