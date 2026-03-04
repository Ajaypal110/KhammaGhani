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
    address: String,
    lat: Number, // Restaurant Latitude
    lon: Number, // Restaurant Longitude
    profileImage: String,
    dob: String,

    provider: {
      type: String,
      default: "password",
    },

    addresses: [
      {
        fullName: String,
        phone: String,
        house: String,
        area: String,
        city: String,
        pincode: String,
        lat: Number, // Address Latitude
        lon: Number, // Address Longitude
        type: { type: String, enum: ["Home", "Work", "Office"], default: "Home" },
        label: { type: String, enum: ["Home", "Office", "Other"], default: "Home" },
        address: String,
      }
    ],

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
    // ============ USER FAVORITES ============
    favorites: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Menu" },
    ],

  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
