import { useNavigate } from "react-router-dom";
import { FiShoppingCart, FiUser, FiLogOut, FiSearch, FiHeart, FiFilter, FiX } from "react-icons/fi";
import { FaPlay } from "react-icons/fa";
import "../styles/home.css";
import { useEffect, useState, useMemo } from "react";
import API from "../api/axios";
import Loader from "../components/Loader";
import { useCart } from "../context/CartContext";
import DietaryIcon from "../components/DietaryIcon";
import VariationModal from "../components/VariationModal";
import SEO from "../components/SEO";

export default function Home() {
  const navigate = useNavigate();

  const homeSchema = {
    "@context": "https://schema.org",
    "@type": "FoodEstablishment",
    "name": "KhammaGhani",
    "url": "https://khammaghani.online",
    "logo": "https://khammaghani.online/logo.png",
    "image": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800",
    "description": "Experience authentic Rajasthani flavors and multi-cuisine delights at KhammaGhani. Order online for fast delivery.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Udaipur",
      "addressRegion": "Rajasthan",
      "addressCountry": "IN"
    },
    "servesCuisine": ["Rajasthani", "Chinese", "Thai", "North Indian"],
    "priceRange": "₹₹"
  };

  const [showProfile, setShowProfile] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceSort, setPriceSort] = useState("None"); // 'None', 'Low to High', 'High to Low'
  const [selectedRestaurantFilter, setSelectedRestaurantFilter] = useState("All");
  const [dietaryFilter, setDietaryFilter] = useState("All"); // 'All', 'Veg', 'Non-Veg'
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedItemForModal, setSelectedItemForModal] = useState(null);
  const [visibleDishesCount, setVisibleDishesCount] = useState(8);

  const categoriesWithImages = [
    { name: "All", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800" },
    { name: "Starters", image: "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&q=80&w=800" },
    { name: "Main Course", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=800" },
    { name: "Rajasthani", image: "https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=400", emoji: "🍛" },
    { name: "Chinese", image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=800" },
    { name: "Thai", image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=800" },
    { name: "Desserts", image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=800" },
    { name: "Beverages", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=800" },
    { name: "Thali", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800" },
  ];

  const { cartItems, addToCart, removeFromCart } = useCart();
  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const [userFavorites, setUserFavorites] = useState([]);

  useEffect(() => {
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
  }, []);

  const handleToggleFavorite = async (e, menuId) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Optimistic UI update
    const isFavorited = userFavorites.some(fav => (fav._id || fav) === menuId);
    let newFavs;
    if (isFavorited) {
      newFavs = userFavorites.filter(fav => (fav._id || fav) !== menuId);
    } else {
      newFavs = [...userFavorites, menuId]; 
    }
    setUserFavorites(newFavs);

    try {
      const { data } = await API.post(`/auth/favorites/${menuId}`);
      setUserFavorites(data.favorites);
    } catch (err) {
      console.error("Toggle favorite error:", err);
    }
  };

  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  /* ================= LOGOUT ================= */
  const logoutHandler = () => {
    localStorage.removeItem("token");
    setShowProfile(false);
    navigate("/login");
  };

  const goProfile = () => {
    setShowProfile(false);
    navigate("/profile");
  };

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const resData = await API.get("/restaurants");
        setRestaurants(resData.data);

        const menuData = await API.get("/menu");
        setMenuItems(menuData.data);
      } catch (error) {
        console.error("API error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ================= SEARCH & FILTER LOGIC ================= */
  const filteredRestaurants = restaurants.filter((r) =>
    r.name?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredMenuItems = useMemo(() => {
    let filtered = [...menuItems];

    // Filter by Category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(item => 
        item.category && item.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by Restaurant
    if (selectedRestaurantFilter !== "All") {
      filtered = filtered.filter(item => {
        const resId = item.restaurant?._id || item.restaurant;
        return resId === selectedRestaurantFilter;
      });
    }

    // Sort by Price
    if (priceSort === "Low to High") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (priceSort === "High to Low") {
      filtered.sort((a, b) => b.price - a.price);
    }

    // Filter by Dietary (Veg/Non-Veg)
    if (dietaryFilter !== "All") {
      const isVegTarget = dietaryFilter === "Veg";
      filtered = filtered.filter(item => {
        const itemIsVeg = item.isVeg === true || item.isVeg === "true" || item.isVeg === undefined;
        return itemIsVeg === isVegTarget;
      });
    }

    return filtered;
  }, [menuItems, selectedCategory, selectedRestaurantFilter, priceSort, dietaryFilter]);

  return (
    <div className="home">
      <SEO 
        description="Order delicious food from KhammaGhani - Rajasthan's favorite food delivery platform. Authentic taste, fast delivery, and top-rated restaurants."
        keywords="food delivery Udaipur, Rajasthani food, order food online, KhammaGhani, best restaurants Udaipur"
        schema={homeSchema}
      />
      {/* Navbar is now handled globally in App.jsx */}


      {/* ================= HERO SECTION ================= */}
      <section className="hero-wrapper">
        <div className="hero-container">
          <div className="hero-content">
            <h1>Experience Adventure in Every Dish We Serve</h1>
            <p>Order delicious, authentic Rajasthani food and more from top-rated restaurants near you. Fast delivery, unmatched taste.</p>
            <div className="hero-buttons">
              <button className="btn-primary" onClick={() => {
                document.getElementById('restaurantsList').scrollIntoView({ behavior: 'smooth' });
              }}>Order Now ➔</button>
            </div>
          </div>
        </div>

        <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" alt="Delicious Food Plate - KhammaGhani" className="hero-food-plate" style={{borderRadius: "50%"}} />

        <div className="hero-wave">
          <svg viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="#fdfdfd" fillOpacity="1" d="M0,192L48,192C96,192,192,192,288,181.3C384,171,480,149,576,160C672,171,768,213,864,229.3C960,245,1056,235,1152,208C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {loading ? (
        <Loader />
      ) : (
        <>
          {/* ================= FEATURED BANNER ================= */}
          <section className="featured-section">
            <div className="featured-text">
              <h2>Captivating Culinary Favorites.</h2>
              <p>On the other hand, we denounce with righteous indignation and dislike men who are so beguiled and demoralized by the charms of pleasure of the moment.</p>
              <button className="btn-primary" onClick={() => {
              document.getElementById('menuList').scrollIntoView({ behavior: 'smooth' });
              }}>Get Menu ➔</button>
            </div>
            <div className="featured-img-grid">
              <img src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" alt="Chef preparing authentic Rajasthani dish" />
              <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" alt="Freshly served gourmet meal" />
            </div>
          </section>

          {/* ================= MENU SECTION ================= */}
          {menuItems.length > 0 && (
            <section className="restaurants-wrapper" id="menuList">
              <span className="section-tag">A Menu That Always Makes You Fall In Love</span>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "20px" }}>
                <h2 style={{ marginBottom: 0 }}>Popular Dishes</h2>
                <button 
                  onClick={() => setShowFilterModal(true)}
                  style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", borderRadius: "20px", border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontWeight: "600", color: "#1e293b", transition: "all 0.2s" }}
                >
                  <FiFilter size={16} /> Filters
                </button>
              </div>

              {/* Enhanced Categories Scroll */}
              <div className="home-categories-scroll" style={{ display: "flex", gap: "16px", overflowX: "auto", paddingBottom: "20px", marginBottom: "30px", paddingRight: "100px" }}>
                {categoriesWithImages.map(cat => (
                  <div 
                    key={cat.name}
                    className={`home-category-card ${selectedCategory === cat.name ? 'active' : ''}`}
                    onClick={() => { setSelectedCategory(cat.name); setVisibleDishesCount(8); }}
                  >
                    <div className="category-card-icon">
                      <img 
                        src={cat.image} 
                        alt={`${cat.name} food category`}
                        loading="lazy"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `<span style="font-size:32px">${cat.emoji || '🍽️'}</span>`;
                        }}
                      />
                    </div>
                    <span className="category-card-name">{cat.name}</span>
                  </div>
                ))}
              </div>

              <div className="menu-grid">
                {filteredMenuItems.slice(0, visibleDishesCount).map((item) => {
                  const cartItem = cartItems.find((ci) => ci._id === item._id);
                  const qty = cartItem ? cartItem.qty : 0;
                  
                  return (
                    <div key={item._id} className="res-card">
                      <div className="res-card-img-box" onClick={() => navigate(`/dish/${item._id}`)} style={{ position: "relative" }}>
                        <img src={item.image} alt={item.name} loading="lazy" />
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
                        {(item.variations?.length > 0 || item.contents) && (
                          <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "8px", background: "#f8fafc", padding: "2px 6px", borderRadius: "4px", display: "inline-block" }}>
                            {item.category === "Thali" ? "📦 " : ["Beverages", "Desserts"].includes(item.category) ? "🥤 Sizes: " : "⚖️ Portions: "}
                            {item.variations?.length > 0 
                              ? item.variations.map(v => v.name).join(", ") 
                              : item.contents}
                          </div>
                        )}
                        <div className="res-meta mt-2" style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span className="res-price">₹ {item.price || (item.variations?.length > 0 ? item.variations[0].price : "0")}</span>
                          
                          <div onClick={(e) => e.stopPropagation()}>
                            {qty > 0 && !(item.variations?.length > 0 || item.category === "Roti") ? (
                               <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#f1f5f9", borderRadius: "8px", padding: "4px 8px" }}>
                                 <button style={{ border: "none", background: "none", cursor: "pointer", color: "#64748b", fontWeight: "bold" }} onClick={() => removeFromCart(item._id)}>−</button>
                                 <span style={{ fontWeight: "600", fontSize: "14px" }}>{qty}</span>
                                 <button style={{ border: "none", background: "none", cursor: "pointer", color: "#ff6b00", fontWeight: "bold" }} onClick={() => addToCart(item, item.restaurant)}>+</button>
                               </div>
                             ) : (
                               <button 
                                 style={{ background: "#ff6b00", color: "#fff", border: "none", borderRadius: "8px", padding: "6px 16px", fontWeight: "600", fontSize: "13px", cursor: "pointer" }}
                                 onClick={() => {
                                   if (item.variations?.length > 0 || item.category === "Roti") {
                                     setSelectedItemForModal(item);
                                   } else {
                                     addToCart(item, item.restaurant);
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

              {filteredMenuItems.length === 0 && (
                <div style={{ padding: "40px", background: "#f8fafc", borderRadius: "16px", color: "#64748b", marginTop: "20px" }}>
                  No dishes found matching your current filters.
                </div>
              )}

              {filteredMenuItems.length > visibleDishesCount && (
                <button 
                  onClick={() => setVisibleDishesCount(prev => prev + 8)}
                  style={{ marginTop: "40px", padding: "12px 32px", borderRadius: "30px", border: "2px solid #e2e8f0", background: "transparent", color: "#1e293b", fontWeight: "700", cursor: "pointer" }}
                >
                  View More Dishes
                </button>
              )}
            </section>
          )}

          {/* ================= RESTAURANTS SECTION ================= */}
          <section className="restaurants-wrapper" id="restaurantsList" style={{background: '#fdfdfd'}}>
            <span className="section-tag">Find Your Favorite Spot</span>
            <h2>Our Top Rated Restaurants</h2>

            {/* In-page basic search for restaurants */}
            <input 
              id="homeSearchInput"
              type="text" 
              placeholder="Search Restaurants..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{padding: '12px 20px', width: '100%', maxWidth: '400px', borderRadius: '30px', border: '1px solid #ccc', marginBottom: '30px'}}
            />

            <div className="restaurant-grid">
              {filteredRestaurants.length === 0 ? (
                <p>No restaurants found</p>
              ) : (
                filteredRestaurants.map((res) => (
                  <div
                    key={res._id}
                    className="res-card"
                    onClick={() => navigate(`/restaurant/${res._id}`)}
                  >
                    <div className="res-card-img-box">
                      {res.restaurantImages && res.restaurantImages.length > 0 ? (
                        <img src={res.restaurantImages[0]} alt={res.name} loading="lazy" />
                      ) : (
                        <div style={{width:'100%', height:'100%', background:'#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center', fontSize: '40px'}}>🍽️</div>
                      )}
                    </div>
                    <div className="res-card-info">
                      <h4>{res.name}</h4>
                      <p style={{ 
                        fontSize: "12px", 
                        color: "#64748b", 
                        overflow: "hidden", 
                        textOverflow: "ellipsis", 
                        whiteSpace: "nowrap",
                        margin: "4px 0"
                      }}>
                        📍 {res.address || res.restaurantId || "Rajasthan"}
                      </p>
                      <div className="res-meta">
                        <span className="res-stars">★ {res.rating || "4.5"}</span>
                        <span style={{ fontSize: '12px', fontWeight: 'bold', color: res.isOpen !== false ? '#16a34a' : '#ef4444'}}>
                          {res.isOpen !== false ? "OPEN" : "CLOSED"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* ================= APP BANNER ONLY ================= */}
          <section className="app-reservation-section" style={{ gridTemplateColumns: "1fr" }}>
            <div className="app-promo-box" style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
              <h3>Begin Your Journey<br/>with KhammaGhani Today!</h3>
              <p>Download our mobile app to track your live orders, get exclusive App-only discounts, and uncover Rajasthan's best kept culinary secrets.</p>
              <div className="app-badges" style={{ justifyContent: "center" }}>
                <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Play Store" />
              </div>
            </div>
          </section>

          {/* ================= FILTER MODAL ================= */}
          {showFilterModal && (
            <div className="filter-overlay" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.6)", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
              <div className="filter-modal" style={{ background: "#fff", width: "90%", maxWidth: "400px", borderRadius: "24px", padding: "30px", position: "relative", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
                <button onClick={() => setShowFilterModal(false)} style={{ position: "absolute", top: "20px", right: "20px", background: "#f1f5f9", border: "none", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b" }}>
                  <FiX size={18} />
                </button>
                
                <h3 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "24px", color: "#1e293b" }}>Filter Dishes</h3>
                
                <div style={{ marginBottom: "24px" }}>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#475569", marginBottom: "12px" }}>Sort by Price</label>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {["None", "Low to High", "High to Low"].map(sort => (
                      <button 
                        key={sort}
                        onClick={() => setPriceSort(sort)}
                        style={{ padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", border: priceSort === sort ? "1px solid #ff6b00" : "1px solid #e2e8f0", background: priceSort === sort ? "#fff7f2" : "#fff", color: priceSort === sort ? "#ff6b00" : "#64748b", cursor: "pointer" }}
                      >
                        {sort}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: "30px" }}>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#475569", marginBottom: "12px" }}>From Restaurant</label>
                  <select 
                    value={selectedRestaurantFilter}
                    onChange={(e) => setSelectedRestaurantFilter(e.target.value)}
                    style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#f8fafc", outline: "none", fontSize: "14px", color: "#1e293b", fontFamily: "inherit" }}
                  >
                    <option value="All">All Restaurants</option>
                    {restaurants.map(res => (
                      <option key={res._id} value={res._id}>{res.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: "30px" }}>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#475569", marginBottom: "12px" }}>Dietary Preference</label>
                  <div style={{ display: "flex", gap: "10px" }}>
                    {["All", "Veg", "Non-Veg"].map(type => (
                      <button 
                        key={type}
                        onClick={() => setDietaryFilter(type)}
                        style={{ 
                          flex: 1, 
                          padding: "10px", 
                          borderRadius: "10px", 
                          fontSize: "13px", 
                          fontWeight: "600", 
                          border: dietaryFilter === type ? "1px solid #ff6b00" : "1px solid #e2e8f0", 
                          background: dietaryFilter === type ? "#fff7f2" : "#fff", 
                          color: dietaryFilter === type ? "#ff6b00" : "#64748b", 
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px"
                        }}
                      >
                        {type === "Veg" && <DietaryIcon isVeg={true} size={12} />}
                        {type === "Non-Veg" && <DietaryIcon isVeg={false} size={12} />}
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                  <button 
                    onClick={() => { setPriceSort("None"); setSelectedRestaurantFilter("All"); setDietaryFilter("All"); }}
                    style={{ flex: 1, padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: "600", cursor: "pointer" }}
                  >
                    Clear All
                  </button>
                  <button 
                    onClick={() => setShowFilterModal(false)}
                    style={{ flex: 1, padding: "14px", borderRadius: "12px", border: "none", background: "#ff6b00", color: "#fff", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 15px rgba(255, 107, 0, 0.2)" }}
                  >
                    Apply
                  </button>
                </div>

              </div>
            </div>
          )}

          <VariationModal 
            isOpen={!!selectedItemForModal}
            onClose={() => setSelectedItemForModal(null)}
            item={selectedItemForModal}
            onConfirm={(item, variant, qty, addOns, spice, instructions) => addToCart(item, item.restaurant, variant, qty, addOns, spice, instructions)}
          />
        </>
      )}
    </div>
  );
}