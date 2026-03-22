import Order from "../Models/Order.js";
import User from "../Models/User.js";
import DeliveryAgent from "../Models/DeliveryAgent.js";
import razorpay from "../config/razorpay.js";
import crypto from "crypto";
import axios from "axios";


// HELPER: Haversine distance
const calculateHaversine = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const l1 = parseFloat(lat1), o1 = parseFloat(lon1), l2 = parseFloat(lat2), o2 = parseFloat(lon2);
  if (isNaN(l1) || isNaN(o1) || isNaN(l2) || isNaN(o2)) return 0;
  
  const R = 6371; // km
  const dLat = (l2 - l1) * (Math.PI / 180);
  const dLon = (o2 - o1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(l1 * (Math.PI / 180)) * Math.cos(l2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c * 1.25).toFixed(1)); // Road-approximation *1.25
};


// HELPER: Get coordinates from address via Nominatim
const geocodeAddress = async (query) => {
  try {
    const resp = await axios.get(`https://nominatim.openstreetmap.org/search`, {
       params: { format: "json", q: query, limit: 1 },
       headers: { "User-Agent": "KhammaGhani-Restaurant-App/1.0 (contact: vertexadigital.dev@gmail.com)" }
    });
    const data = resp.data;
    if (data && data.length > 0) {
      console.log(`[Geocode] ✅ Found for "${query}": ${data[0].lat}, ${data[0].lon}`);
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    }
    console.log(`[Geocode] ❌ No results for "${query}"`);
  } catch (err) {
    console.error(`[Geocode] ⚠️ Error for "${query}":`, err.message);
  }
  return null;
};


// USER: Get delivery distance and fee based on coordinates or address strings
export const getDeliveryInfo = async (req, res) => {
  try {
    const { restaurantId, userLat, userLon, userAddress } = req.query;
    console.log(`[DeliveryInfo Request] resId: ${restaurantId}, uLat: ${userLat}, uLon: ${userLon}, addr: ${userAddress}`);

    // 1. Get restaurant data
    const restaurant = await User.findById(restaurantId);
    if (!restaurant) {
      console.log(`[DeliveryInfo Error] Restaurant ${restaurantId} not found in DB`);
      return res.status(404).json({ message: "Restaurant not found" });
    }


    let resLat = restaurant.lat;
    let resLon = restaurant.lon;
    let uLat = userLat ? parseFloat(userLat) : null;
    let uLon = userLon ? parseFloat(userLon) : null;

    // 2. If restaurant coordinates are missing, try geocoding
    if (!resLat || !resLon) {
      console.log(`[DeliveryInfo Restaurant] Coords missing for "${restaurant.name}". Geocoding...`);
      
      const rName = (restaurant.name || "").toLowerCase();
      if (rName.includes("khamma") || rName.includes("ghani") || rName.includes("udaipur")) {
        resLat = 24.5936;
        resLon = 73.6791;
        console.log(`[DeliveryInfo Restaurant] ✅ Hardcoded Fallback used: ${resLat}, ${resLon}`);
      } else {
        const resCity = restaurant.city || "Udaipur";
        const queries = [restaurant.address, `${restaurant.name}, ${resCity}`, resCity].filter(Boolean);
        for (const q of queries) {
          let query = q;
          if (!query.toLowerCase().includes("udaipur")) query += ", Udaipur";
          const coords = await geocodeAddress(query);
          if (coords) {
            resLat = coords.lat; resLon = coords.lon;
            break;
          }
        }
      }
    }

    // 3. If user coordinates are missing, try geocoding
    if (!uLat || !uLon) {
      if (userAddress) {
        console.log(`[DeliveryInfo User] Coords missing for "${userAddress}". Geocoding...`);
        const parts = userAddress.split(",").map(p => p.trim());
        const queries = [userAddress, `${parts[0]}, Udaipur`, userAddress.match(/\b\d{6}\b/)?.[0]].filter(Boolean);

        for (const q of queries) {
          let query = q;
          if (!query.toLowerCase().includes("udaipur") && !query.match(/^\d{6}$/)) query += ", Udaipur";
          const coords = await geocodeAddress(query);
          if (coords) {
            uLat = coords.lat; uLon = coords.lon;
            break;
          }
        }
      }
    }

    // EMERGENCY GLOBAL FALLBACKS - NO MORE 400 ERRORS
    if (!resLat || !resLon) {
       resLat = 24.5936; resLon = 73.6791;
       console.log(`[DeliveryInfo Emergency] Restaurant coords still missing, forced Udaipur center`);
    }
    
    let isEstimated = false;
    if (!uLat || !uLon) {
       uLat = 24.5712; uLon = 73.6915; // Random Udaipur residential point
       isEstimated = true;
       console.log(`[DeliveryInfo Emergency] User coords still missing, forced estimate.`);
    }


    let deliveryDistance = null;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    // 4. CALL GOOGLE MAPS API IF KEY EXISTS
    if (apiKey) {
      try {
        const googleUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${resLat},${resLon}&destinations=${uLat},${uLon}&key=${apiKey}`;
        const resp = await axios.get(googleUrl);
        const data = resp.data;
        if (data.status === "OK" && data.rows[0].elements[0].status === "OK") {
          deliveryDistance = parseFloat((data.rows[0].elements[0].distance.value / 1000).toFixed(1));
        }
      } catch (err) { console.log(`[DeliveryInfo Google] API Error: ${err.message}`); }
    }

    // 5. FALLBACK TO HAVERSINE
    if (deliveryDistance === null || isNaN(deliveryDistance)) {
      deliveryDistance = calculateHaversine(resLat, resLon, uLat, uLon);
      console.log(`[DeliveryInfo Haversine] Calculated Distance: ${deliveryDistance} km`);
    }


    // 6. SLAB CALCULATION
    let deliveryFee = 0;
    let available = true;

    if (deliveryDistance > 20) {
      available = false;
    } else if (deliveryDistance <= 3) deliveryFee = 20;
    else if (deliveryDistance <= 6) deliveryFee = 40;
    else if (deliveryDistance <= 10) deliveryFee = 60;
    else if (deliveryDistance <= 15) deliveryFee = 80;
    else if (deliveryDistance <= 20) deliveryFee = 100;
    else available = false;

    console.log(`[DeliveryInfo Final] Distance: ${deliveryDistance}, Fee: ${deliveryFee}, Available: ${available}`);


    res.json({
      available,
      distance: deliveryDistance,
      deliveryFee: available ? deliveryFee : 0,
      platformFee: 5,
      isEstimated,
      message: isEstimated ? "Note: Distance estimated based on city center." : (available ? "" : "Delivery not available for this distance (>20km)")
    });
  } catch (error) {
    console.log(`[DeliveryInfo Fatal] ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};
// USER: Place order

export const placeOrder = async (req, res) => {
  try {
    const { items, itemsPrice, totalAmount, deliveryFee: clientFee, gst, discount, deliveryAddress, deliveryDistance, restaurantId, paymentMethod, couponCode } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    // RECALCULATE FOR SECURITY (Slab-based)
    // We recalculate the distance on the backend using stored clinic/user coords if available
    let backendDistance = deliveryDistance; 

    // Better fallback: if the restaurant has coordinates, and we have user coordinates, recalculate.
    const restaurant = await User.findById(restaurantId);
    const user = await User.findById(req.user._id);
    
    // Check if we can find user lat/lon from their addresses if not provided
    let uLat = null, uLon = null;
    if (deliveryAddress && user?.addresses) {
      const addr = user.addresses.find(a => 
        (a.address === deliveryAddress) || 
        (`${a.house}, ${a.area}, ${a.city} - ${a.pincode}` === deliveryAddress)
      );
      if (addr) { uLat = addr.lat; uLon = addr.lon; }
    }

    if (restaurant?.lat && restaurant?.lon && uLat && uLon) {
      backendDistance = calculateHaversine(restaurant.lat, restaurant.lon, uLat, uLon);
    }

    if (backendDistance > 20) {
      return res.status(400).json({ message: "Delivery not available for this distance (>20km)" });
    }

    let calculatedDeliveryFee = 0;
    if (backendDistance <= 3) calculatedDeliveryFee = 20;
    else if (backendDistance <= 6) calculatedDeliveryFee = 40;
    else if (backendDistance <= 10) calculatedDeliveryFee = 60;
    else if (backendDistance <= 15) calculatedDeliveryFee = 80;
    else if (backendDistance <= 20) calculatedDeliveryFee = 100;


    const platformFee = 5;
    const codFee = (paymentMethod === "COD" || paymentMethod === "Cash on Delivery") ? 20 : 0;
    const subtotal = itemsPrice || 0;

    let finalTotal = Math.max(0, subtotal - (discount || 0) + (gst || 0) + calculatedDeliveryFee + platformFee + codFee);

    // Special ADMINOFF Coupon Handling
    if (couponCode === "ADMINOFF") {
      finalTotal = 1;
    }


    const order = await Order.create({
      user: req.user._id,
      restaurant: restaurantId,
      items,
      itemsPrice: subtotal,
      totalAmount: finalTotal,
      deliveryDistance,
      deliveryFee: calculatedDeliveryFee,
      platformFee,
      codFee,
      gst: gst || 0,
      discount: discount || 0,
      deliveryAddress,
      paymentMethod: paymentMethod === "COD" ? "Cash on Delivery" : "Razorpay",
      paymentStatus: "Pending", // Ensure status remains Pending initially
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// USER: Get my orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
      $or: [
        { paymentMethod: "Cash on Delivery" },
        { paymentMethod: "Razorpay", paymentStatus: "Paid" },
        { paymentMethod: { $exists: false } } // Legacy support if any
      ]
    })
      .populate("restaurant", "name")
      .populate("items.menuId", "name image price")
      .sort({
        createdAt: -1,
      });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADMIN: Get all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [
        { paymentMethod: "Cash on Delivery" },
        { paymentMethod: "Razorpay", paymentStatus: "Paid" },
        { paymentMethod: { $exists: false } } // Legacy support if any
      ]
    })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADMIN / RESTAURANT: Update order status generically (Accept, Reject, Preparing, Ready)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    // Restrict updates to either Admin (if role exists) or the specific Restaurant owner
    if (order.restaurant && order.restaurant.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Process cancellations
    if (status === "Cancelled" && order.paymentStatus === "Paid") {
      // Logic for refund could go here 
    }

    // Free delivery agent if marked as Delivered
    if (status === "Delivered" && order.deliveryAgent?.agentId) {
      await DeliveryAgent.findByIdAndUpdate(order.deliveryAgent.agentId, { status: "Available" });
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// USER: Create Razorpay order for food delivery
export const createRazorpayOrderFood = async (req, res) => {
  try {
    const orderDoc = await Order.findById(req.params.id);

    if (!orderDoc) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (orderDoc.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (orderDoc.paymentStatus === "Paid") {
      return res.status(400).json({ message: "Payment already completed" });
    }
    // The orderDoc.totalAmount already includes the delivery fee and discount from the frontend
    const amountInPaise = Math.round(orderDoc.totalAmount * 100);

    const rzpOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_food_${orderDoc._id}`,
      notes: {
        orderId: orderDoc._id.toString(),
      },
    });

    orderDoc.razorpayOrderId = rzpOrder.id;
    await orderDoc.save();

    const restaurant = await User.findById(orderDoc.restaurant).select("name upiId");

    res.json({
      orderId: rzpOrder.id,
      amount: amountInPaise,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID,
      restaurantName: restaurant?.name || "Khamma Ghani",
      restaurantUpi: restaurant?.upiId || "",
    });
  } catch (error) {
    console.error("Razorpay food order error:", error);
    res.status(500).json({ message: error.message });
  }
};

// USER: Verify Razorpay payment and mark food order as paid
export const verifyPaymentFood = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    const orderDoc = await Order.findById(req.params.id);
    if (!orderDoc) {
      return res.status(404).json({ message: "Order not found" });
    }

    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();

    orderDoc.paymentStatus = "Paid";
    orderDoc.paymentMethod = "Razorpay";
    orderDoc.paymentId = razorpay_payment_id;
    orderDoc.receiptId = `KG-FOOD-${timestamp}-${random}`;
    orderDoc.razorpayOrderId = razorpay_order_id;
    orderDoc.paidAt = new Date();

    const updated = await orderDoc.save();

    res.json({
      message: "Payment successful!",
      order: updated,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ message: error.message });
  }
};

// RESTAURANT: Confirm an order (Placed → Confirmed)
export const confirmOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.restaurant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (order.status !== "Placed") {
      return res.status(400).json({ message: "Order can only be confirmed from Placed status" });
    }

    order.status = "Confirmed";
    const updated = await order.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// RESTAURANT: Assign delivery agent to order (Confirmed → Assigned)

export const assignDeliveryAgent = async (req, res) => {
  try {
    const { agentId } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.restaurant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (order.status !== "Confirmed" && order.status !== "Ready") {
      return res.status(400).json({ message: "Order must be Confirmed or Ready before assigning agent" });
    }

    const agent = await DeliveryAgent.findById(agentId);
    if (!agent) return res.status(404).json({ message: "Delivery agent not found" });

    if (agent.restaurant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Agent does not belong to this restaurant" });
    }

    // Set agent info on order
    order.deliveryAgent = {
      agentId: agent._id,
      name: agent.name,
      phone: agent.phone,
      vehicleType: agent.vehicleType,
      vehicleNumber: agent.vehicleNumber,
    };
    order.status = "Assigned";
    order.agentStatus = "assigned";
    await order.save();

    // Link order to agent, but keep agent Available until they formally "Accept" it in their portal
    agent.currentOrderId = order._id;
    await agent.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// USER: Cancel order with refund logic
export const cancelOrderUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    // Ensure only the owner can cancel
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Cancellation Policy Check
    // Can only cancel if status is Placed, Confirmed, or Preparing
    const allowedStatuses = ["Placed", "Confirmed", "Preparing"];
    if (!allowedStatuses.includes(order.status)) {
      return res.status(400).json({
        message: `Order cannot be cancelled. Current status: ${order.status}`
      });
    }

    const currentTime = new Date();
    const orderTime = new Date(order.createdAt);
    const diffInMinutes = (currentTime - orderTime) / (1000 * 60);

    let refundAmount = 0;
    let cancellationFee = 0;

    if (order.paymentStatus === "Paid") {
      if (diffInMinutes <= 2) {
        // 100% refund
        refundAmount = order.totalAmount;
        cancellationFee = 0;
      } else {
        // 10% fee, 90% refund
        cancellationFee = Math.round(order.totalAmount * 0.1);
        refundAmount = order.totalAmount - cancellationFee;
      }

      // Trigger Razorpay Refund if applicable
      if (order.paymentMethod === "Razorpay" && order.paymentId) {
        try {
          // Razorpay .refund() is often part of the payments collection
          await razorpay.payments.refund(order.paymentId, {
            amount: Math.round(refundAmount * 100), // in paise
            notes: {
              reason: reason || "User cancelled",
              orderId: order._id.toString()
            }
          });
          console.log(`Razorpay refund triggered: ₹${refundAmount} for order ${order._id}`);
        } catch (rzpErr) {
          console.error("Razorpay Refund Error:", rzpErr);
          // We still mark it cancelled but log the error
        }
      }
    }

    order.status = "Cancelled";
    order.cancellationReason = reason || "User cancelled";
    order.cancellationTime = currentTime;
    order.refundAmount = refundAmount;
    order.cancellationFee = cancellationFee;

    await order.save();

    res.json({
      message: "Order cancelled successfully",
      refundAmount,
      cancellationFee,
      order
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
