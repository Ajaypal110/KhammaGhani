import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Loader from "../components/Loader";
import "../styles/restaurant.css";

export default function RestaurantDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("menu");
  const [menu, setMenu] = useState([]);
  const [images, setImages] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [orders, setOrders] = useState([]);
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
          </div>

          <button className="sidebar-logout" onClick={logoutHandler}>
            🚪 Logout
          </button>
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
                <OrdersSection orders={orders} />
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
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const submitHandler = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("description", description);
    if (image) formData.append("image", image);

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
      console.log(err);
    }
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
    setDescription(item.description);
    setPreview(item.image);
  };

  const resetForm = () => {
    setName("");
    setPrice("");
    setDescription("");
    setImage(null);
    setPreview(null);
    setEditingId(null);
  };

  return (
    <div className="menu-wrapper">
      <h2 className="section-title">{editingId ? "✏️ Edit Dish" : "➕ Add New Dish"}</h2>

      <form className="menu-card-form" onSubmit={submitHandler}>
        <div className="image-upload">
          {preview ? (
            <img src={preview} alt="preview" />
          ) : (
            <div className="image-placeholder">📷 Upload Dish Image</div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              setImage(e.target.files[0]);
              setPreview(URL.createObjectURL(e.target.files[0]));
            }}
          />
        </div>

        <input
          type="text"
          placeholder="Dish Name"
          value={name}
          required
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="number"
          placeholder="Price"
          value={price}
          required
          onChange={(e) => setPrice(e.target.value)}
        />

        <textarea
          placeholder="Description"
          value={description}
          required
          onChange={(e) => setDescription(e.target.value)}
        />

        <button type="submit" className="primary-btn">
          {editingId ? "Update Menu Item" : "Add Menu Item"}
        </button>

        {editingId && (
          <button type="button" className="cancel-btn" onClick={resetForm}>
            Cancel Edit
          </button>
        )}
      </form>

      <h2 className="section-title">📋 Your Menu ({menu.length} items)</h2>

      <div className="menu-grid">
        {menu.length === 0 && <p className="empty-msg">No menu items yet. Add your first dish above!</p>}
        {menu.map((item) => (
          <div key={item._id} className="menu-card">
            <img src={item.image} alt={item.name} />

            <div className="menu-info">
              <h4>{item.name}</h4>
              <p>₹ {item.price}</p>
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
   ORDERS SECTION (NEW)
================================================================ */
function OrdersSection({ orders }) {
  return (
    <div className="orders-section">
      <h2 className="section-title">📦 Orders ({orders.length})</h2>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <p className="empty-msg">No orders received yet. Orders from customers will appear here.</p>
        </div>
      ) : (
        <div className="orders-grid">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <span className="order-id">#{order._id.slice(-6).toUpperCase()}</span>
                <span className={`status-badge status-${order.status?.toLowerCase()?.replace(/\s+/g, "")}`}>
                  {order.status}
                </span>
              </div>
              <div className="order-body">
                <p><strong>Items:</strong> {order.items?.length || 0} items</p>
                <p><strong>Total:</strong> ₹ {order.totalAmount || 0}</p>
                <p className="order-time">
                {new Date(order.createdAt).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
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

  useEffect(() => {
    setNewTotal(totalTables);
  }, [totalTables]);

  // Fetch payment settings on mount
  useEffect(() => {
    const fetchPaymentSettings = async () => {
      try {
        const { data } = await API.get("/restaurants/my/profile");
        setPaymentFee(data.bookingFee || 199);
        setUpiId(data.upiId || "");
        setPaymentEnabled(data.paymentEnabled || false);
      } catch (err) {
        console.log(err);
      }
    };
    fetchPaymentSettings();
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