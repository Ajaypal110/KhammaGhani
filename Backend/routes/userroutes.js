import express from "express";
import { protect, admin } from "../Middleware/authmiddleware.js";

const router = express.Router();

// Only logged-in users
router.get("/profile", protect, (req, res) => {
  res.json(req.user);
});

// Only admin
router.get("/admin", protect, admin, (req, res) => {
  res.json({ message: "Welcome Admin" });
});

export default router;
