import React from "react";
import { Navigate } from "react-router-dom";

export default function AgentProtected({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "deliveryAgent") {
    return <Navigate to="/login" replace />;
  }

  return children;
}
