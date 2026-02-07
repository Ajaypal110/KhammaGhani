import bcrypt from "bcryptjs";
import User from "../Models/user.js";
import Otp from "../Models/Otp.js";
import generateToken from "../utils/generateToken.js";
import otpGenerator from "otp-generator";
import { sendEmailOtp } from "../utils/sendEmailOtp.js";

/* =========================
   REGISTER (EMAIL + PASSWORD)
========================= */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone, // stored only
      provider: "password",
      isEmailVerified: true,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   LOGIN (EMAIL + PASSWORD)
========================= */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   SEND EMAIL OTP
========================= */
export const sendEmailOtpController = async (req, res) => {
  try {
    const { email, phone } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const otp = otpGenerator.generate(6, {
      digits: true,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    await Otp.create({
      email,
      phone, // mobile number saved
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    });

    await sendEmailOtp(email, otp);

    res.json({ message: "OTP sent to email" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   VERIFY EMAIL OTP + LOGIN
========================= */
export const verifyOtpAndLogin = async (req, res) => {
  try {
    const { email, phone, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP required" });
    }

    const record = await Otp.findOne({ email, otp });

    if (!record || record.expiresAt < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        phone,
        provider: "email-otp",
        isEmailVerified: true,
      });
    } else {
      if (phone && !user.phone) {
        user.phone = phone;
        await user.save();
      }
    }

    await Otp.deleteMany({ email });

    res.json({
      _id: user._id,
      email: user.email,
      phone: user.phone,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
