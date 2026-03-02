import bcrypt from "bcryptjs";
import User from "../Models/user.js";
import Otp from "../Models/Otp.js";
import generateToken from "../utils/generateToken.js";
import otpGenerator from "otp-generator";
import { sendEmailOtp } from "../utils/sendEmailOtp.js";

/* =========================
   REGISTER (AUTO LOGIN)
========================= */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    // ✅ Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Enter a valid email" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      phone,
      provider: "password",
      role: "user",
      isEmailVerified: true,
    });

    // ✅ AUTO LOGIN AFTER REGISTER
    res.status(201).json({
      _id: user._id,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   LOGIN
========================= */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user || !user.password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({
      _id: user._id,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   SEND RESET OTP (BLOCK RESTAURANT)
========================= */
export const sendResetOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔒 BLOCK RESTAURANT
    if (user.role === "restaurant") {
      return res.status(403).json({
        message: "Password reset not allowed for restaurant accounts",
      });
    }

    const otp = otpGenerator.generate(6, {
      digits: true,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    await Otp.deleteMany({ email });

    await Otp.create({
      email,
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    await sendEmailOtp(email, otp);

    res.json({ message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   RESET PASSWORD (BLOCK RESTAURANT)
========================= */
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields required" });
    }

    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    // 🔒 BLOCK RESTAURANT
    if (user.role === "restaurant") {
      return res.status(403).json({
        message: "Password reset not allowed for restaurant accounts",
      });
    }

    const record = await Otp.findOne({ email, otp });
    if (!record || record.expiresAt < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    await Otp.deleteMany({ email });

    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   GOOGLE LOGIN (BLOCK RESTAURANT)
========================= */
export const googleLogin = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    let user = await User.findOne({ email });

    // 🔒 BLOCK RESTAURANT GOOGLE LOGIN
    if (user && user.role === "restaurant") {
      return res.status(403).json({
        message: "Google login not allowed for restaurant accounts",
      });
    }

    if (!user) {
      user = await User.create({
        name,
        email,
        provider: "google",
        role: "user",
        isEmailVerified: true,
      });
    } else {
      // Same email → same account
      if (user.provider === "password") {
        user.provider = "google";
        user.isEmailVerified = true;
        await user.save();
      }
    }

    res.json({
      _id: user._id,
      token: generateToken(user._id),
    });
  } catch {
    res.status(500).json({ message: "Google login failed" });
  }
};
export const restaurantLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const restaurant = await User.findOne({
      email,
      role: "restaurant",
    }).select("+password");

    if (!restaurant) {
      return res.status(401).json({ message: "Not a restaurant account" });
    }

    const isMatch = await bcrypt.compare(password, restaurant.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      _id: restaurant._id,
      role: restaurant.role,
      token: generateToken(restaurant._id, restaurant.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      provider: user.provider,
      role: user.role || "user",
      profileImage: user.profileImage,
      dob: user.dob,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
