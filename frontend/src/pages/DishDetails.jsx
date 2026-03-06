import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import Loader from "../components/Loader";
import DietaryIcon from "../components/DietaryIcon";
import { useCart } from "../context/CartContext";
import { FiHeart, FiShare2, FiStar, FiChevronLeft, FiClock, FiMapPin, FiTruck } from "react-icons/fi";
import "../styles/dishDetails.css";
import "../styles/restaurantDetails.css";
import VariationModal from "../components/VariationModal";
import SEO from "../components/SEO";

export default function DishDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cartItems, addToCart } = useCart();
  
  const [dish, setDish] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ totalReviews: 0, avgRating: 0 });
  const [relatedDishes, setRelatedDishes] = useState([]);
  const [restaurantDetails, setRestaurantDetails] = useState(null);
  
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [spiceLevel, setSpiceLevel] = useState("None");
  const [instructions, setInstructions] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedItemForModal, setSelectedItemForModal] = useState(null);

  const [userFavorites, setUserFavorites] = useState([]);
  const [showShareTooltip, setShowShareTooltip] = useState(false);

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

        // Fetch related dishes & restaurant info
        const restaurantId = data.restaurant?._id || data.restaurant;
        if (restaurantId) {
          try {
             // Let's get the full restaurant info to display name, image etc. in sidebar
             const restRes = await API.get(`/restaurants/${restaurantId}`);
             setRestaurantDetails(restRes.data);
          } catch(e) { console.error("Error fetching restaurant info", e); }

          const menuRes = await API.get(`/menu/restaurant/${restaurantId}`);
          let allDishes = menuRes.data;
          
          let related = allDishes.filter(d => d._id !== id && d.category === data.category);
          if (related.length === 0) {
             related = allDishes.filter(d => d._id !== id);
          }
          setRelatedDishes(related.slice(0, 5)); // Top 5 related dishes for sidebar loop
        }

      } catch (err) {
        console.error("Error fetching dish details", err);
      }
    };
    fetchDish();

    // Fetch user favorites
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const { data } = await API.get("/auth/me");
          setUserFavorites(data.favorites || []);
        } catch (err) {
          console.error("Error fetching user:", err);
        }
      }
    };
    fetchUser();
  }, [id]);

  if (!dish) return <div style={{ paddingTop: "100px" }}><Loader /></div>;

  const variations = dish.variations || [];
  const addOns = dish.addOns || [];
  const addOnTotal = selectedAddOns.reduce((acc, curr) => acc + curr.price, 0);
  const unitPrice = (selectedVariant?.price || dish.price || 0) + addOnTotal;
  const totalPrice = unitPrice * quantity;

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
    const restaurantId = dish.restaurant?._id || dish.restaurant;
    addToCart(dish, restaurantId, selectedVariant, quantity, selectedAddOns, spiceLevel, instructions);
    // Remove navigate back from direct Add to Cart click. The user might want to continue looking at the sidebar info.
  };

  const handleToggleFavorite = async (e, menuId) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const targetId = menuId || id;
    const isFavorited = userFavorites.some(fav => (fav._id || fav) === targetId);
    let newFavs;
    if (isFavorited) {
      newFavs = userFavorites.filter(fav => (fav._id || fav) !== targetId);
    } else {
      newFavs = [...userFavorites, targetId]; 
    }
    setUserFavorites(newFavs);

    try {
      const { data } = await API.post(`/auth/favorites/${targetId}`);
      setUserFavorites(data.favorites);
    } catch (err) {
      console.error("Toggle favorite error:", err);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `${dish.name} - KhammaGhani`,
      text: `Check out ${dish.name} on KhammaGhani!`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShowShareTooltip(true);
      setTimeout(() => setShowShareTooltip(false), 2000);
    }
  };

  const isBestseller = (reviewStats.avgRating >= 4.5 && reviewStats.totalReviews > 2) || (dish.rating >= 4.5);
  const prepTime = dish.preparationTime || "15-20 mins";
  const isFavoritedMain = userFavorites.some(fav => (fav._id || fav) === dish._id);
  const resName = restaurantDetails?.name || (dish.restaurant?.name || "The Restaurant");

  const dishSchema = {
    "@context": "https://schema.org",
    "@type": "MenuItem",
    "name": dish.name,
    "description": dish.description,
    "image": dish.image,
    "offers": {
      "@type": "Offer",
      "price": unitPrice,
      "priceCurrency": "INR"
    },
    "suitableForDiet": dish.isVeg ? "https://schema.org/VegetarianDiet" : "https://schema.org/NonVegDiet",
    "nutrition": {
      "@type": "NutritionInformation",
      "calories": dish.calories || "300 calories"
    }
  };

  return (
    <div className="dish-details-page">
      <SEO 
        title={`${dish.name} - Order from ${resName}`}
        description={`Order ${dish.name} online for ₹${unitPrice}. ${dish.description}. Fast delivery from ${resName} on KhammaGhani.`}
        keywords={`${dish.name}, order ${dish.name} online, ${resName} Udaipur, food delivery`}
        image={dish.image}
        url={`/dish/${id}`}
        schema={dishSchema}
      />
      {/* Top action header for native/mobile back feel */}

      <div className="dish-page-header horizontal-header">
        <button className="dish-icon-btn shadow-btn" onClick={() => navigate(-1)}>
          <FiChevronLeft size={24} />
        </button>
        <div className="share-btn-wrapper shadow-btn-wrapper">
           <button className="dish-icon-btn shadow-btn" onClick={handleShare}>
             <FiShare2 size={20} />
           </button>
           {showShareTooltip && <span className="share-tooltip">Link copied!</span>}
        </div>
      </div>

      <div className="dish-horizontal-container">
        
        {/* =================================
            TOP SECTION (Horizontally Split)
        ================================== */}
        <div className="dish-top-split modern-shadow">
           {/* LEFT: Image */}
           <div className="dish-image-side">
              <div className="image-frame">
                 <img 
                   src={dish.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800"} 
                   alt={dish.name} 
                   onError={(e) => {
                     e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800";
                   }}
                 />
                 <button className="in-image-fav-btn" onClick={(e) => handleToggleFavorite(e, dish._id)}>
                   <FiHeart size={24} fill={isFavoritedMain ? "#ef4444" : "rgba(0,0,0,0.5)"} color={isFavoritedMain ? "#ef4444" : "#fff"} />
                 </button>
                 {isBestseller && <span className="bestseller-badge-floating">🔥 Bestseller</span>}
              </div>
              
              {/* Description & Ingredients (Moved under image) */}
              <div className="dish-description-box">
                 <h2 className="section-title mt-24">About this dish</h2>
                 <p className="dish-desc-text large-text">{dish.description}</p>
                 {dish.contents && (
                   <div className="dish-ingredients highlight-box">
                     <span className="highlight-label">Ingredients:</span>
                     <span>{dish.contents}</span>
                   </div>
                 )}
              </div>
           </div>

           {/* RIGHT: Core Info & Booking */}
           <div className="dish-info-side">
              <div className="top-badges-row">
                 <DietaryIcon isVeg={dish.isVeg} size={24} />
                 {dish.category && <span className="dish-tag category">{dish.category}</span>}
                 <span className="dish-tag prep-time">🕒 {prepTime}</span>
              </div>
              
              <h1 className="dish-name-hero">{dish.name}</h1>
              
              <div className="dish-rating-preview" onClick={() => {
                document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                <div className="rating-pill">
                  <FiStar fill="#fff" size={14} /> 
                  <span>{reviewStats.avgRating > 0 ? reviewStats.avgRating.toFixed(1) : (dish.rating || "New")}</span>
                </div>
                <span className="rating-subtitle">
                   {reviewStats.totalReviews > 0 ? `${reviewStats.totalReviews} Ratings` : "Be the first to rate"}
                </span>
              </div>

              <div className="dish-price-hero">
                 ₹{unitPrice}
              </div>

              {/* Customizations right in the hero pane */}
              <div className="dish-customization-options">
                 {variations.length > 0 && (
                  <div className="dish-customize-block">
                    <div className="customize-header">
                      <h3 className="dish-section-label">Portion/Size</h3>
                      <span className="required-badge">REQUIRED</span>
                    </div>
                    <div className="dish-variant-wrap">
                      {variations.map(v => (
                        <label key={v.name} className={`dish-variant-option ${selectedVariant?.name === v.name ? 'selected' : ''}`}>
                          <div className="variant-left">
                            <input type="radio" name="dish-variant" checked={selectedVariant?.name === v.name} onChange={() => setSelectedVariant(v)} className="hidden-radio" />
                            <div className="radio-dot" />
                            <span className="variant-name">{v.name}</span>
                          </div>
                          <span className="variant-price">₹{v.price}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {addOns.length > 0 && (
                  <div className="dish-customize-block">
                    <div className="customize-header">
                      <h3 className="dish-section-label">Add Extras</h3>
                      <span className="optional-badge">OPTIONAL</span>
                    </div>
                    <div className="dish-variant-wrap mt-12">
                      {addOns.map((addon, i) => {
                        const isSelected = selectedAddOns.find(a => a.name === addon.name);
                        return (
                          <label key={i} className={`dish-addon-option ${isSelected ? 'selected' : ''}`}>
                            <div className="variant-left">
                              <input type="checkbox" checked={!!isSelected} onChange={() => toggleAddOn(addon)} className="hidden-checkbox" />
                              <div className="addon-check">{isSelected ? '✓' : ''}</div>
                              <span className="variant-name">{addon.name}</span>
                            </div>
                            <span className="variant-price">+ ₹{addon.price}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="dish-customize-block">
                   <h3 className="dish-section-label mb-8">Special Instructions</h3>
                   <input type="text" className="dish-instructions-input" placeholder="E.g. Make it extra spicy..." value={instructions} onChange={(e) => setInstructions(e.target.value)} maxLength={150} />
                </div>
              </div>

              {/* Add To Cart Hero Bar */}
              <div className="add-cart-hero-segment">
                 <div className="cart-total-display">
                    <div className="total-label">Subtotal</div>
                    <div className="total-val">₹{totalPrice}</div>
                 </div>
                 <div className="hero-cart-controls">
                    <div className="modern-qty-control outline">
                      <button className="qty-btn minus" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                      <span className="qty-val">{quantity}</span>
                      <button className="qty-btn plus" onClick={() => setQuantity(Math.min(20, quantity + 1))}>+</button>
                    </div>
                    <button className="modern-add-cart-btn huge hero-btn" onClick={handleAddToCart}>
                      Add to Cart
                    </button>
                 </div>
              </div>

           </div>
        </div>

        {/* =================================
            BOTTOM SECTIONS
        ================================== */}
        {/* Restaurant Banner */}
        <div className="dish-restaurant-banner modern-shadow" onClick={() => navigate(`/restaurant/${dish.restaurant?._id || dish.restaurant}`)}>
           <div className="res-banner-left">
             {restaurantDetails?.image ? (
               <img src={restaurantDetails.image} alt={resName} className="res-banner-img" />
             ) : (
               <div className="res-banner-placeholder"><FiMapPin size={24} /></div>
             )}
             <div className="res-banner-info">
                <h4>{resName}</h4>
                <div className="res-meta-line">
                   <span className="res-meta-item"><FiStar fill="#fbbf24" stroke="none" /> {restaurantDetails?.rating || "4.2"} Rating</span>
                   <span className="res-meta-divider">•</span>
                   <span className="res-meta-item"><FiTruck /> Delivery in 30-40 min</span>
                </div>
             </div>
           </div>
           <button className="view-res-btn">View Menu <FiChevronLeft style={{transform: 'rotate(180deg)'}} /></button>
        </div>

        {/* Similar Dishes */}
        {relatedDishes.length > 0 && (
          <div className="dish-related-horizontal modern-shadow">
            <h2 className="section-title">You might also like</h2>
            <div className="horizontal-scroll-track">
              {relatedDishes.map((item) => {
                const cartItem = cartItems.find((ci) => ci._id === item._id);
                const qty = cartItem ? cartItem.qty : 0;

                return (
                  <div key={item._id} className="res-card related-card">
                    <div className="res-card-img-box" onClick={() => navigate(`/dish/${item._id}`)} style={{ position: "relative" }}>
                      <img 
                        src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800"} 
                        alt={item.name} 
                        loading="lazy" 
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800";
                        }}
                      />
                      <button 
                        className="fav-heart-btn"
                        style={{ position: "absolute", top: "12px", right: "12px", background: "rgba(255,255,255,0.8)", border: "none", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", backdropFilter: "blur(4px)", zIndex: 5 }}
                        onClick={(e) => handleToggleFavorite(e, item._id)}
                      >
                        {(() => {
                          const isLiked = userFavorites.some(fav => (fav._id || fav) === item._id);
                          return (
                            <FiHeart 
                              fill={isLiked ? "#ef4444" : "none"} 
                              color={isLiked ? "#ef4444" : "#64748b"} 
                              size={18} 
                            />
                          );
                        })()}
                      </button>
                    </div>
                    <div className="res-card-info" onClick={() => navigate(`/dish/${item._id}`)}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                        <DietaryIcon isVeg={item.isVeg} size={14} />
                        <h4 style={{ margin: 0 }}>{item.name}</h4>
                      </div>
                      <div className="res-stars" style={{ color: "#16a34a", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                        ★ 4.8 <span style={{ color: "#94a3b8", fontWeight: "400" }}>(120+)</span>
                      </div>
                      <div className="res-meta mt-2" style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span className="res-price">₹ {item.price || (item.variations?.length > 0 ? item.variations[0].price : "0")}</span>
                        <div onClick={(e) => e.stopPropagation()}>
                          {qty > 0 && !(item.variations?.length > 0 || item.category === "Roti") ? (
                             <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#f1f5f9", borderRadius: "8px", padding: "4px 8px" }}>
                               <button style={{ border: "none", background: "none", cursor: "pointer", color: "#64748b", fontWeight: "bold" }} onClick={() => navigate("/cart")}>View Cart</button>
                             </div>
                           ) : (
                             <button 
                               style={{ background: "#ff6b00", color: "#fff", border: "none", borderRadius: "8px", padding: "6px 16px", fontWeight: "600", fontSize: "13px", cursor: "pointer" }}
                               onClick={() => {
                                 if (item.variations?.length > 0 || item.category === "Roti") {
                                   setSelectedItemForModal(item);
                                 } else {
                                   const rId = item.restaurant?._id || item.restaurant;
                                   addToCart(item, rId);
                                 }
                               }}
                             >
                               ADD
                             </button>
                           )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <div className="dish-reviews-box modern-shadow" id="reviews-section">
            <h2 className="section-title">Customer Reviews</h2>
            <div className="reviews-grid">
              {reviews.slice(0, 6).map(review => (
                <div key={review._id} className="review-grid-card">
                  <div className="rev-card-head">
                    <div className="rev-author-details">
                      {review.user?.profileImage ? (
                        <img src={review.user.profileImage} alt={`${review.user.name}'s profile`} />
                      ) : (
                        <div className="rev-avatar">{review.user?.name?.charAt(0).toUpperCase() || "U"}</div>
                      )}
                      <div>
                        <h5>{review.user?.name || "Verified Diner"}</h5>
                        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="rev-rating-pill">
                      <span>{review.rating}</span> <FiStar fill="#16a34a" size={12} />
                    </div>
                  </div>
                  <p className="rev-comment">"{review.comment || "Amazing flavors and perfect portions."}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      <VariationModal 
        isOpen={!!selectedItemForModal}
        onClose={() => setSelectedItemForModal(null)}
        item={selectedItemForModal}
        onConfirm={(item, variant, qty, addOns, spice, inst) => {
            const rId = item.restaurant?._id || item.restaurant;
            addToCart(item, rId, variant, qty, addOns, spice, inst);
        }}
      />

    </div>
  );
}