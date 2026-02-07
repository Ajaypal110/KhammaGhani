import express from "express";
import {
  registerUser,
  loginUser,
  sendResetOtp,
  resetPassword,
  googleLogin,
} from "../controllers/authcontroller.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.post("/send-reset-otp", sendResetOtp);
router.post("/reset-password", resetPassword);

router.post("/google-login", googleLogin);

export default router;
