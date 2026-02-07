import express from "express";

import {
  registerUser,
  loginUser,
  sendEmailOtpController,
  verifyOtpAndLogin,
} from "../controllers/authcontroller.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser)


router.post("/send-email-otp", sendEmailOtpController);


router.post("/verify-otp", verifyOtpAndLogin);

export default router;
