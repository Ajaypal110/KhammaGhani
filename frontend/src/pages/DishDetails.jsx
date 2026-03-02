import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import Loader from "../components/Loader";
import { useCart } from "../context/CartContext";

export default function DishDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [dish, setDish] = useState(null);

  useEffect(() => {
    const fetchDish = async () => {
      const { data } = await API.get(`/menu/item/${id}`);
      setDish(data);
    };
    fetchDish();
  }, [id]);

  if (!dish) return <div style={{ paddingTop: "100px" }}><Loader /></div>;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#fafafa",
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        style={{
          position: "fixed",
          top: 18,
          left: 18,
          zIndex: 100,
          background: "#fff",
          color: "#1a1a1a",
          border: "1px solid #f0f0f0",
          padding: "10px 20px",
          borderRadius: 12,
          cursor: "pointer",
          fontWeight: 600,
          fontSize: 14,
          fontFamily: "inherit",
          boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
        }}
      >
        ← Back
      </button>

      <div style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "80px 32px 60px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 40,
        alignItems: "start",
      }}>
        {/* Image */}
        <div style={{
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
          border: "1px solid #f0f0f0",
        }}>
          <img
            src={dish.image}
            alt={dish.name}
            style={{ width: "100%", height: 380, objectFit: "cover", display: "block" }}
          />
        </div>

        {/* Info */}
        <div>
          <h1 style={{
            fontSize: 32,
            fontWeight: 800,
            color: "#1a1a1a",
            marginBottom: 8,
            letterSpacing: -0.5,
          }}>
            {dish.name}
          </h1>

          <p style={{
            fontSize: 15,
            color: "#888",
            lineHeight: 1.7,
            marginBottom: 20,
          }}>
            {dish.description}
          </p>

          <div style={{
            fontSize: 28,
            fontWeight: 800,
            color: "#ff6b00",
            marginBottom: 24,
          }}>
            ₹ {dish.price}
          </div>

          {dish.category && (
            <div style={{
              display: "inline-block",
              padding: "6px 16px",
              background: "linear-gradient(135deg, #fef7f0, #ffedd5)",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              color: "#c2410c",
              marginBottom: 24,
            }}>
              {dish.category}
            </div>
          )}

          <button
            onClick={() => {
              addToCart(dish, dish.restaurant);
              alert("Added to cart!");
            }}
            style={{
              display: "block",
              width: "100%",
              padding: "14px 28px",
              background: "linear-gradient(135deg, #ff6b00, #ff8c33)",
              color: "#fff",
              border: "none",
              borderRadius: 14,
              fontWeight: 700,
              fontSize: 16,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.3s",
              letterSpacing: 0.2,
            }}
          >
            🛒 Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}