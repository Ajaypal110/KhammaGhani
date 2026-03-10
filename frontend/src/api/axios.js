import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const API = axios.create({
  baseURL: `${API_BASE}/api`,
});

API.interceptors.request.use((req) => {
  // Only use restaurantToken for the DASHBOARD and restaurant LOGIN pages
  // /restaurant/dashboard and /restaurant/login are restaurant-owner pages
  // /restaurant/:id is a USER page (viewing a restaurant), so use user token
  // Unified Token Logic
  // Prefer the generic 'token', then fallback to role-specific ones for legacy support
  const token = localStorage.getItem("token") ||
    localStorage.getItem("restaurantToken") ||
    localStorage.getItem("agentToken");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export { API_BASE };
export default API;
