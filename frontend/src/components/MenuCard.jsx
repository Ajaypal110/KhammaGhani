function MenuCard({ item }) {
  return (
    <div style={{
      border: "1px solid #ddd",
      padding: "16px",
      borderRadius: "8px",
      marginBottom: "12px"
    }}>
      <h3>{item.name}</h3>
      <p>₹{item.price}</p>
      <small>{item.category}</small>
    </div>
  );
}

export default MenuCard;
