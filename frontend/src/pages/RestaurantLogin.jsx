import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function RestaurantLogin() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/login", { replace: true });
  }, [navigate]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f8fafc" }}>
      <div style={{ textAlign: "center" }}>
        <h2 style={{ color: "#64748b" }}>Redirecting to Unified Login...</h2>
        <p style={{ color: "#94a3b8" }}>Restaurant dashboard is now integrated into the main login.</p>
      </div>
    </div>
  );
}
