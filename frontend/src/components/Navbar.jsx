import { useNavigate, useLocation } from "react-router-dom";
import { FiShoppingCart, FiUser, FiLogOut, FiSearch } from "react-icons/fi";
import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import API from "../api/axios";
import "../styles/home.css"; 

export default function Navbar() {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [user, setUser] = useState(null);

  const { cartItems } = useCart();
  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  useEffect(() => {
    if (isLoggedIn && !user) {
      API.get("/auth/me").then(res => setUser(res.data)).catch(console.error);
    }
  }, [isLoggedIn, user]);

  useEffect(() => {
    if (searchQuery.length > 0 && restaurants.length === 0) {
      Promise.all([API.get("/restaurants"), API.get("/menu")])
        .then(([resData, menuData]) => {
          setRestaurants(resData.data);
          setMenuItems(menuData.data);
        })
        .catch(console.error);
    }
    if (searchQuery.length > 0) setShowSearch(true);
    else setShowSearch(false);
  }, [searchQuery]);

  const filteredRestaurants = restaurants.filter(r => r.name?.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredDishes = menuItems.filter(m => m.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.split(" ").filter(p => p.length > 0);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  };

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

  /* Only show transparent/absolute nature if we're on the homepage hero. 
     Otherwise, make it solid green and relative on pages like Profile/Cart */
  const isHome = location.pathname === "/";

  return (
    <nav 
      className="navbar" 
      style={isHome ? {} : { position: "sticky", borderBottom: "5px solid #ff6b00" }}
    >
      <div className="brand" onClick={() => navigate("/")}>
        <div className="brand-icon" style={{background: "#fff", color: "#112918"}}>KG</div>
        <span className="brand-main" style={{fontFamily: "'Outfit', sans-serif", letterSpacing: "-1px", fontSize: "26px", color: "#fff"}}>Khamma</span>
        <span className="brand-accent" style={{fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.5px", fontSize: "26px", color: "#ff6b00", marginLeft: 0}}>Ghani</span>
      </div>

      <div className="nav-links">
        <a href="/" className={isHome ? "active" : ""}>Home</a>
        <a href="#">About Us</a>
        <a href="#">Contact Us</a>
      </div>

      <div className="nav-actions">
        {!isLoggedIn && (
          <>
            <button onClick={() => navigate("/login")}>Login</button>
            <button
              className="restaurant-btn-nav"
              onClick={() => navigate("/restaurant/login")}
            >
              Restaurant Login
            </button>
          </>
        )}

        {isLoggedIn && (
          <div className="nav-icons" style={{display: "flex", alignItems: "center", gap: "24px"}}>
            
            {/* PERSISTENT SEARCH BAR */}
            <div className="nav-search-wrapper" style={{ position: "relative" }}>
              <div style={{
                display: "flex", alignItems: "center", background: "rgba(255,255,255,0.1)",
                borderRadius: "30px", padding: "6px 16px", border: "1px solid rgba(255,255,255,0.2)",
                transition: "all 0.3s"
              }}>
                <FiSearch style={{ color: "#fff", marginRight: "8px", fontSize: "16px" }} />
                <input 
                  type="text" 
                  placeholder="Search restaurants & dishes..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    background: "transparent", border: "none", color: "#fff", 
                    outline: "none", width: "220px", fontSize: "14px", fontFamily: "inherit"
                  }}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} style={{background: "transparent", border: "none", color: "#fff", cursor: "pointer", padding: "0 4px"}}>✕</button>
                )}
              </div>
            </div>

            <div className="cart-icon-wrapper" style={{ position: "relative", cursor: "pointer", display: "flex", alignItems: "center" }} onClick={() => navigate("/cart")}>
              <FiShoppingCart className="nav-icon" />
              {cartCount > 0 && (
                <span style={{
                  position: "absolute",
                  top: "-8px",
                  right: "-12px",
                  background: "#ff6b00",
                  color: "white",
                  fontSize: "12px",
                  fontWeight: "bold",
                  borderRadius: "50%",
                  padding: "2px 6px",
                }}>
                  {cartCount}
                </span>
              )}
            </div>

            <div className="profile-box">
              <div 
                onClick={() => setShowProfile((prev) => !prev)} 
                style={{ 
                  width: "36px", height: "36px", borderRadius: "50%", 
                  background: user?.profileImage ? "transparent" : "#ff6b00", 
                  color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", overflow: "hidden", border: "2px solid rgba(255,107,0,0.5)",
                  fontWeight: "bold", fontSize: "14px"
                }}
              >
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  user ? getInitials(user.name) : <FiUser />
                )}
              </div>

              {showProfile && (
                <div className="profile-dropdown">
                  <div onClick={goProfile}>
                    <FiUser /> Profile
                  </div>
                  <div onClick={logoutHandler} className="logout">
                    <FiLogOut /> Logout
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ================= SEARCH DROPDOWN ================= */}
      {showSearch && searchQuery.length > 0 && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, 
          background: "#fff", borderBottom: "1px solid #e2e8f0", 
          padding: "20px 5%", zIndex: 999,
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          color: "#334155"
        }}>
          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", maxHeight: "400px", overflowY: "auto", paddingRight: "10px"}}>
              {/* Restaurants */}
              <div>
                <h4 style={{marginBottom: "12px", color: "#16a34a", display: "flex", alignItems: "center", gap: "6px"}}>🍔 Restaurants</h4>
                {filteredRestaurants.length === 0 && <p style={{fontSize: "14px", color: "#94a3b8"}}>No restaurants match your search.</p>}
                <div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
                  {filteredRestaurants.slice(0, 6).map(r => (
                    <div key={r._id} style={{display: "flex", gap: "12px", alignItems: "center", cursor: "pointer", padding: "12px", border: "1px solid #f1f5f9", borderRadius: "10px", transition: "all 0.2s"}} 
                         onMouseOver={e => e.currentTarget.style.borderColor = "#ff6b00"} 
                         onMouseOut={e => e.currentTarget.style.borderColor = "#f1f5f9"} 
                         onClick={() => { setShowSearch(false); setSearchQuery(""); navigate(`/restaurant/${r._id}`); }}>
                      <div style={{width: "50px", height: "50px", borderRadius: "8px", overflow: "hidden", background: "#f8fafc", flexShrink: 0}}>
                        {r.restaurantImages?.[0] ? <img src={r.restaurantImages[0]} alt={r.name} style={{width: "100%", height: "100%", objectFit: "cover"}} /> : <div style={{width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center"}}>🍽️</div>}
                      </div>
                      <div>
                         <div style={{fontWeight: "700", fontSize: "15px", color: "#1e293b", marginBottom: "2px"}}>{r.name}</div>
                         <div style={{fontSize: "13px", color: "#64748b"}}>📍 {r.restaurantId} • ★ {r.rating || "4.5"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Dishes */}
              <div>
                <h4 style={{marginBottom: "12px", color: "#ff6b00", display: "flex", alignItems: "center", gap: "6px"}}>🍝 Dishes</h4>
                {filteredDishes.length === 0 && <p style={{fontSize: "14px", color: "#94a3b8"}}>No dishes match your search.</p>}
                <div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
                  {filteredDishes.slice(0, 6).map(m => (
                    <div key={m._id} style={{display: "flex", gap: "12px", alignItems: "center", cursor: "pointer", padding: "12px", border: "1px solid #f1f5f9", borderRadius: "10px", transition: "all 0.2s"}} 
                         onMouseOver={e => e.currentTarget.style.borderColor = "#ff6b00"} 
                         onMouseOut={e => e.currentTarget.style.borderColor = "#f1f5f9"} 
                         onClick={() => { setShowSearch(false); setSearchQuery(""); navigate(`/dish/${m._id}`); }}>
                      <div style={{width: "50px", height: "50px", borderRadius: "8px", overflow: "hidden", background: "#f8fafc", flexShrink: 0}}>
                        <img src={m.image} alt={m.name} style={{width: "100%", height: "100%", objectFit: "cover"}} />
                      </div>
                      <div>
                         <div style={{fontWeight: "700", fontSize: "15px", color: "#1e293b", marginBottom: "2px"}}>{m.name}</div>
                         <div style={{fontSize: "14px", color: "#16a34a", fontWeight: "600"}}>₹{m.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
        </div>
      )}

    </nav>
  );
}
