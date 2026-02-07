import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String, // mobile number (not verified)
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    provider: {
      type: String,
      default: "email",
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
