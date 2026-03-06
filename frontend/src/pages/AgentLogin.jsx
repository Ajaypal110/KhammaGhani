import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AgentLogin() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login", { replace: true });
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#122d1a", fontFamily: "Outfit, sans-serif" }}>
      <div style={{ textAlign: "center", background: "#fff", padding: "40px", borderRadius: "24px", boxShadow: "0 20px 50px rgba(0,0,0,0.3)", maxWidth: "400px", width: "90%" }}>
        <div style={{ fontSize: "50px", marginBottom: "20px" }}>🚴</div>
        <h2 style={{ color: "#1e293b", fontWeight: "800", marginBottom: "12px", fontSize: "24px" }}>Agent Portal Integrated</h2>
        <p style={{ color: "#64748b", margin: "0 auto 24px", lineHeight: "1.5" }}>
          We've unified our login system for a better experience. You are being redirected to the main login page.
        </p>
        <div className="loader-line" style={{ width: "100%", height: "4px", background: "#f1f5f9", borderRadius: "2px", overflow: "hidden" }}>
           <div className="loader-progress" style={{ width: "100%", height: "100%", background: "#ff6b00", animation: "progress 2s linear forwards" }} />
        </div>
        <button 
          onClick={() => navigate("/login")}
          style={{ marginTop: "30px", background: "none", border: "none", color: "#ff6b00", fontWeight: "700", cursor: "pointer", fontSize: "14px" }}
        >
          Go to Login Now ➔
        </button>
        <style>{`
          @keyframes progress {
            from { width: 0%; }
            to { width: 100%; }
          }
        `}</style>
      </div>
    </div>
  );
}
