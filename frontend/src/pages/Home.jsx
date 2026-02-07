import { useEffect, useState } from "react";
import API from "../api/axios";
import MenuCard from "../components/MenuCard";

function Home() {
  const [menu, setMenu] = useState([]);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const { data } = await API.get("/menu");
        setMenu(data);
      } catch (error) {
        console.error("Error fetching menu:", error);
      }
    };

    fetchMenu();
  }, []);

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto" }}>
      <h1>🍽️ KhammaGhani Menu</h1>

      {menu.length === 0 && <p>No items available</p>}

      {menu.map((item) => (
        <MenuCard key={item._id} item={item} />
      ))}
    </div>
  );
}

export default Home;
