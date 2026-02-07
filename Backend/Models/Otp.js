import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: String,
    phone: String,
    otp: String,
    expiresAt: Date,
  },
  { timestamps: true }
);

const Otp = mongoose.model("Otp", otpSchema);
export default Otp;
