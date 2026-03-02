import { useState } from "react";
import API from "../api/axios";

export default function RestaurantAddMenu() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  const addMenu = async () => {
    try {
      await API.post("/api/menu", { name, price });
      alert("Menu Added Successfully");
      setName("");
      setPrice("");
    } catch (err) {
      alert("Failed to add menu");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Add Menu Item</h2>

      <input
        placeholder="Dish Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />

      <button onClick={addMenu}>Add</button>
    </div>
  );
}
