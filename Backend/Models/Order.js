// Models/Order.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
    },
    items: [
      {
        menuId: { type: mongoose.Schema.Types.ObjectId, ref: "Menu" },
        qty: Number,
      },
    ],
    totalAmount: Number,
    discount: { type: Number, default: 0 },
    gst: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    deliveryAddress: { type: String },
    distance: { type: Number },
    status: { type: String, default: "Placed" },
    paymentStatus: { type: String, default: "Pending" },
    paymentMethod: { type: String, default: "Razorpay" },
    razorpayOrderId: String,
    paymentId: String,
    receiptId: String,
    paidAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
