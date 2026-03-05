// Models/Order.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    items: [
      {
        menuId: { type: mongoose.Schema.Types.ObjectId, ref: "Menu" },
        qty: Number,
        variant: String,
      },
    ],
    totalAmount: Number,
    itemsPrice: Number, // Food Total
    discount: { type: Number, default: 0 },
    gst: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    platformFee: { type: Number, default: 5 }, // Added Platform Fee
    codFee: { type: Number, default: 0 },
    deliveryAddress: { type: String },
    deliveryDistance: { type: Number }, // Renamed from distance for clarity
    status: { type: String, default: "Placed" },
    paymentStatus: { type: String, default: "Pending" },
    paymentMethod: { type: String, default: "Razorpay" },
    cashCollected: { type: Boolean, default: false },
    paymentId: String,
    receiptId: String,
    razorpayOrderId: String,
    paidAt: Date,
    isReviewed: { type: Boolean, default: false },
    deliveryAgent: {
      agentId: { type: mongoose.Schema.Types.ObjectId, ref: "DeliveryAgent" },
      name: String,
      phone: String,
      vehicleType: String,
      vehicleNumber: String,
    },
    agentStatus: {
      type: String,
      enum: ["unassigned", "assigned", "accepted", "picked", "delivered"],
      default: "unassigned",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
