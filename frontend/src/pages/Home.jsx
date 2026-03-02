import { useNavigate } from "react-router-dom";
import { FiShoppingCart, FiUser, FiLogOut } from "react-icons/fi";
import "../styles/home.css";
import { useEffect, useState } from "react";
import API from "../api/axios";
import Loader from "../components/Loader";

export default function Home() {
  const navigate = useNavigate();

  const [showProfile, setShowProfile] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

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

  /* ================= SEARCH ================= */
  const filteredRestaurants = restaurants.filter((r) =>
    r.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="home">
      {/* ================= NAVBAR ================= */}
      <nav className="navbar">
        <div className="brand" onClick={() => navigate("/")}>
          <span className="brand-main">Khamma</span>
          <span className="brand-accent">Ghani</span>
          <div className="brand-tagline">Authentic Rajasthani Taste</div>
        </div>

        {/* SEARCH BAR */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search restaurants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button>Search</button>
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
              <FiShoppingCart
                className="nav-icon"
                onClick={() => navigate("/cart")}
              />

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

      {/* ================= HERO OR MAIN CONTENT ================= */}

      {loading ? (
        <Loader />
      ) : (
        <>
          {/* ================= HERO SECTION ================= */}
      <section className="hero">
        <h1>Authentic Rajasthani Taste 🍛</h1>
        <p>Order delicious food from KhammaGhani restaurants near you</p>
      </section>

      {/* ================= RESTAURANTS ================= */}
      <section className="restaurants">
        <h2>Our Restaurants</h2>

        <div className="restaurant-grid">
          {filteredRestaurants.length === 0 ? (
            <p>No restaurants found</p>
          ) : (
            filteredRestaurants.map((res) => (
              <div
                key={res._id}
                className="restaurant-card"
                onClick={() => navigate(`/restaurant/${res._id}`)}
              >
                {/* Cover Image */}
                <div className="restaurant-card-img">
                  {res.restaurantImages && res.restaurantImages.length > 0 ? (
                    <img
                      src={res.restaurantImages[0]}
                      alt={res.name}
                    />
                  ) : (
                    <div className="restaurant-placeholder">
                      <span>🍽️</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="restaurant-card-info">
                  <h4>{res.name}</h4>
                  <p className="restaurant-location">📍 {res.restaurantId || "Rajasthan"}</p>
                  <div className="restaurant-card-meta">
                    <span className="restaurant-rating">
                      ⭐ {res.rating || "4.0"}
                    </span>
                    <span className={`restaurant-status ${res.isOpen !== false ? "open" : "closed"}`}>
                      {res.isOpen !== false ? "Open" : "Closed"}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ================= MENU SECTION ================= */}
      {menuItems.length > 0 && (
        <section className="menu-section">
          <h2>Popular Dishes</h2>

          <div className="menu-grid">
            {menuItems.slice(0, 6).map((item) => (
              <div key={item._id} className="menu-card"
                   onClick={() => navigate(`/dish/${item._id}`)}>
                <img
                  src={item.image}
                  alt={item.name}
                />
                <div className="menu-card-body">
                  <h4>{item.name}</h4>
                  <p className="menu-price">₹ {item.price}</p>
                </div>
              </div>
            ))}
            </div>
          </section>
        </>
      )}

      {/* ================= FOOTER ================= */}
      <footer className="footer">
        © {new Date().getFullYear()} KhammaGhani. All rights reserved.
      </footer>
    </div>
  );
}