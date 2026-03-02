import Order from "../Models/Order.js";

// USER: Place order
export const placeOrder = async (req, res) => {
  try {
    const { items, totalAmount, deliveryFee, deliveryAddress, distance, restaurantId } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    const order = await Order.create({
      user: req.user._id,
      restaurant: restaurantId,
      items,
      totalAmount,
      deliveryFee: deliveryFee || 0,
      deliveryAddress,
      distance,
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// USER: Get my orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
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

import razorpay from "../config/razorpay.js";
import crypto from "crypto";
import User from "../Models/User.js";

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

    const amountInPaise = Math.round((orderDoc.totalAmount + (orderDoc.deliveryFee || 0)) * 100);

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
