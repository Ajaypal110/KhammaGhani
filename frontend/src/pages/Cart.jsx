import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import "../styles/home.css"; 
import "../styles/cart.css"; // The new Swiggy-like design

// Haversine formula to calculate distance in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

export default function Cart() {
  const { cartItems, restaurantId, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [address, setAddress] = useState("");
  const [userAddresses, setUserAddresses] = useState([]);
  const [distanceKm, setDistanceKm] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  let deliveryFee = 0;
  if (subtotal > 500) {
    deliveryFee = 0;
  } else if (distanceKm !== null) {
    deliveryFee = Math.round(distanceKm * 10);
  }


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
  const totalAmount = Math.max(0, subtotal - discountAmount + deliveryFee + gstAmount);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      API.get("/auth/me")
        .then((res) => {
          if (res.data.addresses) setUserAddresses(res.data.addresses);
        })
        .catch(console.error);
    }

    if (restaurantId) {
      API.get(`/restaurants/${restaurantId}`)
        .then((res) => setRestaurant(res.data))
        .catch((err) => console.log(err));
    }
  }, [restaurantId]);

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
            setAddress(revData.display_name);
          }

          // Geocode Restaurant Address to get distance
          const resQuery = (restaurant && restaurant.address) ? restaurant.address : (restaurant && restaurant.restaurantId);
          if (resQuery) {
            const resGeo = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                resQuery
              )}`
            );
            const resData = await resGeo.json();
            if (resData && resData.length > 0) {
              const resLat = parseFloat(resData[0].lat);
              const resLon = parseFloat(resData[0].lon);
              const dist = calculateDistance(userLat, userLon, resLat, resLon);
              setDistanceKm(dist);
            } else {
              // Fallback or warning if restaurant address not found
              alert("Could not calculate exact distance to restaurant. A flat delivery fee of ₹40 will be applied.");
              setDistanceKm(4); // simulate 4km
            }
          } else {
             // Fallback
             setDistanceKm(4);
          }
        } catch (error) {
          console.error("Location error:", error);
          alert("Error getting location data. Flat delivery fee applied.");
          setDistanceKm(4);
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

  const handleCheckout = async () => {
    if (!address) {
      alert("Please enter a delivery address or use your live location.");
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
      }));

      const { data: orderData } = await API.post("/orders/order", {
        items: itemsPayload,
        totalAmount: totalAmount, // Adjusted for discount + GST + Delivery
        deliveryFee,
        gst: gstAmount,
        discount: discountAmount,
        deliveryAddress: address,
        distance: distanceKm,
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
            // 3. Verify Payment
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

      const rzp = new window.Razorpay(options);
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
      <div style={{ padding: "100px 20px", textAlign: "center" }}>
        <h2>Your Cart is Empty 🛒</h2>
        <button onClick={() => navigate("/")} style={{ padding: "10px 20px", marginTop: "20px", cursor: "pointer" }}>
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: "#f8f9fa", minHeight: "100vh", paddingBottom: "100px" }}>
      <div className="cart-container">
        
        {/* LEFT COLUMN - Addresses & Items */}
        <div className="cart-left-col">
          
          <div className="cart-card">
            <h3>📍 Delivery Address</h3>
            
            {userAddresses && userAddresses.length > 0 && (
              <div className="address-grid">
                {userAddresses.map((addr, idx) => (
                  <div 
                    key={idx} 
                    className={`address-pill ${address === addr.address ? 'selected' : ''}`}
                    onClick={() => setAddress(addr.address)}
                  >
                    <div className="address-pill-label">
                      {addr.label === "Home" ? "🏠" : addr.label === "Office" ? "🏢" : "📍"} {addr.label}
                    </div>
                    <div className="address-pill-text">{addr.address}</div>
                  </div>
                ))}
              </div>
            )}

            <button 
              className="action-btn-outline" 
              onClick={handleGetLocation} 
              disabled={locLoading}
              style={{ marginBottom: "16px" }}
            >
              {locLoading ? "Detecting location..." : "📌 Use Current Live Location"}
            </button>

            <textarea
              className="address-textarea"
              placeholder="Enter precise delivery address or landmark manally..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            {distanceKm !== null && subtotal <= 500 && (
              <p style={{ fontSize: "13px", color: "#64748b", marginTop: "8px" }}>
                Distance: ~{distanceKm.toFixed(1)} km
              </p>
            )}
          </div>

          <div className="cart-card">
            <h3>🛒 Order Details</h3>
            <div className="restaurant-branding">
              <h2>{restaurant?.name || "Loading..."}</h2>
            </div>
            
            <div className="cart-items-list">
              {cartItems.map((item) => (
                <div key={item._id} className="cart-item-row">
                  <div className="cart-item-info">
                    <img src={item.image} alt={item.name} className="cart-item-img" />
                    <div>
                      <h4 className="cart-item-name">{item.name}</h4>
                      <div className="cart-item-price">₹{item.price} each</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: "8px" }}>
                    <div className="qty-control">
                      <button className="qty-btn remove" onClick={() => removeFromCart(item._id)}>−</button>
                      <span className="qty-val">{item.qty}</span>
                      <button className="qty-btn" onClick={() => addToCart(item, restaurantId)}>+</button>
                    </div>
                    <div className="item-total">₹{item.price * item.qty}</div>
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
              <span>Item Total</span>
              <span>₹{subtotal}</span>
            </div>
            
            {discountAmount > 0 && (
              <div className="bill-row discount">
                <span>Discount ({couponCode})</span>
                <span>- ₹{discountAmount}</span>
              </div>
            )}

            <div className="bill-row">
              <span>Delivery Fee {subtotal > 500 && <span style={{color: '#16a34a', fontWeight: 'bold'}}>(Free)</span>}</span>
              <span>₹{deliveryFee}</span>
            </div>

            <div className="bill-row">
              <span>GST & Restaurant Charges (18%)</span>
              <span>₹{gstAmount}</span>
            </div>

            <div className="bill-row total">
              <span>To Pay</span>
              <span>₹{totalAmount}</span>
            </div>

            <button
              className="checkout-btn"
              onClick={handleCheckout}
              disabled={checkoutLoading}
            >
              {checkoutLoading ? "Processing..." : `Checkout • ₹${totalAmount}`}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
