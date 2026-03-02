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
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ totalReviews: 0, avgRating: 0 });

  useEffect(() => {
    const fetchDish = async () => {
      try {
        const { data } = await API.get(`/menu/item/${id}`);
        setDish(data);

        const revRes = await API.get(`/reviews/Menu/${id}`);
        setReviews(revRes.data.reviews || []);
        setReviewStats(revRes.data.stats || { totalReviews: 0, avgRating: 0 });
      } catch (err) {
        console.error("Error fetching dish details", err);
      }
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

          {reviewStats.totalReviews > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", fontSize: "15px", color: "#64748b" }}>
              <span style={{ color: "#ff6b00", fontWeight: "700" }}>⭐ {reviewStats.avgRating}</span>
              <span>({reviewStats.totalReviews} reviews)</span>
            </div>
          )}

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

      {/* ===== DISH REVIEWS SECTION ===== */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 32px 80px" }}>
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "20px", borderTop: "1px solid #e2e8f0", paddingTop: "40px"}}>
          <div>
            <h2 style={{marginBottom: "8px", fontSize: "24px", color: "#1e293b"}}>⭐ What People Say</h2>
            <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
               <span style={{fontSize: "28px", fontWeight: "800", color: "#ff6b00"}}>{reviewStats.avgRating > 0 ? reviewStats.avgRating : "New"}</span>
               <div style={{fontSize: "14px", color: "#64748b"}}>
                 <div style={{color: "#fbbf24", fontSize: "16px"}}>
                    {'★'.repeat(Math.round(reviewStats.avgRating || 0))}
                    <span style={{color: "#cbd5e1"}}>{'★'.repeat(5 - Math.round(reviewStats.avgRating || 0))}</span>
                 </div>
                 Based on {reviewStats.totalReviews} verified ratings
               </div>
            </div>
          </div>
          <div style={{fontSize: "13px", color: "#64748b", background: "#f8fafc", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0"}}>
            ℹ️ Only users with completed orders can review dishes.
          </div>
        </div>

        {reviews.length === 0 ? (
          <p style={{textAlign: "left", background: "#fff", padding: "30px", borderRadius: "12px", border: "1px dashed #cbd5e1", color: "#64748b"}}>
            No reviews for this dish yet. Order now and let us know how you liked it!
          </p>
        ) : (
          <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "20px"}}>
             {reviews.map(review => (
               <div key={review._id} style={{background: "#fff", padding: "20px", borderRadius: "16px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)", border: "1px solid #f1f5f9"}}>
                 <div style={{display: "flex", justifyContent: "space-between", marginBottom: "12px", alignItems: "center"}}>
                   <div style={{display: "flex", alignItems: "center", gap: "12px"}}>
                     {review.user?.profileImage ? (
                        <img src={review.user.profileImage} alt="User" style={{width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover"}} />
                     ) : (
                        <div style={{width: "40px", height: "40px", borderRadius: "50%", background: "#ff6b00", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold"}}>
                          {review.user?.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                     )}
                     <div>
                       <div style={{fontWeight: "600", fontSize: "15px", color: "#1e293b"}}>{review.user?.name || "Guest"}</div>
                       <div style={{fontSize: "12px", color: "#94a3b8"}}>{new Date(review.createdAt).toLocaleDateString()}</div>
                     </div>
                   </div>
                   <div style={{color: "#fbbf24", fontSize: "16px"}}>
                     {'★'.repeat(review.rating)}<span style={{color: "#cbd5e1"}}>{'★'.repeat(5 - review.rating)}</span>
                   </div>
                 </div>
                 {review.comment && (
                   <p style={{fontSize: "14px", color: "#475569", lineHeight: "1.6", margin: "0"}}>
                     "{review.comment}"
                   </p>
                 )}
                 <div style={{marginTop: "12px", display: "inline-block", fontSize: "11px", padding: "4px 8px", background: "#f0fdf4", color: "#16a34a", borderRadius: "4px", fontWeight: "600"}}>
                   ✓ Verified Delivery Order
                 </div>
               </div>
             ))}
          </div>
        )}
      </div>

    </div>
  );
}