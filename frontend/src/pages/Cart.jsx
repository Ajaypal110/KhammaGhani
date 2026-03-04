import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import "../styles/home.css"; 
import "../styles/cart.css"; // The new Swiggy-like design

const emptyAddr = { fullName: "", phone: "", house: "", area: "", city: "", pincode: "", type: "Home", lat: null, lon: null };


export default function Cart() {
  const { cartItems, restaurantId, addToCart, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [address, setAddress] = useState("");
  const [userAddresses, setUserAddresses] = useState([]);
  const [selectedAddrId, setSelectedAddrId] = useState(null);
  const [distanceKm, setDistanceKm] = useState(null);
  const [distLoading, setDistLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [platformFee, setPlatformFee] = useState(5); // Default platform fee ₹5
  const [distError, setDistError] = useState("");

  // Address Form State
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [addrForm, setAddrForm] = useState({ ...emptyAddr });
  const [editingAddrId, setEditingAddrId] = useState(null);
  const [addrSaving, setAddrSaving] = useState(false);

  const subtotal = cartItems.reduce((acc, item) => {
    const itemPrice = item.variant?.price || item.price;
    const addOnsTotal = (item.selectedAddOns || []).reduce((sum, a) => sum + a.price, 0);
    return acc + (itemPrice + addOnsTotal) * item.qty;
  }, 0);

  const isDeliveryTooFar = distanceKm !== null && distanceKm > 20;


  const handleApplyCoupon = (code) => {
    if (code === "FIRST10") {
      setDiscountAmount(Math.round(subtotal * 0.10));
      setCouponCode(code);
      alert("Coupon APPLIED: 10% Off your first order!");
    } else if (code === "GET100" && subtotal > 1000) {
      setDiscountAmount(100);
      setCouponCode(code);
      alert("Coupon APPLIED: ₹100 Off!");
    } else if (code === "GET100") {
      alert("Cart subtotal must be greater than ₹1000 to apply GET100.");
    } else {
      alert("Invalid Coupon Code");
    }
  };

  const handleRemoveCoupon = () => {
    setDiscountAmount(0);
    setCouponCode("");
  };

  const gstAmount = Math.round((subtotal - discountAmount) * 0.18);
  const totalAmount = Math.max(0, subtotal - discountAmount + deliveryFee + gstAmount + platformFee);

  // Fetch addresses and restaurant
  const fetchAddresses = async () => {
    try {
      const { data } = await API.get("/users/addresses");
      setUserAddresses(data);
    } catch (err) {
      console.error("Addresses fetch error:", err);
    }
  };

  // 1. Fetch addresses on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) fetchAddresses();
  }, []);

  // 2. Fetch/Update restaurant whenever restaurantId changes
  useEffect(() => {
    if (restaurantId && restaurantId !== "[object Object]") {
      // Clear old state immediately to prevent stale UI
      setRestaurant(null); 
      setDistanceKm(null);

      API.get(`/restaurants/${restaurantId}`)
        .then((res) => {
          setRestaurant(res.data);
        })
        .catch((err) => {
          console.error("Cart fetch restaurant error:", err);
          setRestaurant({ name: "Error Loading Restaurant", error: true });
        });
    } else {
       setRestaurant(null);
       setDistanceKm(null);
    }
  }, [restaurantId]);

  // 3. Reactively calculate distance whenever restaurant or selectedAddrId changes
  useEffect(() => {
    if (restaurant && !restaurant.error && selectedAddrId && userAddresses.length > 0) {
      const addr = userAddresses.find(a => a._id?.toString() === selectedAddrId?.toString());
      if (addr) {
        // Pass 'restaurant' explicitly to prevent 'unselect' logic and ensure correct data
        handleSelectAddr(addr, restaurant);
      }
    } else if (!selectedAddrId) {
      setDistanceKm(null);
    }
  }, [restaurant?._id, selectedAddrId, userAddresses.length]);

  // AUTO-GEOCODE when address form fields change (Debounced)
  useEffect(() => {
    const { area, city, pincode } = addrForm;
    if (!area || !city) return;

    const query = `${area}, ${city}, ${pincode || ""}`.trim();
    if (query.length < 8) return;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
        const data = await res.json();
        if (data && data.length > 0) {
          const newLat = parseFloat(data[0].lat);
          const newLon = parseFloat(data[0].lon);
          
          // Only update if significantly different or null to avoid loops/flicker
          setAddrForm(prev => {
            if (prev.lat === newLat && prev.lon === newLon) return prev;
            return { ...prev, lat: newLat, lon: newLon };
          });
          console.log("Auto-geocoded user address:", newLat, newLon);
        }
      } catch (err) {
        console.error("Auto-geocode error:", err);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [addrForm.area, addrForm.city, addrForm.pincode]);

  // Select an address handled below


  // Add / Edit address
  const handleAddrSubmit = async (e) => {
    e.preventDefault();
    setAddrSaving(true);
    try {
      if (editingAddrId) {
        const { data } = await API.put(`/users/addresses/${editingAddrId}`, addrForm);
        setUserAddresses(data);
      } else {
        const { data } = await API.post("/users/addresses", addrForm);
        setUserAddresses(data);
      }
      // Auto-select the new/edited address
      setShowAddrForm(false);
      setAddrForm({ ...emptyAddr });
      setEditingAddrId(null);
      const { data: updatedAddresses } = await API.get("/users/addresses");
      setUserAddresses(updatedAddresses);
      
      // If it was a new address (not an edit), select it automatically
      if (!editingAddrId && updatedAddresses.length > 0) {
        const newAddr = updatedAddresses[updatedAddresses.length - 1];
        if (newAddr._id) setSelectedAddrId(newAddr._id);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save address");
    } finally {
      setAddrSaving(false);
    }
  };

  // Edit address
  const handleEditAddr = (addr) => {
    setAddrForm({
      fullName: addr.fullName || "",
      phone: addr.phone || "",
      house: addr.house || "",
      area: addr.area || "",
      city: addr.city || "",
      pincode: addr.pincode || "",
      type: addr.type || "Home",
      lat: addr.lat || null,
      lon: addr.lon || null,
    });
    setEditingAddrId(addr._id);
    setShowAddrForm(true);
  };

  // Delete address
  const handleDeleteAddr = async (addrId) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      const { data } = await API.delete(`/users/addresses/${addrId}`);
      setUserAddresses(data);
      if (selectedAddrId === addrId) {
        setSelectedAddrId(null);
        setAddress("");
      }
    } catch (err) {
      alert("Failed to delete address");
    }
  };

  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLocLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const userLat = position.coords.latitude;
          const userLon = position.coords.longitude;

          // Reverse geocode to get address string
          const revGeo = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLat}&lon=${userLon}`
          );
          const revData = await revGeo.json();
          if (revData && revData.display_name) {
            // Try to extract parts from the display_name or address object if available
            const addrDetails = revData.address || {};
            
            setAddrForm(prev => ({
              ...prev,
              house: addrDetails.house_number || addrDetails.building || "",
              area: addrDetails.road || addrDetails.suburb || addrDetails.neighbourhood || revData.display_name.split(",")[0],
              city: addrDetails.city || addrDetails.town || addrDetails.county || "",
              pincode: addrDetails.postcode || "",
              lat: userLat,
              lon: userLon
            }));
          }

        } catch (error) {
          console.error("Location error:", error);
          alert("Error getting location data.");
        } finally {
          setLocLoading(false);
        }
      },
      () => {
        setLocLoading(false);
        alert("Unable to retrieve your location");
      }
    );
  };

  // Select an address and calculate distance via Backend
  const handleSelectAddr = async (addr, resOverride = null) => {
    const activeRes = resOverride || restaurant;
    
    // If clicking the already selected address, UNSELECT it.
    if (selectedAddrId?.toString() === addr._id?.toString() && !resOverride) {
      setSelectedAddrId(null);
      setAddress("");
      setDistanceKm(null);
      setDeliveryFee(0);
      setPlatformFee(0);
      return;
    }

    setDistanceKm(null); 
    setDeliveryFee(0); 
    setDistError(""); // Clear old error
    setSelectedAddrId(addr._id);
    const fullAddress = addr.address || `${addr.house}, ${addr.area}, ${addr.city} - ${addr.pincode}`;
    setAddress(fullAddress);

    // Fetch accurate road distance and fee from BACKEND
    if (activeRes) {
      setDistLoading(true);
      try {
        const { data } = await API.get("/orders/delivery-info", {
          params: {
            restaurantId: activeRes._id,
            userLat: addr.lat || null,
            userLon: addr.lon || null,
            userAddress: fullAddress
          }
        });
        
        if (data.available || data.distance !== undefined) {
          setDistanceKm(data.distance);
          setDeliveryFee(data.deliveryFee || 0);
          setPlatformFee(data.platformFee || 0);
        }
      } catch (err) {
        console.error("Error fetching delivery info from backend:", err);
        setDistError(err.response?.data?.message || "Failed to calculate distance. Please try again or re-save your address.");
        setDistanceKm(null);
      } finally {
        setDistLoading(false);
      }
    } else {
       setDistanceKm(null);
    }
  };

  const handleCheckout = async () => {
    if (!address) {
      alert("Please select a delivery address or use your live location.");
      return;
    }
    if (isDeliveryTooFar) {
      alert("Delivery is unavailable for locations more than 20km away.");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to checkout");
      navigate("/login");
      return;
    }

    setCheckoutLoading(true);

    try {
      // 1. Place Order in DB
      const itemsPayload = cartItems.map((item) => ({
        menuId: item._id,
        qty: item.qty,
        variant: item.variant?.name || null,
        addOns: item.selectedAddOns || [],
        spiceLevel: item.spiceLevel || "None",
        instructions: item.instructions || "",
        price: (item.variant?.price || item.price) + (item.selectedAddOns || []).reduce((sum, a) => sum + a.price, 0),
      }));

      const { data: orderData } = await API.post("/orders/order", {
        items: itemsPayload,
        itemsPrice: subtotal,
        totalAmount: totalAmount,
        deliveryFee,
        platformFee,
        gst: gstAmount,
        discount: discountAmount,
        deliveryAddress: address,
        deliveryDistance: distanceKm,
        restaurantId
      });

      // 2. Init Razorpay
      const { data: rzpData } = await API.post(`/orders/razorpay-order/${orderData._id}`);

      const options = {
        key: rzpData.keyId,
        amount: rzpData.amount,
        currency: rzpData.currency,
        name: rzpData.restaurantName,
        description: "Food Delivery Payment",
        order_id: rzpData.orderId,
        theme: {
          color: "#ff6b00",
        },
        handler: async (response) => {
          try {
            await API.post(`/orders/verify-payment/${orderData._id}`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            alert("Payment Successful! Order placed.");
            clearCart();
            navigate("/profile");
          } catch (err) {
            alert("Payment verification failed.");
          }
        },
        modal: {
          ondismiss: () => {
            alert("Payment Cancelled.");
          },
        },
      };

      if (!window.Razorpay) {
        alert("Payment system not loaded. Please refresh the page and try again.");
        setCheckoutLoading(false);
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        alert(`Payment failed: ${response.error.description || 'Unknown error'}`);
      });
      rzp.open();

    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Checkout failed");
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ background: "#f8f9fa", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", paddingBottom: "100px" }}>
        <div style={{ background: "#fff", padding: "60px 40px", borderRadius: "24px", boxShadow: "0 10px 40px rgba(0,0,0,0.05)", textAlign: "center", maxWidth: "400px", width: "90%" }}>
          <div style={{ fontSize: "80px", marginBottom: "20px" }}>🛒</div>
          <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#1e293b", marginBottom: "12px", letterSpacing: "-0.5px" }}>Your Cart is Empty</h2>
          <p style={{ color: "#64748b", margin: "0 0 30px 0", lineHeight: "1.6", fontSize: "15px" }}>
            Looks like you haven't added anything to your cart yet. Explore our top restaurants and discover delicious dishes!
          </p>
          <button 
            onClick={() => navigate("/")} 
            style={{ 
              background: "#ff6b00", color: "#fff", border: "none", padding: "16px 32px", borderRadius: "14px", 
              fontWeight: "700", fontSize: "16px", cursor: "pointer", width: "100%", transition: "all 0.3s ease",
              boxShadow: "0 8px 20px rgba(255, 107, 0, 0.25)"
            }}
            onMouseOver={(e) => {e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 25px rgba(255, 107, 0, 0.35)"}}
            onMouseOut={(e) => {e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(255, 107, 0, 0.25)"}}
          >
            Start Ordering
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#f8f9fa", minHeight: "100vh", paddingBottom: "100px" }}>
      <div className="cart-container">
        {/* LEFT COLUMN - Addresses & Items */}
        <div className="cart-left-col">
          
          <div className="cart-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0 }}>📍 Delivery Address</h3>
              <button 
                onClick={() => { setShowAddrForm(!showAddrForm); setEditingAddrId(null); setAddrForm({ ...emptyAddr }); }}
                style={{ background: "#ff6b00", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "10px", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}
              >
                {showAddrForm ? "✕ Close" : "+ Add New"}
              </button>
            </div>

            {/* Add/Edit Address Form */}
            {showAddrForm && (
              <form onSubmit={handleAddrSubmit} style={{ background: "#f8fafc", padding: "20px", borderRadius: "14px", marginBottom: "16px", border: "1.5px solid #e2e8f0" }}>
                <h4 style={{ margin: "0 0 14px", fontSize: "15px", fontWeight: "700", color: "#334155" }}>
                  {editingAddrId ? "✏️ Edit Address" : "📮 New Delivery Address"}
                </h4>
                
                <button 
                  type="button"
                  className="action-btn-outline" 
                  onClick={handleGetLocation} 
                  disabled={locLoading}
                  style={{ marginBottom: "16px", width: "100%", padding: "10px", borderRadius: "10px", border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer", fontWeight: "600", color: "#334155", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                >
                  {locLoading ? "Detecting location..." : "📌 Use Current Live Location"}
                </button>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <input
                    type="text" placeholder="Full Name *" value={addrForm.fullName} required
                    onChange={(e) => setAddrForm({ ...addrForm, fullName: e.target.value })}
                    style={{ padding: "12px 14px", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "14px", background: "#fff" }}
                  />
                  <input
                    type="text" placeholder="Phone Number *" value={addrForm.phone} required
                    onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })}
                    style={{ padding: "12px 14px", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "14px", background: "#fff" }}
                  />
                  <input
                    type="text" placeholder="House / Flat / Building *" value={addrForm.house} required
                    onChange={(e) => setAddrForm({ ...addrForm, house: e.target.value })}
                    style={{ padding: "12px 14px", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "14px", background: "#fff", gridColumn: "1 / -1" }}
                  />
                  <input
                    type="text" placeholder="Area / Street *" value={addrForm.area} required
                    onChange={(e) => setAddrForm({ ...addrForm, area: e.target.value })}
                    style={{ padding: "12px 14px", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "14px", background: "#fff", gridColumn: "1 / -1" }}
                  />
                  <input
                    type="text" placeholder="City *" value={addrForm.city} required
                    onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })}
                    style={{ padding: "12px 14px", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "14px", background: "#fff" }}
                  />
                  <input
                    type="text" placeholder="Pincode *" value={addrForm.pincode} required
                    onChange={(e) => setAddrForm({ ...addrForm, pincode: e.target.value })}
                    style={{ padding: "12px 14px", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "14px", background: "#fff" }}
                  />
                </div>

                {/* Address Type Toggle */}
                <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
                  {["Home", "Office"].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setAddrForm({ ...addrForm, type: t })}
                      style={{
                        padding: "10px 20px", borderRadius: "10px", fontWeight: "700", fontSize: "13px", cursor: "pointer",
                        border: addrForm.type === t ? "2px solid #ff6b00" : "1.5px solid #e2e8f0",
                        background: addrForm.type === t ? "#fff7f2" : "#fff",
                        color: addrForm.type === t ? "#ff6b00" : "#64748b",
                      }}
                    >
                      {t === "Home" ? "🏠" : "🏢"} {t}
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                  <button
                    type="submit"
                    disabled={addrSaving}
                    style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "none", background: "#ff6b00", color: "#fff", fontWeight: "700", fontSize: "14px", cursor: "pointer" }}
                  >
                    {addrSaving ? "Saving..." : editingAddrId ? "Update Address" : "Save Address"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowAddrForm(false); setEditingAddrId(null); setAddrForm({ ...emptyAddr }); }}
                    style={{ padding: "12px 20px", borderRadius: "10px", border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Saved Addresses */}
            {userAddresses.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                {userAddresses.map((addr) => (
                  <div
                    key={addr._id}
                    style={{
                      padding: "16px", borderRadius: "14px", cursor: "pointer",
                      border: selectedAddrId === addr._id ? "2px solid #ff6b00" : "1.5px solid #e5e7eb",
                      background: selectedAddrId === addr._id ? "#fff7f2" : "#fff",
                      transition: "all 0.2s",
                    }}
                    onClick={() => handleSelectAddr(addr)}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", flex: 1 }}>
                        {/* Radio dot */}
                        <div style={{
                          width: "20px", height: "20px", borderRadius: "50%", flexShrink: 0, marginTop: "2px",
                          border: selectedAddrId === addr._id ? "6px solid #ff6b00" : "2px solid #d1d5db",
                          background: "#fff",
                        }} />
                        <div>
                          <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "4px" }}>
                            <span style={{
                              background: (addr.type || addr.label) === "Home" ? "#dcfce7" : "#dbeafe",
                              color: (addr.type || addr.label) === "Home" ? "#16a34a" : "#2563eb",
                              padding: "3px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "800",
                            }}>
                              {(addr.type || addr.label) === "Home" ? "🏠 HOME" : "🏢 OFFICE"}
                            </span>
                            {addr.fullName && <span style={{ fontWeight: "700", fontSize: "14px", color: "#1e293b" }}>{addr.fullName}</span>}
                          </div>
                          <div style={{ fontSize: "13px", color: "#64748b", lineHeight: "1.5" }}>
                            {addr.house && `${addr.house}, `}{addr.area && `${addr.area}, `}{addr.city && `${addr.city}`}{addr.pincode && ` - ${addr.pincode}`}
                            {!addr.house && addr.address}
                          </div>
                          {addr.phone && <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>📞 {addr.phone}</div>}
                        </div>
                      </div>
                      {/* Edit/Delete */}
                      <div style={{ display: "flex", gap: "6px", flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => handleEditAddr(addr)} style={{ padding: "6px 10px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontSize: "12px" }}>✏️</button>
                        <button onClick={() => handleDeleteAddr(addr._id)} style={{ padding: "6px 10px", borderRadius: "8px", border: "1px solid #fee2e2", background: "#fef2f2", color: "#ef4444", cursor: "pointer", fontSize: "12px" }}>🗑️</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Distance Info */}
            {distLoading ? (
              <p style={{ fontSize: "13px", color: "#64748b", marginTop: "16px", background: "#f8fafc", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                ⏳ Calculating exact delivery distance & fee...
              </p>
            ) : distanceKm !== null && selectedAddrId ? (
              <div style={{ marginTop: "16px", background: isDeliveryTooFar ? "#fef2f2" : "#f8fafc", padding: "12px", borderRadius: "10px", border: isDeliveryTooFar ? "1px solid #fee2e2" : "1px solid #e2e8f0" }}>
                <p style={{ fontSize: "13px", color: isDeliveryTooFar ? "#ef4444" : "#64748b", margin: 0, fontWeight: "600" }}>
                  📍 {isDeliveryTooFar ? "Delivery Unavailable" : `Delivery Distance: ~${distanceKm.toFixed(1)} km`}
                </p>
                {isDeliveryTooFar ? (
                  <p style={{ fontSize: "11px", color: "#ef4444", marginTop: "4px" }}>
                    Restaurant is too far from your location (Max 20km).
                  </p>
                ) : (
                  <p style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
                    Estimated delivery fee: <b>₹{deliveryFee}</b>
                  </p>
                )}
              </div>
            ) : distError && selectedAddrId ? (
              <div style={{ marginTop: "16px", background: "#fef2f2", padding: "12px", borderRadius: "10px", border: "1px solid #fee2e2" }}>
                <p style={{ fontSize: "13px", color: "#ef4444", margin: 0, fontWeight: "600" }}>
                  ⚠️ {distError}
                </p>
              </div>
            ) : null}
          </div>

          <div className="cart-card">
            <h3>🛒 Order Details</h3>
            <div className="restaurant-branding">
              {restaurant?.error ? (
                <div style={{ color: "#ef4444", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                   <span>⚠️ Failed to load restaurant details.</span>
                   <button onClick={() => window.location.reload()} style={{ background: "none", border: "1px solid #ef4444", color: "#ef4444", borderRadius: "4px", padding: "2px 8px", cursor: "pointer", fontSize: "11px" }}>Retry</button>
                </div>
              ) : (
                <h2>{restaurant?.name || (cartItems.length > 0 ? "Loading Restaurant..." : "No Items")}</h2>
              )}
            </div>
            
            <div className="cart-items-list">
              {cartItems.map((item, idx) => (
                  <div key={item._id + (item.variant?.name || "") + JSON.stringify(item.selectedAddOns) + item.spiceLevel + idx} className="cart-item-row">
                    <div className="cart-item-info">
                      <img src={item.image} alt={item.name} className="cart-item-img" />
                      <div>
                         <h4 className="cart-item-name">{item.name}</h4>
                        {item.variant && (
                          <div style={{ fontSize: "12px", color: "#ff6b00", background: "#fff7f2", padding: "2px 8px", borderRadius: "10px", display: "inline-block", marginTop: "4px", fontWeight: "600", marginRight: "5px" }}>
                            {["Beverages", "Desserts"].includes(item.category) ? "🥤 Size: " : "⚖️ Portion: "} {item.variant.name}
                          </div>
                        )}
                        {item.spiceLevel && item.spiceLevel !== "None" && (
                          <div style={{ fontSize: "11px", color: "#ef4444", background: "#fef2f2", padding: "2px 8px", borderRadius: "10px", display: "inline-block", marginTop: "4px", fontWeight: "600" }}>
                            🌶️ {item.spiceLevel}
                          </div>
                        )}
                        {item.selectedAddOns?.length > 0 && (
                          <div style={{ fontSize: "11px", color: "#16a34a", marginTop: "6px" }}>
                             <b>Extras:</b> {item.selectedAddOns.map(a => `${a.name}(₹${a.price})`).join(", ")}
                          </div>
                        )}
                        {item.instructions && (
                          <div style={{ fontSize: "11px", color: "#64748b", fontStyle: "italic", marginTop: "4px" }}>
                             "{item.instructions}"
                          </div>
                        )}
                        <div className="cart-item-price">₹{(item.variant?.price || item.price) + (item.selectedAddOns || []).reduce((sum, a) => sum + a.price, 0)} each</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: "8px" }}>
                      <div className="qty-control">
                        <button className="qty-btn remove" onClick={() => removeFromCart(item._id, item.variant, item.selectedAddOns, item.spiceLevel, item.instructions)}>−</button>
                        <span className="qty-val">{item.qty}</span>
                        <button className="qty-btn" onClick={() => addToCart(item, restaurantId, item.variant, 1, item.selectedAddOns, item.spiceLevel, item.instructions)}>+</button>
                      </div>
                      <div className="item-total">₹{((item.variant?.price || item.price) + (item.selectedAddOns || []).reduce((sum, a) => sum + a.price, 0)) * item.qty}</div>
                    </div>
                  </div>
              ))}
            </div>

            <button
              onClick={clearCart}
              style={{ width: "100%", padding: "12px", background: "transparent", color: "#ef4444", border: "1px dashed #ef4444", borderRadius: "8px", marginTop: "24px", cursor: "pointer", fontWeight: "600" }}
            >
              Clear Cart
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN - Offers & Bill */}
        <div className="cart-right-col">
          
          <div className="cart-card">
            <h3>🎁 Offers & Benefits</h3>
            
            <div className={`offer-card-small ${couponCode === "FIRST10" ? "applied" : ""}`}>
              <div>
                <span className="offer-label">FIRST10</span>
                <div className="offer-title">10% OFF on first order</div>
              </div>
              <button 
                className={`offer-apply-btn ${couponCode === "FIRST10" ? "remove-mode" : ""}`}
                onClick={() => couponCode === "FIRST10" ? handleRemoveCoupon() : handleApplyCoupon("FIRST10")}
              >
                {couponCode === "FIRST10" ? "Remove" : "Apply"}
              </button>
            </div>

            <div className={`offer-card-small ${couponCode === "GET100" ? "applied" : ""}`}>
              <div>
                <span className="offer-label">GET100</span>
                <div className="offer-title">Flat ₹100 OFF (&gt;₹1k)</div>
              </div>
              <button 
                disabled={couponCode !== "GET100" && subtotal <= 1000}
                className={`offer-apply-btn ${couponCode === "GET100" ? "remove-mode" : ""}`}
                onClick={() => couponCode === "GET100" ? handleRemoveCoupon() : handleApplyCoupon("GET100")}
              >
                {couponCode === "GET100" ? "Remove" : "Apply"}
              </button>
            </div>
          </div>

          <div className="cart-card">
            <h3>🧾 Bill Details</h3>
            
            <div className="bill-row">
              <span>Food Total</span>
              <span>₹{subtotal}</span>
            </div>
            
            {discountAmount > 0 && (
              <div className="bill-row discount">
                <span>Discount ({couponCode})</span>
                <span>- ₹{discountAmount}</span>
              </div>
            )}

            <div className="bill-row">
              <span>Delivery Distance</span>
              <span>{distanceKm !== null ? `${distanceKm.toFixed(1)} km` : "--"}</span>
            </div>

            <div className="bill-row">
              <span>Delivery Fee</span>
              <span>
                {distLoading ? "⏳ Calc..." : `₹${deliveryFee}`}
              </span>
            </div>

            <div className="bill-row">
              <span>Platform Fee</span>
              <span>₹{platformFee}</span>
            </div>

            <div className="bill-row">
              <span>GST & Restaurant Charges (18%)</span>
              <span>₹{gstAmount}</span>
            </div>

            <div className="bill-row total">
              <span>Final Total Amount</span>
              <span>₹{totalAmount}</span>
            </div>

            <button
              className="checkout-btn"
              onClick={handleCheckout}
              disabled={checkoutLoading || isDeliveryTooFar || distanceKm === null}
              style={{ 
                opacity: (checkoutLoading || isDeliveryTooFar || distanceKm === null) ? 0.6 : 1, 
                cursor: (checkoutLoading || isDeliveryTooFar || distanceKm === null) ? "not-allowed" : "pointer",
                background: (isDeliveryTooFar || distanceKm === null) ? "#94a3b8" : "#ff6b00" 
              }}
            >
              {checkoutLoading ? "Processing..." : isDeliveryTooFar ? "Distance Too Far" : distanceKm === null ? "Distance Unknown" : `Checkout • ₹${totalAmount}`}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
