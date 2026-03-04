import axios from "axios";

const API_BASE = "http://localhost:5000";

const API = axios.create({
  baseURL: `${API_BASE}/api`,
});

API.interceptors.request.use((req) => {
  // Only use restaurantToken for the DASHBOARD and restaurant LOGIN pages
  // /restaurant/dashboard and /restaurant/login are restaurant-owner pages
  // /restaurant/:id is a USER page (viewing a restaurant), so use user token
  const path = window.location.pathname;
  const isRestaurantOwnerPage =
    path === "/restaurant/dashboard" || path === "/restaurant/login";
  const isAgentPage = path.startsWith("/agent");

  let token;
  if (isRestaurantOwnerPage) {
    token = localStorage.getItem("restaurantToken");
  } else if (isAgentPage) {
    token = localStorage.getItem("agentToken");
  } else {
    token = localStorage.getItem("token");
  }

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export { API_BASE };
export default API;
