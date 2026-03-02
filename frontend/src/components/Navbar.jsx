import { useNavigate, useLocation } from "react-router-dom";
import { FiShoppingCart, FiUser, FiLogOut, FiSearch } from "react-icons/fi";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import "../styles/home.css"; // We'll keep sharing the dark green CSS from home

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showProfile, setShowProfile] = useState(false);
  const { cartItems } = useCart();
  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

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

  /* ================= SEARCH SCROLL ================= */
  const handleSearchClick = () => {
    // If we're on Home, scroll to the search input
    if (location.pathname === "/") {
      const searchInput = document.getElementById("homeSearchInput");
      if (searchInput) {
        searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => searchInput.focus(), 500); // Focus after scroll
      }
    } else {
      // If we're far away, optionally navigate to home first, then focus
      navigate("/");
      setTimeout(() => {
        const searchInput = document.getElementById("homeSearchInput");
        if (searchInput) {
          searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
          searchInput.focus();
        }
      }, 500);
    }
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
        <a href="#">Shop</a>
        <a href="#">Services</a>
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
    </nav>
  );
}
