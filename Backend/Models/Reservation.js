import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true, // YYYY-MM-DD
    },
    timeFrom: {
      type: String,
      required: true, // HH:mm
    },
    timeTo: {
      type: String,
      required: true, // HH:mm
    },
    guests: {
      type: Number,
      required: true,
    },
    tableNo: {
      type: Number,
      required: true,
    },
    specialRequests: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled"],
      default: "Pending",
    },

    // ============ PAYMENT FIELDS ============
    bookingAmount: {
      type: Number,
      default: 0, // Amount in INR
    },
    paymentStatus: {
      type: String,
      enum: ["Unpaid", "Paid"],
      default: "Unpaid",
    },
    paymentMethod: {
      type: String,
      enum: ["None", "UPI", "Card", "Net Banking"],
      default: "None",
    },
    paymentId: {
      type: String, // Unique payment transaction ID
      default: "",
    },
    receiptId: {
      type: String, // Unique receipt ID for display
      default: "",
    },
    paidAt: {
      type: Date,
    },
    razorpayOrderId: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Reservation = mongoose.model("Reservation", reservationSchema);
export default Reservation;
