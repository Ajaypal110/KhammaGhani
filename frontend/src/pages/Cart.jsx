import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import "../styles/home.css"; // Reuse some styles or inline for now

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

  const totalAmount = Math.max(0, subtotal - discountAmount + deliveryFee);

  useEffect(() => {
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
        totalAmount: totalAmount, // Adjusted for discount
        deliveryFee,
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
    <div style={{ maxWidth: "800px", margin: "80px auto", padding: "20px", fontFamily: "Inter, sans-serif" }}>
      <h2>Your Cart</h2>
      {restaurant && <p style={{ color: "#888", marginBottom: "20px" }}>Ordering from: <strong>{restaurant.name}</strong></p>}

      <div style={{ border: "1px solid #eee", borderRadius: "12px", overflow: "hidden", marginBottom: "30px" }}>
        {cartItems.map((item) => (
          <div key={item._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", borderBottom: "1px solid #eee" }}>
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <img src={item.image} alt={item.name} style={{ width: "60px", height: "60px", borderRadius: "8px", objectFit: "cover" }} />
              <div>
                <h4 style={{ margin: 0 }}>{item.name}</h4>
                <div style={{ fontSize: "14px", color: "#666", marginTop: "4px" }}>
                  ₹{item.price} x {item.qty}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <strong>₹{item.price * item.qty}</strong>
              <button onClick={() => removeFromCart(item._id)} style={{ padding: "6px 12px", background: "#fef2f2", color: "#ef4444", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
                -
              </button>
            </div>
          </div>
        ))}
        <div style={{ padding: "16px", background: "#fafafa" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </div>
          {discountAmount > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", color: "#16a34a", fontWeight: "600" }}>
              <span>Discount ({couponCode.toUpperCase()})</span>
              <span>- ₹{discountAmount}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
            <span>Delivery Fee</span>
            <span>
              {subtotal > 500 ? (
                <span style={{ color: "green", fontWeight: "bold" }}>FREE (Order &gt; ₹500)</span>
              ) : distanceKm !== null ? (
                `₹${deliveryFee}`
              ) : (
                <span style={{ color: "#888", fontSize: "12px" }}>Calculate distance</span>
              )}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "20px", fontWeight: "800", borderTop: "1px solid #ddd", paddingTop: "12px" }}>
            <span>Total</span>
            <span>₹{totalAmount}</span>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "30px", padding: "20px", border: "1px solid #eee", borderRadius: "12px", background: "#fefcfa" }}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: "16px" }}>Available Offers</h3>
        
        {/* FIRST10 Coupon */}
        <div style={{ border: "2px dashed #ff6b00", borderRadius: "8px", padding: "16px", background: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div>
            <div style={{ display: "inline-block", padding: "4px 8px", background: "#ffedd5", color: "#c2410c", fontWeight: "bold", borderRadius: "4px", fontSize: "12px", marginBottom: "8px" }}>
              FIRST10
            </div>
            <div style={{ fontWeight: "600", fontSize: "14px", color: "#1a1a1a" }}>10% OFF on your first order</div>
            <p style={{ fontSize: "12px", color: "#666", margin: "4px 0 0 0" }}>Get 10% off your entire subtotal.</p>
          </div>
          <button 
            onClick={() => handleApplyCoupon("FIRST10")}
            disabled={couponCode === "FIRST10"}
            style={{ 
              padding: "8px 16px", 
              background: couponCode === "FIRST10" ? "#e5e7eb" : "#ff6b00", 
              color: couponCode === "FIRST10" ? "#9ca3af" : "#fff", 
              border: "none", 
              borderRadius: "8px", 
              cursor: couponCode === "FIRST10" ? "not-allowed" : "pointer", 
              fontWeight: "600" 
            }}
          >
            {couponCode === "FIRST10" ? "Applied" : "Apply"}
          </button>
        </div>

        {/* GET100 Coupon */}
        <div style={{ border: "2px dashed #16a34a", borderRadius: "8px", padding: "16px", background: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-block", padding: "4px 8px", background: "#dcfce7", color: "#15803d", fontWeight: "bold", borderRadius: "4px", fontSize: "12px", marginBottom: "8px" }}>
              GET100
            </div>
            <div style={{ fontWeight: "600", fontSize: "14px", color: "#1a1a1a" }}>Flat ₹100 OFF</div>
            <p style={{ fontSize: "12px", color: "#666", margin: "4px 0 0 0" }}>Valid on orders above ₹1000.</p>
          </div>
          <button 
            onClick={() => handleApplyCoupon("GET100")}
            disabled={couponCode === "GET100" || subtotal <= 1000}
            style={{ 
              padding: "8px 16px", 
              background: couponCode === "GET100" ? "#e5e7eb" : (subtotal > 1000 ? "#16a34a" : "#cbd5e1"), 
              color: couponCode === "GET100" ? "#9ca3af" : "#fff", 
              border: "none", 
              borderRadius: "8px", 
              cursor: (couponCode === "GET100" || subtotal <= 1000) ? "not-allowed" : "pointer", 
              fontWeight: "600" 
            }}
          >
            {couponCode === "GET100" ? "Applied" : "Apply"}
          </button>
        </div>
      </div>

      <div style={{ marginBottom: "30px", padding: "20px", border: "1px solid #eee", borderRadius: "12px" }}>
        <h3 style={{ margin: "0 0 16px 0" }}>Delivery Information</h3>
        
        <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
          <button 
            onClick={handleGetLocation} 
            disabled={locLoading}
            style={{ padding: "12px 20px", background: "#e0f2fe", color: "#0284c7", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", flexShrink: 0 }}
          >
            {locLoading ? "Checking..." : "📍 Use Live Location"}
          </button>
        </div>

        <textarea
          style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ddd", minHeight: "80px", fontFamily: "inherit" }}
          placeholder="Enter complete delivery address manually or use Live Location above."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        
        {distanceKm !== null && subtotal <= 500 && (
          <p style={{ fontSize: "12px", color: "#666", marginTop: "8px" }}>
            Distance to restaurant: ~{distanceKm.toFixed(1)} km (Delivery: ₹10/km)
          </p>
        )}
        {subtotal > 500 && (
          <p style={{ fontSize: "12px", color: "green", marginTop: "8px", fontWeight: "500" }}>
            Your order is over ₹500. Delivery is free! 🎉
          </p>
        )}
      </div>

      <button
        onClick={handleCheckout}
        disabled={checkoutLoading}
        style={{
          width: "100%", padding: "16px", background: "linear-gradient(135deg, #ff6b00, #ff8c33)", 
          color: "#fff", border: "none", borderRadius: "12px", fontSize: "18px", fontWeight: "800",
          cursor: "pointer"
        }}
      >
        {checkoutLoading ? "Processing..." : `Checkout • Pay ₹${totalAmount}`}
      </button>

      <button
        onClick={clearCart}
        style={{ width: "100%", padding: "16px", background: "transparent", color: "#666", border: "none", marginTop: "10px", cursor: "pointer" }}
      >
        Clear Cart
      </button>

    </div>
  );
}
