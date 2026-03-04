import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Loader from "../components/Loader";
import DietaryIcon from "../components/DietaryIcon";
import "../styles/restaurant.css";

export default function RestaurantDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("menu");
  const [menu, setMenu] = useState([]);
  const [images, setImages] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [agents, setAgents] = useState([]);
  const [totalTables, setTotalTables] = useState(10);
  const [restaurantName, setRestaurantName] = useState(
    localStorage.getItem("restaurantName") || "Restaurant"
  );
  const [loading, setLoading] = useState(true);

  const logoutHandler = () => {
    localStorage.removeItem("restaurantToken");
    localStorage.removeItem("role");
    localStorage.removeItem("restaurantName");
    navigate("/restaurant/login");
  };

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      await Promise.all([
        fetchMyMenu(),
        fetchMyImages(),
        fetchBookings(),
        fetchOrders(),
        fetchProfile(),
        fetchAgents(),
      ]);
      setLoading(false);
    };
    loadAllData();
  }, []);

  /* ================= FETCH DATA ================= */
  const fetchProfile = async () => {
    try {
      const { data } = await API.get("/restaurants/my/profile");
      setRestaurantName(data.name || "Restaurant");
      setTotalTables(data.totalTables || 10);
      localStorage.setItem("restaurantName", data.name || "Restaurant");
    } catch (err) {
      console.log(err);
    }
  };

  const fetchMyMenu = async () => {
    try {
      const { data } = await API.get("/menu/my-menu");
      setMenu(data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchMyImages = async () => {
    try {
      const { data } = await API.get("/restaurants/my/images");
      setImages(data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchBookings = async () => {
    try {
      const { data } = await API.get("/reservations/restaurant-bookings");
      setBookings(data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data } = await API.get("/restaurant/orders");
      setOrders(data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchAgents = async () => {
    try {
      const { data } = await API.get("/delivery-agents/my-agents");
      setAgents(data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="dashboard">
      {/* NAVBAR */}
      <nav className="dash-nav">
        <div className="dash-brand">
          <span className="dash-brand-main">Khamma</span>
          <span className="dash-brand-accent">Ghani</span>
          <span className="dash-brand-name">— {restaurantName}</span>
        </div>
        <div className="dash-nav-right">
          <div className="dash-welcome">
            Welcome, <strong>{restaurantName}</strong>
          </div>
          <button className="logout-nav-btn" onClick={logoutHandler}>
            🚪 Logout
          </button>
        </div>
      </nav>

      {/* SIDEBAR + CONTENT */}
      <div className="dash-body">
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="sidebar-avatar">
              {restaurantName.charAt(0).toUpperCase()}
            </div>
            <p className="sidebar-name">{restaurantName}</p>
          </div>

          <div className="sidebar-links">
            <button
              className={activeTab === "menu" ? "sidebar-btn active" : "sidebar-btn"}
              onClick={() => setActiveTab("menu")}
            >
              <span className="sidebar-icon">🍽️</span> Manage Menu
            </button>
            <button
              className={activeTab === "images" ? "sidebar-btn active" : "sidebar-btn"}
              onClick={() => setActiveTab("images")}
            >
              <span className="sidebar-icon">🖼️</span> Gallery Images
            </button>
            <button
              className={activeTab === "bookings" ? "sidebar-btn active" : "sidebar-btn"}
              onClick={() => setActiveTab("bookings")}
            >
              <span className="sidebar-icon">📅</span> Table Bookings
            </button>
            <button
              className={activeTab === "tables" ? "sidebar-btn active" : "sidebar-btn"}
              onClick={() => setActiveTab("tables")}
            >
              <span className="sidebar-icon">🪑</span> Manage Tables
            </button>
            <button
              className={activeTab === "orders" ? "sidebar-btn active" : "sidebar-btn"}
              onClick={() => setActiveTab("orders")}
            >
              <span className="sidebar-icon">📦</span> Orders
            </button>
            <button
              className={activeTab === "agents" ? "sidebar-btn active" : "sidebar-btn"}
              onClick={() => setActiveTab("agents")}
            >
              <span className="sidebar-icon">😴</span> Delivery Agents
            </button>
          </div>
        </aside>

        {/* CONTENT */}
        <main className="content">
          {loading ? (
            <Loader />
          ) : (
            <>
              {activeTab === "menu" && (
                <MenuSection menu={menu} refresh={fetchMyMenu} />
              )}

              {activeTab === "images" && (
                <ImagesSection images={images} refresh={fetchMyImages} />
              )}

              {activeTab === "bookings" && (
                <BookingsSection bookings={bookings} refresh={fetchBookings} />
              )}

              {activeTab === "tables" && (
                <TablesSection totalTables={totalTables} refresh={fetchProfile} />
              )}

              {activeTab === "orders" && (
                <OrdersSection orders={orders} agents={agents} refreshOrders={fetchOrders} refreshAgents={fetchAgents} />
              )}

              {activeTab === "agents" && (
                <DeliveryAgentsSection agents={agents} refresh={fetchAgents} />
              )}
            </>
          )}
        </main>
      </div>

      {/* FOOTER */}
      <footer className="dash-footer">
        © {new Date().getFullYear()} KhammaGhani — {restaurantName} Dashboard
      </footer>
    </div>
  );
}

/* ================================================================
   MENU SECTION
================================================================ */
function MenuSection({ menu, refresh }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Starters");
  const [contents, setContents] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isVeg, setIsVeg] = useState(true);
  const [variations, setVariations] = useState([]); // [{name, price}]
  const [cuisineType, setCuisineType] = useState("");
  const [dietaryType, setDietaryType] = useState("Veg");
  const [discountPrice, setDiscountPrice] = useState("");
  const [isGstIncluded, setIsGstIncluded] = useState(false);
  const [addOns, setAddOns] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const categoriesList = ["Starters", "Main Course", "Rajasthani", "Chinese", "Thai", "Desserts", "Beverages", "Thali"];

  const submitHandler = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    
    // Filter empty variations
    const validVariations = variations.filter(v => v.name.trim() !== "" && v.price !== "");
    
    // price is now optional, derived from variations in backend if empty
    if (price && validVariations.length === 0) formData.append("price", price);
    else if (price) formData.append("price", price); // keep it if they explicitly set it
    
    formData.append("category", category);
    formData.append("contents", contents);
    formData.append("description", description);
    formData.append("isVeg", isVeg);
    // Filter empty variations and add-ons
    const validAddOns = addOns.filter(a => a.name.trim() !== "" && a.price !== "");

    formData.append("variations", JSON.stringify(validVariations));
    formData.append("addOns", JSON.stringify(validAddOns));
    
    formData.append("dietaryType", dietaryType);
    if (discountPrice) formData.append("discountPrice", discountPrice);
    formData.append("isGstIncluded", isGstIncluded);
    if (image) formData.append("image", image);

    setSubmitting(true);
    try {
      if (editingId) {
        await API.put(`/menu/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await API.post("/menu", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      resetForm();
      refresh();
    } catch (err) {
      console.error("Submit Error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setName("");
    setPrice("");
    setCategory("Starters");
    setContents("");
    setDescription("");
    setImage(null);
    setPreview(null);
    setIsVeg(true);
    setVariations([]);
    setCuisineType("");
    setDietaryType("Veg");
    setDiscountPrice("");
    setIsGstIncluded(false);
    setAddOns([]);
    setEditingId(null);
  };

  const deleteHandler = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      await API.delete(`/menu/${id}`);
      refresh();
    } catch (err) {
      console.log(err);
    }
  };

  const editHandler = (item) => {
    setEditingId(item._id);
    setName(item.name);
    setPrice(item.price);
    setCategory(item.category || "Starters");
    setContents(item.contents || "");
    setDescription(item.description || "");
    setPreview(item.image);
    setIsVeg(item.isVeg !== undefined ? item.isVeg : true);
    setVariations(item.variations || []);
    setDietaryType(item.dietaryType || (item.isVeg ? "Veg" : "Non-Veg"));
    setDiscountPrice(item.discountPrice || "");
    setIsGstIncluded(item.isGstIncluded || false);
    setAddOns(item.addOns || []);
    window.scrollTo({ top: 150, behavior: "smooth" });
  };

  return (
    <div className="menu-wrapper" style={{ maxWidth: "900px" }}>
      <h2 className="section-title">{editingId ? "✏️ Edit Dish" : "➕ Add New Dish"}</h2>

      <form className="menu-card-form" onSubmit={submitHandler} style={{ maxWidth: "860px", margin: "0 auto", gap: "20px", display: "flex", flexDirection: "column" }}>
        {/* SECTION 1: BASIC DETAILS */}
        <div className="form-section-card">
          <h3 className="form-section-title">📝 Basic Details</h3>
          
          <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", marginBottom: "16px" }}>
            <div className="image-upload" style={{ width: "160px", height: "160px", flexShrink: 0, borderRadius: "16px", overflow: "hidden", border: "2px dashed #cbd5e1", background: "#f8fafc", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              {preview ? (
                <img src={preview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ textAlign: "center", color: "#94a3b8", fontSize: "13px", padding: "12px" }}>
                  <div style={{ fontSize: "32px", marginBottom: "8px" }}>📷</div>
                  Upload Dish Image
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  setImage(e.target.files[0]);
                  setPreview(URL.createObjectURL(e.target.files[0]));
                }}
                style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }}
              />
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
              <input
                type="text"
                placeholder="Dish Name (e.g., Paneer Butter Masala)"
                value={name}
                required
                onChange={(e) => setName(e.target.value)}
              />

              <textarea
                placeholder="Short Description (ingredients, taste, etc.)"
                value={description}
                required
                onChange={(e) => setDescription(e.target.value)}
                style={{ minHeight: "82px", resize: "none" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "6px", fontWeight: "600" }}>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                {categoriesList.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "6px", fontWeight: "600" }}>Dietary Type</label>
              <div style={{ display: "flex", gap: "10px", background: "#f8fafc", padding: "12px 16px", borderRadius: "12px", border: "1.5px solid #e2e8f0" }}>
                {["Veg", "Non-Veg", "Egg"].map(type => (
                  <label key={type} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", cursor: "pointer", fontWeight: "700", color: dietaryType === type ? "#ff6b00" : "#64748b" }}>
                    <input type="radio" name="dietaryType" checked={dietaryType === type} onChange={() => setDietaryType(type)} style={{ accentColor: "#ff6b00" }} />
                    {type}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: CUSTOMIZATION (Variations & Add-ons) */}
        <div className="form-section-card">
          <h3 className="form-section-title">⚖️ Size &amp; Pricing</h3>
          <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px", marginTop: "-8px" }}>Pricing is defined by the size options below. If no sizes are added, use the optional pricing section below.</p>
          
          {/* Variations */}
          <div className="variations-container" style={{ marginBottom: "24px", padding: "20px", background: "#f8fafc", borderRadius: "18px", border: "1.5px solid #f1f5f9" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#475569" }}>Size Options</h4>
              <button type="button" onClick={() => setVariations([...variations, { name: "", price: "" }])} style={{ padding: "6px 14px", background: "#ff6b00", border: "none", borderRadius: "10px", color: "#fff", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>+ Add New</button>
            </div>
            
            {variations.length === 0 && (
               <div style={{ textAlign: "center", padding: "20px", color: "#94a3b8", fontSize: "14px", border: "1.5px dashed #e2e8f0", borderRadius: "12px" }}>No size options added yet.</div>
            )}

            {variations.map((v, index) => (
              <div key={index} style={{ display: "flex", gap: "10px", marginBottom: "10px", alignItems: "center" }}>
                <input type="text" placeholder="e.g. Full, Half, Large" value={v.name} onChange={(e) => { const n = [...variations]; n[index].name = e.target.value; setVariations(n); }} style={{ flex: 2, padding: "12px", borderRadius: "10px", border: "1.5px solid #e2e8f0" }} />
                <div style={{ position: "relative", flex: 1 }}>
                  <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontWeight: "700" }}>₹</span>
                  <input type="number" placeholder="Price" value={v.price} onChange={(e) => { const n = [...variations]; n[index].price = e.target.value; setVariations(n); }} style={{ width: "100%", padding: "12px 12px 12px 28px", borderRadius: "10px", border: "1.5px solid #e2e8f0" }} />
                </div>
                <button type="button" onClick={() => setVariations(variations.filter((_, i) => i !== index))} style={{ width: "38px", height: "38px", borderRadius: "10px", border: "none", background: "#fee2e2", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>✕</button>
              </div>
            ))}
          </div>

          {/* Add-ons */}
          <div className="addons-container" style={{ padding: "20px", background: "#f8fafc", borderRadius: "18px", border: "1.5px solid #f1f5f9" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#475569" }}>Add-ons / Extras</h4>
              <button type="button" onClick={() => setAddOns([...addOns, { name: "", price: "" }])} style={{ padding: "6px 14px", background: "#10b981", border: "none", borderRadius: "10px", color: "#fff", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>+ Add New</button>
            </div>
            
            {addOns.length === 0 && (
               <div style={{ textAlign: "center", padding: "20px", color: "#94a3b8", fontSize: "14px", border: "1.5px dashed #e2e8f0", borderRadius: "12px" }}>No add-ons added yet.</div>
            )}

            {addOns.map((a, index) => (
              <div key={index} style={{ display: "flex", gap: "10px", marginBottom: "10px", alignItems: "center" }}>
                <input type="text" placeholder="e.g. Extra Cheese" value={a.name} onChange={(e) => { const n = [...addOns]; n[index].name = e.target.value; setAddOns(n); }} style={{ flex: 2, padding: "12px", borderRadius: "10px", border: "1.5px solid #e2e8f0" }} />
                <div style={{ position: "relative", flex: 1 }}>
                  <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontWeight: "700" }}>₹</span>
                  <input type="number" placeholder="Price" value={a.price} onChange={(e) => { const n = [...addOns]; n[index].price = e.target.value; setAddOns(n); }} style={{ width: "100%", padding: "12px 12px 12px 28px", borderRadius: "10px", border: "1.5px solid #e2e8f0" }} />
                </div>
                <button type="button" onClick={() => setAddOns(addOns.filter((_, i) => i !== index))} style={{ width: "38px", height: "38px", borderRadius: "10px", border: "none", background: "#fee2e2", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>✕</button>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3: OPTIONAL PRICING */}
        <div className="form-section-card">
          <h3 className="form-section-title">💰 Advanced Pricing (Optional)</h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
            <div style={{ position: "relative" }}>
               <label style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "5px" }}>Fixed Price (if no sizes)</label>
               <span style={{ position: "absolute", left: "12px", bottom: "14px", color: "#94a3b8", fontWeight: "700" }}>₹</span>
               <input type="number" placeholder="0" value={price} onChange={(e) => setPrice(e.target.value)} style={{ paddingLeft: "28px" }} />
            </div>
            <div style={{ position: "relative" }}>
               <label style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "5px" }}>Discount Price</label>
               <span style={{ position: "absolute", left: "12px", bottom: "14px", color: "#94a3b8", fontWeight: "700" }}>₹</span>
               <input type="number" placeholder="0" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} style={{ paddingLeft: "28px" }} />
            </div>
          </div>

          <label style={{ display: "inline-flex", alignItems: "center", gap: "10px", fontSize: "15px", color: "#475569", cursor: "pointer", fontWeight: "600", padding: "10px 15px", background: "#f8fafc", borderRadius: "12px", border: "1.5px solid #f1f5f9" }}>
            <input type="checkbox" checked={isGstIncluded} onChange={(e) => setIsGstIncluded(e.target.checked)} style={{ width: "18px", height: "18px", accentColor: "#ff6b00" }} />
            Price includes GST
          </label>
        </div>



        <div style={{ display: "flex", gap: "15px" }}>
          <button type="submit" className="primary-btn" disabled={submitting} style={{ flex: 2, height: "55px", fontSize: "16px" }}>
            {submitting ? "Processing..." : editingId ? "Save Changes" : "🚀 Create Menu Dish"}
          </button>
          {editingId && (
            <button type="button" className="cancel-btn" onClick={resetForm} style={{ flex: 1 }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <h2 className="section-title">📋 Your Menu ({menu.length} items)</h2>

      <div className="menu-grid">
        {menu.length === 0 && <p className="empty-msg">No menu items yet. Add your first dish above!</p>}
        {menu.map((item) => (
          <div key={item._id} className="menu-card">
            <img src={item.image} alt={item.name} />

            <div className="menu-info">
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <DietaryIcon isVeg={item.isVeg} size={14} />
                <h4 style={{ margin: 0 }}>{item.name}</h4>
              </div>
               <p style={{ fontWeight: "700", color: "#64748b", margin: "4px 0" }}>
                {item.variations?.length > 0 
                  ? item.variations.map(v => `${v.name}: ₹${v.price}`).join(" | ")
                  : `₹ ${item.price}`}
               </p>
               <span style={{ fontSize: "12px", background: "#f1f5f9", padding: "2px 8px", borderRadius: "10px", color: "#64748b" }}>{item.category || "Uncategorized"}</span>
              <small>{item.description}</small>

              <div className="menu-actions">
                <button className="edit-btn" onClick={() => editHandler(item)}>
                  ✏️ Edit
                </button>
                <button className="delete-btn" onClick={() => deleteHandler(item._id)}>
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================
   IMAGES SECTION
================================================================ */
function ImagesSection({ images, refresh }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const isMaxReached = images.length >= 10;

  const uploadHandler = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select an image");
    if (isMaxReached) return alert("Maximum 10 images allowed. Delete an image first.");

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      await API.post("/restaurants/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFile(null);
      setPreview(null);
      refresh();
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (imageUrl) => {
    if (!window.confirm("Remove this image?")) return;
    try {
      await API.post("/restaurants/remove-image", { imageUrl });
      refresh();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="images-section">
      <h2 className="section-title">🖼️ Restaurant Gallery</h2>
      <p className="image-limit-info">📸 {images.length} / 10 images uploaded</p>

      {!isMaxReached ? (
        <form className="image-upload-form" onSubmit={uploadHandler}>
          <div className="image-upload">
            {preview ? (
              <img src={preview} alt="preview" />
            ) : (
              <div className="image-placeholder">📷 Click to select restaurant image</div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                setFile(e.target.files[0]);
                setPreview(URL.createObjectURL(e.target.files[0]));
              }}
            />
          </div>

          <button type="submit" className="primary-btn" disabled={uploading}>
            {uploading ? "Uploading..." : "Upload Image"}
          </button>
        </form>
      ) : (
        <p className="max-reached-msg">✅ Maximum 10 images reached. Delete an image to upload a new one.</p>
      )}

      <h2 className="section-title">📸 Current Images ({images.length}/10)</h2>

      <div className="image-gallery">
        {images.length === 0 && (
          <p className="empty-msg">No images yet. Upload your first restaurant image!</p>
        )}
        {images.map((img, idx) => (
          <div key={idx} className="image-card">
            <img src={img} alt={`Restaurant ${idx + 1}`} />
            <button className="delete-btn image-delete-btn" onClick={() => deleteImage(img)}>
              🗑️ Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================
   BOOKINGS SECTION
================================================================ */
function BookingsSection({ bookings, refresh }) {
  const updateStatus = async (id, status) => {
    try {
      await API.put(`/reservations/${id}/status`, { status });
      refresh();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="bookings-section">
      <h2 className="section-title">📅 Table Bookings ({bookings.length})</h2>

      {bookings.length === 0 ? (
        <p className="empty-msg">No bookings yet. They'll appear here when customers book a table.</p>
      ) : (
        <div className="booking-table-wrapper">
          <table className="booking-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Date</th>
                <th>Time Period</th>
                <th>Table</th>
                <th>Guests</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <React.Fragment key={b._id}>
                <tr>
                  <td>{b.name}</td>
                  <td>{b.phone}</td>
                  <td>{b.date}</td>
                  <td>{b.timeFrom} – {b.timeTo}</td>
                  <td><strong>🪑 {b.tableNo}</strong></td>
                  <td>{b.guests}</td>
                  <td>
                    <span className={`status-badge ${b.paymentStatus === "Paid" ? "status-confirmed" : "status-cancelled"}`}>
                      {b.paymentStatus === "Paid" ? "✓ Paid" : "Unpaid"}
                    </span>
                    {b.paymentStatus === "Paid" && (
                      <div style={{ fontSize: 10, color: "#aaa", marginTop: 2 }}>
                        {b.receiptId}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge status-${b.status?.toLowerCase()}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="action-cell">
                    {b.status === "Pending" && (
                      <>
                        <button
                          className="confirm-btn"
                          onClick={() => updateStatus(b._id, "Confirmed")}
                        >
                          ✓ Confirm
                        </button>
                        <button
                          className="reject-btn"
                          onClick={() => updateStatus(b._id, "Cancelled")}
                        >
                          ✕ Cancel
                        </button>
                      </>
                    )}
                    {b.status === "Confirmed" && (
                      <button
                        className="reject-btn"
                        onClick={() => updateStatus(b._id, "Cancelled")}
                      >
                        ✕ Cancel
                      </button>
                    )}
                    {b.status === "Cancelled" && <span className="no-action">—</span>}
                  </td>
                </tr>
                {b.specialRequests && (
                  <tr className="special-req-row">
                    <td colSpan="9">
                      <em>📝 Note: {b.specialRequests}</em>
                    </td>
                  </tr>
                )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   ORDERS SECTION (UPDATED WITH DELIVERY FLOW)
================================================================ */
function OrdersSection({ orders, agents, refreshOrders, refreshAgents }) {
  const [selectedAgent, setSelectedAgent] = useState({});

  const handleConfirm = async (orderId) => {
    try {
      await API.put(`/orders/${orderId}/confirm`);
      refreshOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to confirm");
    }
  };

  const handleAssignAgent = async (orderId) => {
    const agentId = selectedAgent[orderId];
    if (!agentId) return alert("Please select a delivery agent");
    try {
      await API.put(`/orders/${orderId}/assign-agent`, { agentId });
      refreshOrders();
      refreshAgents();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to assign agent");
    }
  };

  const handleDelivered = async (orderId) => {
    try {
      await API.put(`/orders/${orderId}/delivered`);
      refreshOrders();
      refreshAgents();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to mark delivered");
    }
  };

  const availableAgents = agents.filter(a => a.status === "Available");

  const statusColors = {
    Placed: "#f59e0b",
    Confirmed: "#3b82f6",
    Assigned: "#8b5cf6",
    Delivered: "#16a34a",
  };

  return (
    <div className="orders-section">
      <h2 className="section-title">📦 Orders ({orders.length})</h2>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <p className="empty-msg">No orders received yet.</p>
        </div>
      ) : (
        <div className="orders-grid">
          {orders.map((order) => (
            <div key={order._id} className="order-card" style={{ borderLeft: `4px solid ${statusColors[order.status] || "#94a3b8"}` }}>
              <div className="order-header">
                <span className="order-id">#{order._id.slice(-6).toUpperCase()}</span>
                <span style={{
                  background: statusColors[order.status] || "#94a3b8",
                  color: "#fff",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "700",
                }}>{order.status}</span>
              </div>

              <div className="order-body">
                <p><strong>Items:</strong> {order.items?.length || 0} items</p>
                <p><strong>Total:</strong> ₹{order.totalAmount || 0}</p>
                <p><strong>Payment:</strong> {order.paymentStatus}</p>
                {order.deliveryAddress && (
                  <p style={{ fontSize: "12px", color: "#64748b" }}>📍 {order.deliveryAddress.substring(0, 60)}...</p>
                )}
                <p className="order-time">
                  {new Date(order.createdAt).toLocaleString("en-IN", {
                    day: "numeric", month: "short", year: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              </div>

              {/* Delivery Agent Info (if assigned) */}
              {order.deliveryAgent?.name && (
                <div style={{ background: "#f5f3ff", padding: "10px 14px", borderRadius: "10px", marginTop: "10px", fontSize: "13px" }}>
                  <div style={{ fontWeight: "700", color: "#7c3aed", marginBottom: "4px" }}>🚴 Delivery Agent</div>
                  <div>{order.deliveryAgent.name} • {order.deliveryAgent.phone}</div>
                  <div style={{ color: "#64748b" }}>{order.deliveryAgent.vehicleType} — {order.deliveryAgent.vehicleNumber}</div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                {order.status === "Placed" && order.paymentStatus === "Paid" && (
                  <button
                    onClick={() => handleConfirm(order._id)}
                    style={{ padding: "10px", borderRadius: "10px", border: "none", background: "#3b82f6", color: "#fff", fontWeight: "700", cursor: "pointer", fontSize: "13px" }}
                  >✅ Confirm Order</button>
                )}

                {order.status === "Confirmed" && (
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <select
                      value={selectedAgent[order._id] || ""}
                      onChange={(e) => setSelectedAgent({ ...selectedAgent, [order._id]: e.target.value })}
                      style={{ flex: 1, padding: "10px 12px", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "13px", fontWeight: "600" }}
                    >
                      <option value="">Select Agent...</option>
                      {availableAgents.map(a => (
                        <option key={a._id} value={a._id}>{a.name} ({a.vehicleType})</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleAssignAgent(order._id)}
                      style={{ padding: "10px 16px", borderRadius: "10px", border: "none", background: "#8b5cf6", color: "#fff", fontWeight: "700", cursor: "pointer", fontSize: "13px", whiteSpace: "nowrap" }}
                    >Assign</button>
                  </div>
                )}

                {order.status === "Assigned" && (
                  <button
                    onClick={() => handleDelivered(order._id)}
                    style={{ padding: "10px", borderRadius: "10px", border: "none", background: "#16a34a", color: "#fff", fontWeight: "700", cursor: "pointer", fontSize: "13px" }}
                  >📬 Mark as Delivered</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================================================================
   DELIVERY AGENTS SECTION (NEW)
================================================================ */
function DeliveryAgentsSection({ agents, refresh }) {
  const [name, setName] = useState("");
  const [agentId, setAgentId] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [vehicleType, setVehicleType] = useState("Bike");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [editingId, setEditingId] = useState(null);

  const resetForm = () => {
    setName(""); setAgentId(""); setPhone(""); setPassword(""); setVehicleType("Bike"); setVehicleNumber(""); setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/delivery-agents/agent/${editingId}`, { name, agentId, phone, password: password || undefined, vehicleType, vehicleNumber });
      } else {
        await API.post("/delivery-agents/add-agent", { name, agentId, phone, password, vehicleType, vehicleNumber });
      }
      resetForm();
      refresh();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save agent");
    }
  };

  const handleEdit = (agent) => {
    setEditingId(agent._id);
    setName(agent.name);
    setAgentId(agent.agentId || "");
    setPhone(agent.phone);
    setVehicleType(agent.vehicleType);
    setVehicleNumber(agent.vehicleNumber);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this delivery agent?")) return;
    try {
      await API.delete(`/delivery-agents/agent/${id}`);
      refresh();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete");
    }
  };

  return (
    <div>
      <h2 className="section-title">🚴 Delivery Agents ({agents.length}/5)</h2>

      {/* Add/Edit Form */}
      {agents.length < 5 || editingId ? (
        <form onSubmit={handleSubmit} className="form-section-card" style={{ marginBottom: "24px" }}>
          <h3 className="form-section-title">{editingId ? "✏️ Edit Agent" : "➕ Add New Agent"}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <input
              type="text" placeholder="Agent Name" value={name} required
              onChange={(e) => setName(e.target.value)}
              style={{ padding: "12px 16px", borderRadius: "12px", border: "1.5px solid #e2e8f0", fontSize: "14px", background: "#f8fafc" }}
            />
            <input
              type="text" placeholder="Unique Agent ID (e.g., AGENT007)" value={agentId} required
              onChange={(e) => setAgentId(e.target.value)}
              style={{ padding: "12px 16px", borderRadius: "12px", border: "1.5px solid #e2e8f0", fontSize: "14px", background: "#f8fafc", fontWeight: "600", color: "#3b82f6" }}
            />
            <input
              type="text" placeholder="Phone Number" value={phone} required
              onChange={(e) => setPhone(e.target.value)}
              style={{ padding: "12px 16px", borderRadius: "12px", border: "1.5px solid #e2e8f0", fontSize: "14px", background: "#f8fafc" }}
            />
            <input
              type="text" placeholder={editingId ? "New Password (Optional)" : "Password"} value={password} required={!editingId}
              onChange={(e) => setPassword(e.target.value)}
              style={{ padding: "12px 16px", borderRadius: "12px", border: "1.5px solid #e2e8f0", fontSize: "14px", background: "#f8fafc" }}
            />
            <select
              value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}
              style={{ padding: "12px 16px", borderRadius: "12px", border: "1.5px solid #e2e8f0", fontSize: "14px", background: "#f8fafc", fontWeight: "600" }}
            >
              <option value="Bike">🏍️ Bike</option>
              <option value="Scooter">🛵 Scooter</option>
            </select>
            <input
              type="text" placeholder="Vehicle Number (e.g., RJ14AB1234)" value={vehicleNumber} required
              onChange={(e) => setVehicleNumber(e.target.value)}
              style={{ padding: "12px 16px", borderRadius: "12px", border: "1.5px solid #e2e8f0", fontSize: "14px", background: "#f8fafc" }}
            />
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
            <button type="submit" className="primary-btn" style={{ flex: 1 }}>
              {editingId ? "Update Agent" : "Add Agent"}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} style={{ padding: "12px 24px", borderRadius: "12px", border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer", fontWeight: "600" }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      ) : (
        <div style={{ background: "#fff7f2", padding: "16px 20px", borderRadius: "12px", color: "#ff6b00", fontWeight: "600", fontSize: "14px", marginBottom: "24px" }}>
          ⚠️ Maximum 5 agents reached. Delete an existing agent to add a new one.
        </div>
      )}

      {/* Agents List */}
      {agents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🚴</div>
          <p className="empty-msg">No delivery agents added yet. Add agents to assign them to orders.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
          {agents.map(agent => (
            <div key={agent._id} style={{
              background: "#fff", padding: "20px", borderRadius: "16px",
              border: `1.5px solid ${agent.status === "Available" ? "#bbf7d0" : "#fde68a"}`,
              boxShadow: "0 2px 10px rgba(0,0,0,0.03)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>{agent.name}</h4>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "#3b82f6", background: "#eff6ff", padding: "2px 8px", borderRadius: "6px", display: "inline-block", marginTop: "4px" }}>
                    ID: {agent.agentId}
                  </span>
                </div>
                <span style={{
                  background: agent.status === "Available" ? "#dcfce7" : "#fef3c7",
                  color: agent.status === "Available" ? "#16a34a" : "#d97706",
                  padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700"
                }}>{agent.status}</span>
              </div>
              <div style={{ fontSize: "14px", color: "#64748b", display: "flex", flexDirection: "column", gap: "4px" }}>
                <div>📞 {agent.phone}</div>
                <div>{agent.vehicleType === "Bike" ? "🏍️" : "🛵"} {agent.vehicleType} — {agent.vehicleNumber}</div>
              </div>
              <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
                <button onClick={() => handleEdit(agent)} style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}>✏️ Edit</button>
                <button onClick={() => handleDelete(agent._id)} style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "1px solid #fee2e2", background: "#fef2f2", color: "#ef4444", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}>🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================================================================
   TABLES SECTION (NEW)
================================================================ */
function TablesSection({ totalTables, refresh }) {
  const [newTotal, setNewTotal] = useState(totalTables);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  // Payment settings state
  const [paymentFee, setPaymentFee] = useState(199);
  const [upiId, setUpiId] = useState("");
  const [paymentEnabled, setPaymentEnabled] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [payMsg, setPayMsg] = useState("");

  // Address settings state
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState({ lat: null, lon: null });
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressMsg, setAddressMsg] = useState("");
  const [locLoading, setLocLoading] = useState(false);

  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data && data.display_name) {
            setAddress(data.display_name);
            setCoordinates({ lat: latitude, lon: longitude });
          }
        } catch (err) {
          console.error("Location error:", err);
          alert("Failed to get address from coordinates.");
        } finally {
          setLocLoading(false);
        }
      },
      (err) => {
        setLocLoading(false);
        alert("Location access denied or unavailable.");
      }
    );
  };

  useEffect(() => {
    setNewTotal(totalTables);
  }, [totalTables]);

  // AUTO-GEOCODE when address changes (Debounced)
  useEffect(() => {
    if (!address || address.length < 5) return;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
        const data = await res.json();
        if (data && data.length > 0) {
          setCoordinates({
            lat: parseFloat(data[0].lat),
            lon: parseFloat(data[0].lon)
          });
          console.log("Auto-geocoded address:", data[0].lat, data[0].lon);
        }
      } catch (err) {
        console.error("Auto-geocode error:", err);
      }
    }, 2000); // 2 second debounce

    return () => clearTimeout(timer);
  }, [address]);

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await API.get("/restaurants/my/profile");
        setPaymentFee(data.bookingFee || 199);
        setUpiId(data.upiId || "");
        setPaymentEnabled(data.paymentEnabled || false);
        setAddress(data.address || "");
        setCoordinates({ lat: data.lat || null, lon: data.lon || null });
      } catch (err) {
        console.log(err);
      }
    };
    fetchSettings();
  }, []);

  const saveHandler = async () => {
    setSaving(true);
    setMsg("");
    try {
      await API.put("/restaurants/my/tables", { totalTables: Number(newTotal) });
      setMsg("✅ Tables updated successfully!");
      refresh();
    } catch (err) {
      setMsg("❌ " + (err.response?.data?.message || "Failed to update"));
    } finally {
      setSaving(false);
    }
  };

  const saveAddress = async () => {
    if (!coordinates.lat || !coordinates.lon) {
      setAddressMsg("❌ Latitude and Longitude are required. Please use 'Current Location' or fill them manually.");
      return;
    }

    setSavingAddress(true);
    setAddressMsg("⏳ Verifying location match...");
    
    try {
      // Cross-check: Geocode the typed address to see if it matches the manual coordinates
      const geoResp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
      const geoData = await geoResp.json();
      
      if (geoData && geoData.length > 0) {
        const gLat = parseFloat(geoData[0].lat);
        const gLon = parseFloat(geoData[0].lon);
        
        // Haversine distance check
        const R = 6371; // km
        const dLat = (gLat - coordinates.lat) * (Math.PI/180);
        const dLon = (gLon - coordinates.lon) * (Math.PI/180);
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
                  Math.cos(coordinates.lat * (Math.PI/180)) * Math.cos(gLat * (Math.PI/180)) * 
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;

        if (distance > 1.5) { // 1.5km tolerance
          const proceed = window.confirm(`⚠️ Location Mismatch: The address provided is about ${distance.toFixed(1)}km away from the coordinates entered. Are you sure you want to save these coordinates?`);
          if (!proceed) {
             setSavingAddress(false);
             setAddressMsg("❌ Save cancelled. Please verify your address and coordinates.");
             return;
          }
        }
      }

      await API.put("/restaurants/my/address", { address, lat: coordinates.lat, lon: coordinates.lon });
      setAddressMsg("✅ Address and coordinates saved successfully!");
    } catch (err) {
      setAddressMsg("❌ " + (err.response?.data?.message || "Failed to save address"));
    } finally {
      setSavingAddress(false);
    }
  };

  const savePaymentSettings = async () => {
    setSavingPayment(true);
    setPayMsg("");
    try {
      await API.put("/restaurants/my/payment-settings", {
        bookingFee: Number(paymentFee),
        upiId,
        paymentEnabled,
      });
      setPayMsg("✅ Payment settings saved!");
    } catch (err) {
      setPayMsg("❌ " + (err.response?.data?.message || "Failed to save"));
    } finally {
      setSavingPayment(false);
    }
  };

  return (
    <div className="tables-section">
      <h2 className="section-title">🪑 Manage Tables</h2>

      <div className="tables-config-card">
        <h3>Total Tables in Your Restaurant</h3>
        <p className="tables-desc">
          Set how many tables your restaurant has. Customers will see this when booking.
        </p>

        <div className="tables-input-row">
          <label>Number of Tables:</label>
          <input
            type="number"
            min="1"
            max="100"
            value={newTotal}
            onChange={(e) => setNewTotal(e.target.value)}
          />
          <button className="primary-btn" onClick={saveHandler} disabled={saving}>
            {saving ? "Saving..." : "Update Tables"}
          </button>
        </div>

        {msg && <p className="tables-msg">{msg}</p>}
      </div>

      {/* ======== ADDRESS SETTINGS ======== */}
      <h2 className="section-title">📍 Restaurant Address</h2>

      <div className="tables-config-card">
        <h3>Physical Delivery Address</h3>
        <p className="tables-desc">
          Enter your restaurant's exact physical address. This is used to accurately calculate delivery distances and fees.
        </p>

        <div className="tables-input-row" style={{ display: "block" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <label style={{ margin: 0, fontWeight: "600", color: "#475569" }}>Full Physical Address:</label>
            <button 
              className="location-btn-small" 
              onClick={handleGetLocation}
              disabled={locLoading}
              style={{ 
                padding: "6px 12px", 
                fontSize: "12px", 
                background: "#f8fafc", 
                border: "1px solid #e2e8f0", 
                borderRadius: "8px", 
                cursor: "pointer", 
                display: "flex", 
                alignItems: "center", 
                gap: "6px",
                color: "#64748b",
                fontWeight: "700",
                transition: "all 0.2s"
              }}
            >
              {locLoading ? "⌛ Fetching..." : "📍 Use Current Location"}
            </button>
          </div>
          <textarea
            rows="3"
            placeholder="e.g. Shop No. 12, Celebration Mall, Udaipur, Rajasthan - 313001"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            style={{ width: "100%", padding: "12px", border: "1.5px solid #e2e8f0", borderRadius: "10px", fontSize: "14px", fontFamily: "inherit", marginBottom: "12px" }}
          />
          
          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "12px", color: "#ef4444", fontWeight: "700", display: "block", marginBottom: "4px" }}>
                Latitude <span style={{ color: "#ef4444" }}>*</span> (Required)
              </label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 24.5854"
                value={coordinates.lat || ""}
                onChange={(e) => setCoordinates(prev => ({ ...prev, lat: e.target.value }))}
                style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "14px" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "12px", color: "#ef4444", fontWeight: "700", display: "block", marginBottom: "4px" }}>
                Longitude <span style={{ color: "#ef4444" }}>*</span> (Required)
              </label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 73.7125"
                value={coordinates.lon || ""}
                onChange={(e) => setCoordinates(prev => ({ ...prev, lon: e.target.value }))}
                style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "14px" }}
              />
            </div>
          </div>
          <p style={{ fontSize: "11px", color: "#64748b", marginTop: "8px", fontStyle: "italic" }}>
             💡 Find these coordinates by Right-Clicking your restaurant on Google Maps.
          </p>
        </div>

        <button className="primary-btn" onClick={saveAddress} disabled={savingAddress} style={{ marginTop: 16 }}>
          {savingAddress ? "Saving..." : "Save Address"}
        </button>

        {addressMsg && <p className="tables-msg">{addressMsg}</p>}
      </div>

      {/* ======== PAYMENT SETTINGS ======== */}
      <h2 className="section-title">💳 Payment Settings</h2>

      <div className="tables-config-card">
        <h3>Booking Payment Configuration</h3>
        <p className="tables-desc">
          Configure how much customers pay when booking a table. Payment goes through Razorpay.
        </p>

        <div className="tables-input-row">
          <label>Booking Fee (₹):</label>
          <input
            type="number"
            min="0"
            max="10000"
            value={paymentFee}
            onChange={(e) => setPaymentFee(e.target.value)}
          />
        </div>

        <div className="tables-input-row" style={{ marginTop: 12 }}>
          <label>Your UPI ID:</label>
          <input
            type="text"
            placeholder="e.g. restaurant@paytm"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
          />
        </div>

        <div className="tables-input-row" style={{ marginTop: 12 }}>
          <label>Require Payment:</label>
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={paymentEnabled}
              onChange={(e) => setPaymentEnabled(e.target.checked)}
            />
            <span>{paymentEnabled ? "✅ Enabled — customers must pay when booking" : "❌ Disabled — payment is optional"}</span>
          </label>
        </div>

        <button className="primary-btn" onClick={savePaymentSettings} disabled={savingPayment} style={{ marginTop: 16 }}>
          {savingPayment ? "Saving..." : "Save Payment Settings"}
        </button>

        {payMsg && <p className="tables-msg">{payMsg}</p>}
      </div>

      <h2 className="section-title">📋 Your Tables ({totalTables})</h2>

      <div className="tables-visual">
        {Array.from({ length: totalTables }, (_, i) => i + 1).map((num) => (
          <div key={num} className="table-visual-card">
            <span className="table-icon">🪑</span>
            <span className="table-num">Table {num}</span>
          </div>
        ))}
      </div>
    </div>
  );
}