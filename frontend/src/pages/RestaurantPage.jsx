import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api/axios";
import "../styles/restaurant.css";

export default function RestaurantPage() {
  const { id } = useParams();

  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const { data } = await API.get(`/restaurants/${id}`);
        setRestaurant(data);
      } catch (err) {
        console.log(err);
      }
    };

    const fetchMenu = async () => {
      try {
        const { data } = await API.get(`/menu/restaurant/${id}`);
        setMenu(data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchRestaurant();
    fetchMenu();
  }, [id]);

  if (!restaurant) return <p>Loading...</p>;

  return (
    <div className="restaurant-page">
      {/* ================= HEADER ================= */}
      <div className="restaurant-header">
        <h1>{restaurant.name}</h1>
        <p>{restaurant.email}</p>

        <button className="book-btn">
          Book Table
        </button>
      </div>

      {/* ================= MENU ================= */}
      <section className="restaurant-menu">
        <h2>Menu</h2>

        <div className="menu-grid">
          {menu.length === 0 && <p>No menu items available</p>}

          {menu.map((item) => (
            <div key={item._id} className="menu-card">
              <img
                src={item.image || "https://via.placeholder.com/300"}
                alt={item.name}
              />
              <h4>{item.name}</h4>
              <p>₹ {item.price}</p>
              <button>Add to Cart</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}