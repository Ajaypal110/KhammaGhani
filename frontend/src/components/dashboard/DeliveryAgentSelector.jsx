import React, { useState } from "react";
import API from "../../api/axios";

export default function DeliveryAgentSelector({ order, availableAgents, refreshOrders, refreshAgents }) {
  const [selectedAgent, setSelectedAgent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAssignAgent = async () => {
    if (!selectedAgent) return alert("Please select an agent.");
    setLoading(true);
    try {
      await API.put(`/orders/${order._id}/assign-agent`, { agentId: selectedAgent });
      refreshOrders();
      refreshAgents();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to assign agent");
    } finally {
      setLoading(false);
    }
  };

  if (order.status !== "Ready") return null;
  if (order.deliveryAgent?.name) return null; // Already assigned

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", background: "#f8fafc", padding: "12px", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
      <div style={{ fontSize: "12px", fontWeight: "700", color: "#475569" }}>Assign Delivery Agent</div>
      <div style={{ display: "flex", gap: "8px" }}>
        <select
          value={selectedAgent}
          onChange={(e) => setSelectedAgent(e.target.value)}
          disabled={loading}
          style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontSize: "13px", fontWeight: "600", outline: "none", backgroundColor: loading ? "#f1f5f9" : "#fff" }}
        >
          <option value="">Select an Agent...</option>
          {availableAgents.map((a) => (
            <option key={a._id} value={a._id}>
              {a.name} ({a.vehicleType})
            </option>
          ))}
        </select>
        <button
          onClick={handleAssignAgent}
          disabled={loading}
          style={{ padding: "10px 16px", borderRadius: "8px", border: "none", background: "#8b5cf6", color: "#fff", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer", fontSize: "13px", whiteSpace: "nowrap", transition: "0.2s", opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "..." : "Assign"}
        </button>
      </div>
    </div>
  );
}
