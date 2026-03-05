import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import Loader from "../components/Loader";
import DietaryIcon from "../components/DietaryIcon";
import { useCart } from "../context/CartContext";
import "../styles/dishDetails.css";
import "../styles/restaurantDetails.css";

export default function DishDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [dish, setDish] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ totalReviews: 0, avgRating: 0 });

  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [spiceLevel, setSpiceLevel] = useState("None");
  const [instructions, setInstructions] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchDish = async () => {
      try {
        const { data } = await API.get(`/menu/item/${id}`);
        setDish(data);
        setSpiceLevel(data.spiceLevel || "None");
        
        if (data.variations && data.variations.length > 0) {
          setSelectedVariant(data.variations[0]);
        }

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

  const variations = dish.variations || [];
  const addOns = dish.addOns || [];
  const addOnTotal = selectedAddOns.reduce((acc, curr) => acc + curr.price, 0);
  const unitPrice = (selectedVariant?.price || dish.price) + addOnTotal;

  const toggleAddOn = (addon) => {
    if (selectedAddOns.find(a => a.name === addon.name)) {
      setSelectedAddOns(selectedAddOns.filter(a => a.name !== addon.name));
    } else {
      setSelectedAddOns([...selectedAddOns, addon]);
    }
  };

  const handleAddToCart = () => {
    if (variations.length > 0 && !selectedVariant) {
      alert("Please select a size/portion first");
      return;
    }
    addToCart(dish, dish.restaurant, selectedVariant, quantity, selectedAddOns, spiceLevel, instructions);
    navigate(-1);
  };

  return (
    <div className="dish-details-page">
      {/* Back Button */}
      <button className="dish-back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      {/* Hero Image */}
      <div className="dish-hero-image">
        <img src={dish.image} alt={dish.name} />
        <div className="dish-hero-gradient" />
      </div>

      {/* Content */}
      <div className="dish-content-wrapper">
        
        {/* Info Card */}
        <div className="dish-info-card">
          <div className="dish-header">
            <div className="dish-title-group">
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                <DietaryIcon isVeg={dish.isVeg} size={20} />
                <h1 className="dish-name">{dish.name}</h1>
              </div>
              <div className="dish-meta-tags">
                {dish.category && <span className="dish-tag category">{dish.category}</span>}
                {dish.cuisineType && <span className="dish-tag">{dish.cuisineType}</span>}
              </div>
            </div>
            <div className="dish-price-badge">
              ₹{unitPrice * quantity}
            </div>
          </div>

          <p className="dish-description">{dish.description}</p>

          {/* Rating */}
          {reviewStats.totalReviews > 0 && (
            <div className="dish-rating-bar">
              <div className="dish-rating-score">
                ★ {reviewStats.avgRating?.toFixed(1) || "0"}
              </div>
              <span className="dish-rating-count">{reviewStats.totalReviews} ratings</span>
            </div>
          )}
        </div>

        {/* Variations */}
        {variations.length > 0 && (
          <div className="dish-customize-card">
            <h3 className="dish-section-label">
              {["Beverages", "Desserts"].includes(dish.category) ? "🥤 Select Size" : "⚖️ Select Portion"}
              <span className="required">• Required</span>
            </h3>
            <div className="dish-variant-list">
              {variations.map(v => (
                <div 
                  key={v.name}
                  className={`dish-variant-option ${selectedVariant?.name === v.name ? 'selected' : ''}`}
                  onClick={() => setSelectedVariant(v)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div className="radio-dot" />
                    <span className="variant-name">{v.name}</span>
                  </div>
                  <span className="variant-price">₹{v.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add-ons */}
        {addOns.length > 0 && (
          <div className="dish-customize-card">
            <h3 className="dish-section-label">➕ Add Extras</h3>
            <div className="dish-variant-list">
              {addOns.map((addon, i) => {
                const isSelected = selectedAddOns.find(a => a.name === addon.name);
                return (
                  <div 
                    key={i} 
                    className={`dish-addon-option ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleAddOn(addon)}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <div className="addon-check">{isSelected ? '✓' : ''}</div>
                      <span style={{ fontSize: "15px", fontWeight: "600", color: "#374151" }}>{addon.name}</span>
                    </div>
                    <span style={{ fontSize: "15px", fontWeight: "800", color: "#1c1c1c" }}>+ ₹{addon.price}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="dish-customize-card">
          <h3 className="dish-section-label">📝 Special Instructions</h3>
          <textarea 
            className="dish-instructions-textarea"
            placeholder="Any special requests? (No onions, extra spicy, etc.)"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />
        </div>

        {/* Reviews */}
        {reviews.length > 0 && (
          <div style={{ marginTop: "32px" }}>
            <div className="dish-reviews-header">
              <div>
                <h2 className="dish-reviews-title">What diners say</h2>
                <div className="dish-reviews-stat">
                  <span className="dish-reviews-avg">{reviewStats.avgRating > 0 ? reviewStats.avgRating.toFixed(1) : "New"}</span>
                  <div>
                    <div className="dish-reviews-stars">
                      {'★'.repeat(Math.round(reviewStats.avgRating || 0))}
                      <span className="empty">{'★'.repeat(5 - Math.round(reviewStats.avgRating || 0))}</span>
                    </div>
                    <span className="dish-reviews-count">{reviewStats.totalReviews} verified ratings</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="reviews-masonry-grid">
              {reviews.map(review => (
                <div key={review._id} className="review-card">
                  <div className="review-stars">
                    {'★'.repeat(review.rating)}<span className="review-empty-star">{'★'.repeat(5 - review.rating)}</span>
                  </div>
                  <div className="review-title">
                    {review.rating >= 4 ? "Delicious!" : review.rating === 3 ? "It was okay" : "Not my favorite"}
                  </div>
                  <p className="review-text">
                    {review.comment || "Great dish! Really enjoyed the flavors and portion size."}
                  </p>
                  <div className="review-author">
                    {review.user?.profileImage ? (
                      <img src={review.user.profileImage} alt="User" className="review-author-img" />
                    ) : (
                      <div className="review-author-fallback">
                        {review.user?.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                    )}
                    <div className="review-author-info">
                      <span className="review-author-name">{review.user?.name || "Guest"}</span>
                      <span className="review-author-date">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {reviews.length === 0 && (
          <div style={{ marginTop: "24px", background: "#fff", padding: "30px", borderRadius: "16px", textAlign: "center", color: "#9ca3af" }}>
            No reviews for this dish yet. Order now and let us know how you liked it!
          </div>
        )}
      </div>

      {/* Sticky Bottom Bar */}
      <div className="dish-bottom-bar">
        <div className="dish-qty-control">
          <button className="dish-qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
          <span className="dish-qty-val">{quantity}</span>
          <button className="dish-qty-btn plus" onClick={() => setQuantity(quantity + 1)}>+</button>
        </div>
        <button className="dish-add-cart-btn" onClick={handleAddToCart}>
          Add to Cart • ₹{(unitPrice || (variations.length > 0 ? variations[0].price : 0)) * quantity}
        </button>
      </div>
    </div>
  );
}