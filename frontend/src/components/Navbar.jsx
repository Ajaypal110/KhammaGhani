import { useNavigate, useLocation } from "react-router-dom";
import { FiShoppingCart, FiUser, FiLogOut, FiSearch } from "react-icons/fi";
import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import API from "../api/axios";
import "../styles/home.css"; 

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showProfile, setShowProfile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [menuItems, setMenuItems] = useState([]);

  const { cartItems } = useCart();
  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  useEffect(() => {
    if (showSearch && restaurants.length === 0) {
      Promise.all([API.get("/restaurants"), API.get("/menu")])
        .then(([resData, menuData]) => {
          setRestaurants(resData.data);
          setMenuItems(menuData.data);
        })
        .catch(console.error);
    }
  }, [showSearch]);

  const filteredRestaurants = restaurants.filter(r => r.name?.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredDishes = menuItems.filter(m => m.name?.toLowerCase().includes(searchQuery.toLowerCase()));

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

  const handleSearchClick = () => {
    setShowSearch(!showSearch);
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
        <div className="brand-icon">KG</div>
        <span className="brand-main">Khamma</span>
        <span className="brand-accent">Ghani</span>
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
          <div className="nav-icons">
            {/* Show search icon contextually or globally to link back to home */}
            <FiSearch 
              className="nav-search-icon" 
              onClick={handleSearchClick}
              title="Search Restaurants"
            />

            <div className="cart-icon-wrapper" style={{ position: "relative", cursor: "pointer" }} onClick={() => navigate("/cart")}>
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
              <FiUser
                className="nav-icon"
                onClick={() => setShowProfile((prev) => !prev)}
              />

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
      {showSearch && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, 
          background: "#fff", borderBottom: "1px solid #e2e8f0", 
          padding: "20px 5%", zIndex: 999,
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          color: "#334155"
        }}>
          <div style={{display: "flex", gap: "12px", alignItems: "center", marginBottom: "20px"}}>
            <input 
              autoFocus
              type="text" 
              placeholder="Search for restaurants or dishes globally..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{flex: 1, padding: "14px 20px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "16px", outline: "none", fontFamily: "inherit"}}
            />
            <button onClick={() => {setShowSearch(false); setSearchQuery("");}} style={{padding: "14px 24px", background: "#fef2f2", color: "#ef4444", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600"}}>Close</button>
          </div>

          {searchQuery.length > 1 && (
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
          )}
        </div>
      )}

    </nav>
  );
}
