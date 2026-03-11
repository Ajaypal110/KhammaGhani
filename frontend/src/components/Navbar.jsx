import { useNavigate, useLocation, Link } from "react-router-dom";
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

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

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
    localStorage.removeItem("role");
    setUser(null);
    setShowProfile(false);
    setIsMenuOpen(false);
    navigate("/login");
  };

  const goProfile = () => {
    setShowProfile(false);
    setIsMenuOpen(false);
    navigate("/profile");
  };

  /* ================= PWA INSTALLATION ================= */
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI to notify the user they can add to home screen
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsInstallable(false);
  };
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  /* Only show transparent/absolute nature if we're on the homepage hero. 
     Otherwise, make it solid green and relative on pages like Profile/Cart */
  const isHome = location.pathname === "/";

  return (
    <nav 
      className={`navbar ${isMenuOpen ? 'mobile-menu-open' : ''}`}
      style={isHome ? {} : { position: "sticky", borderBottom: "5px solid #ff6b00" }}
    >
      <div className="navbar-container">
        <div className="brand" onClick={() => { navigate("/"); setIsMenuOpen(false); }}>
          <div className="brand-icon" style={{background: "#fff", color: "#112918"}}>KG</div>
          <span className="brand-main" style={{fontFamily: "'Outfit', sans-serif", letterSpacing: "-1px", fontSize: "26px", color: "#fff"}}>Khamma</span>
          <span className="brand-accent" style={{fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.5px", fontSize: "26px", color: "#ff6b00", marginLeft: 0}}>Ghani</span>
        </div>

        {/* Desktop Navigation Content */}
        <div className={`nav-content ${isMenuOpen ? 'show' : ''}`}>
          <div className="nav-links">
            <Link to="/" className={isHome ? "active" : ""} onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link to="/about" className={location.pathname === "/about" ? "active" : ""} onClick={() => setIsMenuOpen(false)}>About Us</Link>
            <Link to="/contact" className={location.pathname === "/contact" ? "active" : ""} onClick={() => setIsMenuOpen(false)}>Contact Us</Link>
          </div>

          <div className="nav-actions">
            {!isLoggedIn && (
              <div className="auth-btns">
                <button onClick={() => { navigate("/login"); setIsMenuOpen(false); }}>Login</button>
              </div>
            )}
          </div>
        </div>

        {/* Right Section (Cart & Mobile Toggle) */}
        <div className="nav-right-persistent">
          {isInstallable && (
            <button 
              className="install-app-btn-persistent"
              onClick={handleInstallClick}
              title="Install App"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span className="install-text">Install App</span>
            </button>
          )}
          {isLoggedIn && (
            <div className="icon-group">
              {/* Desktop Search */}
              <div className="nav-search-wrapper desktop-only">
                <div className="search-bar-inner">
                  <FiSearch className="search-icon-svg" style={{color: "#fff"}} />
                  <input 
                    type="text" 
                    placeholder="Search restaurants & dishes..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button className="clear-search" onClick={() => setSearchQuery("")}>✕</button>
                  )}
                </div>
              </div>

              <div className="cart-icon-wrapper" onClick={() => { navigate("/cart"); setIsMenuOpen(false); }}>
                <FiShoppingCart className="nav-icon" />
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </div>

              <div className="profile-box">
                <div 
                  onClick={() => setShowProfile((prev) => !prev)} 
                  className="profile-avatar"
                >
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt="Profile" />
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

          {/* Hamburger Icon */}
          <div className="nav-hamburger" onClick={toggleMenu}>
            <div className={`bar ${isMenuOpen ? 'open' : ''}`}></div>
            <div className={`bar ${isMenuOpen ? 'open' : ''}`}></div>
            <div className={`bar ${isMenuOpen ? 'open' : ''}`}></div>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar Section */}
      {isLoggedIn && (
        <div className="mobile-search-section">
          <div className="search-bar-inner">
            <FiSearch className="search-icon-svg" />
            <input 
              type="text" 
              placeholder="Search food, restaurants..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-search" onClick={() => setSearchQuery("")}>✕</button>
            )}
          </div>
        </div>
      )}

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
