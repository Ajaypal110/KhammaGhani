import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,

    email: {
      type: String,
      required: true,
      unique: true,   // 🔥 MUST
      lowercase: true,
      trim: true,
    },


    password: {
      type: String,
      select: false, // 🔒 Hidden by default, use .select("+password") when needed
    },

    phone: String,
    profileImage: String,
    dob: String,

    provider: {
      type: String,
      default: "password",
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["user", "restaurant", "admin"],
      default: "user",
    },
    restaurantId: {
      type: String,
    },
    totalTables: {
      type: Number,
      default: 10,
    },
    restaurantImages: [
      {
        type: String
      }
    ],

    // ============ RESTAURANT PAYMENT SETTINGS ============
    bookingFee: {
      type: Number,
      default: 199, // Default booking fee in INR
    },
    upiId: {
      type: String,
      default: "", // Restaurant's UPI ID
    },
    paymentEnabled: {
      type: Boolean,
      default: false, // Whether payment is required for booking
    },

  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
