import { Navigate } from "react-router-dom";

export default function RestaurantProtected({ children }) {
  const token = localStorage.getItem("restaurantToken");
  const role = localStorage.getItem("role");

  if (!token || role !== "restaurant") {
    return <Navigate to="/restaurant/login" />;
  }

  return children;
}
