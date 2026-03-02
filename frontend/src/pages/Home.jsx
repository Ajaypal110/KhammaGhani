import { useNavigate } from "react-router-dom";
import { FiShoppingCart, FiUser, FiLogOut, FiSearch } from "react-icons/fi";
import { FaPlay } from "react-icons/fa";
import "../styles/home.css";
import { useEffect, useState } from "react";
import API from "../api/axios";
import Loader from "../components/Loader";
import { useCart } from "../context/CartContext";

export default function Home() {
  const navigate = useNavigate();

  const [showProfile, setShowProfile] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

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
      {/* Navbar is now handled globally in App.jsx */}

      {/* ================= HERO SECTION ================= */}
      <section className="hero-wrapper">
        <div className="hero-content">
          <h1>Experience Adventure in Every Dish We Serve</h1>
          <p>Order delicious, authentic Rajasthani food and more from top-rated restaurants near you. Fast delivery, unmatched taste.</p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => {
              document.getElementById('restaurantsList').scrollIntoView({ behavior: 'smooth' });
            }}>Order Now ➔</button>
          </div>
        </div>

        <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" alt="Food Plate" className="hero-food-plate" style={{borderRadius: "50%"}} />

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
              <img src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" alt="Cooking 1" />
              <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" alt="Cooking 2" />
            </div>
          </section>

          {/* ================= MENU SECTION ================= */}
          {menuItems.length > 0 && (
            <section className="restaurants-wrapper" id="menuList">
              <span className="section-tag">A Menu That Always Makes You Fall In Love</span>
              <h2>Popular Dishes</h2>
              <div className="menu-grid">
                {menuItems.slice(0, 8).map((item) => (
                  <div key={item._id} className="res-card"
                       onClick={() => navigate(`/dish/${item._id}`)}>
                    <div className="res-card-img-box">
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className="res-card-info">
                      <h4>{item.name}</h4>
                      <div className="res-stars">★★★★★</div>
                      <div className="res-meta mt-2" style={{marginTop: "12px"}}>
                        <span className="res-price">₹ {item.price}.00</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                        <img src={res.restaurantImages[0]} alt={res.name} />
                      ) : (
                        <div style={{width:'100%', height:'100%', background:'#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center', fontSize: '40px'}}>🍽️</div>
                      )}
                    </div>
                    <div className="res-card-info">
                      <h4>{res.name}</h4>
                      <p>📍 {res.restaurantId || "Rajasthan"}</p>
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

        </>
      )}
    </div>
  );
}