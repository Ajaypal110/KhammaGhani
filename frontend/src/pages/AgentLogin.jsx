import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function AgentLogin() {
  const navigate = useNavigate();
  const [agentId, setAgentId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await API.post("/agent-portal/login", { agentId, password });
      
      localStorage.setItem("agentToken", data.token);
      localStorage.setItem("agentName", data.name);
      
      navigate("/agent/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid login credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f8fafc" }}>
      <div style={{ background: "#fff", padding: "40px", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", width: "100%", maxWidth: "400px" }}>
        
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 style={{ color: "#ff6b00", fontSize: "28px", margin: "0 0 8px" }}>🚴 Agent Login</h1>
          <p style={{ color: "#64748b", margin: 0 }}>Welcome back, Partner!</p>
        </div>

        {error && <div style={{ background: "#fef2f2", color: "#ef4444", padding: "12px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px", textAlign: "center", border: "1px solid #fee2e2" }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "600", color: "#334155" }}>Agent ID</label>
            <input
              type="text"
              placeholder="Enter your Agent ID"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              required
              style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "16px", outline: "none" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "600", color: "#334155" }}>Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "16px", outline: "none" }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? "#fdba74" : "#ff6b00",
              color: "#fff",
              padding: "14px",
              borderRadius: "10px",
              border: "none",
              fontSize: "16px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "0.2s",
              marginTop: "8px"
            }}
          >
            {loading ? "Verifying..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
