import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import "../styles/auth.css";

export default function RestaurantLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const { data } = await API.post("/restaurant/auth/login", {
        email,
        password,
      });

      localStorage.setItem("restaurantToken", data.token);
      localStorage.setItem("role", "restaurant");
      localStorage.setItem("restaurantName", data.name || "Restaurant");

      navigate("/restaurant/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={submitHandler}>
        <h2>Restaurant Login</h2>

        {error && <p className="auth-message">{error}</p>}

        <input
          type="email"
          placeholder="Restaurant Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Login</button>
      </form>
    </div>
  );
}
