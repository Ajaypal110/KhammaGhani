import Order from "../Models/Order.js";
import User from "../Models/User.js";
import DeliveryAgent from "../Models/DeliveryAgent.js";
import razorpay from "../config/razorpay.js";
import crypto from "crypto";

// USER: Get delivery distance and fee based on coordinates or address strings
export const getDeliveryInfo = async (req, res) => {
  try {
    const { restaurantId, userLat, userLon, userAddress } = req.query;

    // 1. Get restaurant data
    const restaurant = await User.findById(restaurantId);
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

    let resLat = restaurant.lat;
    let resLon = restaurant.lon;
    let uLat = userLat ? parseFloat(userLat) : null;
    let uLon = userLon ? parseFloat(userLon) : null;

    // 2. If coordinates are missing, try geocoding (Backend Fallback)
    if (!resLat || !resLon) {
      const queries = [
        restaurant.address,
        `${restaurant.name}, ${restaurant.city || ""}`,
        restaurant.city
      ].filter(Boolean);

      for (const q of queries) {
        try {
          const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`);
          const data = await resp.json();
          if (data && data.length > 0) {
            resLat = parseFloat(data[0].lat);
            resLon = parseFloat(data[0].lon);
            console.log(`Geocoded Restaurant (${q}): ${resLat}, ${resLon}`);
            break;
          }
        } catch (err) { console.error("Geocode Error:", err); }
      }
    }

    if (!uLat || !uLon) {
      if (userAddress) {
        const queries = [
          userAddress,
          userAddress.split(",").slice(-2).join(","), // Try Area, City
          userAddress.split(",").pop() // Try just City
        ].filter(Boolean);

        for (const q of queries) {
          try {
            const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`);
            const data = await resp.json();
            if (data && data.length > 0) {
              uLat = parseFloat(data[0].lat);
              uLon = parseFloat(data[0].lon);
              console.log(`Geocoded User (${q}): ${uLat}, ${uLon}`);
              break;
            }
          } catch (err) { console.error("User Geocode Error:", err); }
        }
      }
    }

    if (!resLat || !resLon || !uLat || !uLon) {
      return res.status(400).json({
        available: false,
        message: "Could not locate addresses. Please use 'Use Current Location' or ensure your address is set correctly on the map."
      });
    }

    let deliveryDistance = null;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    // 3. CALL GOOGLE MAPS API IF KEY EXISTS
    if (apiKey) {
      try {
        const googleUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${resLat},${resLon}&destinations=${uLat},${uLon}&key=${apiKey}`;
        const response = await fetch(googleUrl);
        const data = await response.json();

        if (data.status === "OK" && data.rows[0].elements[0].status === "OK") {
          deliveryDistance = parseFloat((data.rows[0].elements[0].distance.value / 1000).toFixed(1));
        }
      } catch (err) {
        console.error("Google Maps API Error:", err.message);
      }
    }

    // 4. FALLBACK TO ROAD-APPROXIMATION (Haversine * 1.25)
    if (deliveryDistance === null) {
      const R = 6371;
      const dLat = (uLat - resLat) * (Math.PI / 180);
      const dLon = (uLon - resLon) * (Math.PI / 180);
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(resLat * (Math.PI / 180)) * Math.cos(uLat * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const straightDist = R * c;
      deliveryDistance = parseFloat((straightDist * 1.25).toFixed(1));
    }

    // 5. SLAB CALCULATION
    let deliveryFee = 0;
    let available = true;

    if (deliveryDistance > 20) {
      available = false;
    } else if (deliveryDistance <= 3) deliveryFee = 20;
    else if (deliveryDistance <= 6) deliveryFee = 40;
    else if (deliveryDistance <= 10) deliveryFee = 60;
    else if (deliveryDistance <= 15) deliveryFee = 80;
    else deliveryFee = 100;

    res.json({
      available,
      distance: deliveryDistance,
      deliveryFee: available ? deliveryFee : 0,
      platformFee: 5,
      message: available ? "" : "Delivery not available for this distance (>20km)"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// USER: Place order
export const placeOrder = async (req, res) => {
  try {
    const { items, itemsPrice, totalAmount, deliveryFee: clientFee, gst, discount, deliveryAddress, deliveryDistance, restaurantId } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    // RECALCULATE FOR SECURITY (Slab-based)
    let calculatedDeliveryFee = 0;
    if (deliveryDistance > 20) {
      return res.status(400).json({ message: "Delivery not available for this distance (>20km)" });
    }

    if (deliveryDistance <= 3) calculatedDeliveryFee = 20;
    else if (deliveryDistance <= 6) calculatedDeliveryFee = 40;
    else if (deliveryDistance <= 10) calculatedDeliveryFee = 60;
    else if (deliveryDistance <= 15) calculatedDeliveryFee = 80;
    else if (deliveryDistance <= 20) calculatedDeliveryFee = 100;

    const platformFee = 5;
    const subtotal = itemsPrice || 0;
    const finalTotal = Math.max(0, subtotal - (discount || 0) + (gst || 0) + calculatedDeliveryFee + platformFee);

    const order = await Order.create({
      user: req.user._id,
      restaurant: restaurantId,
      items,
      itemsPrice: subtotal,
      totalAmount: finalTotal,
      deliveryDistance,
      deliveryFee: calculatedDeliveryFee,
      platformFee,
      gst: gst || 0,
      discount: discount || 0,
      deliveryAddress,
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// USER: Get my orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
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
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADMIN: Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = req.body.status || order.status;
    const updated = await order.save();

    res.json(updated);
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

    if (order.status !== "Confirmed") {
      return res.status(400).json({ message: "Order must be Confirmed before assigning agent" });
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

// RESTAURANT: Mark order as delivered (Assigned → Delivered)
export const markOrderDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.restaurant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (order.status !== "Assigned") {
      return res.status(400).json({ message: "Order must be Assigned before marking delivered" });
    }

    order.status = "Delivered";
    await order.save();

    // Free the delivery agent
    if (order.deliveryAgent?.agentId) {
      await DeliveryAgent.findByIdAndUpdate(order.deliveryAgent.agentId, { status: "Available" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
