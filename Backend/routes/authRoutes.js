import express from "express";
import {
  registerUser,
  loginUser,
  sendResetOtp,
  resetPassword,
  googleLogin,
  restaurantLogin,
  unifiedLogin,
  getUserProfile,
  toggleFavorite,
} from "../controllers/authController.js";
import protect from "../Middleware/authMiddleware.js";
import User from "../Models/User.js";
import bcrypt from "bcryptjs";


const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.post("/send-reset-otp", sendResetOtp);
router.post("/reset-password", resetPassword);

router.post("/google-login", googleLogin);
router.post("/restaurant/login", restaurantLogin);
router.post("/unified-login", unifiedLogin);
router.get("/profile", protect, getUserProfile);
router.get("/me", protect, getUserProfile);
router.post("/favorites/:menuId", protect, toggleFavorite);

// UPDATE PROFILE (name, phone, dob)
router.put("/update-profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (req.body.name) user.name = req.body.name;
    if (req.body.phone) user.phone = req.body.phone;
    if (req.body.dob) user.dob = req.body.dob;
    if (req.body.addresses) user.addresses = req.body.addresses;

    await user.save();
    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CHANGE PASSWORD (logged-in user)
router.put("/change-password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Both current and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.provider !== "password") {
      return res.status(400).json({ message: "Password cannot be changed for Google login accounts" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
