import express from "express";
import { validateCoupon, createCoupon, getAllCoupons, deleteCoupon } from "../controllers/couponController.js";
import { protect, admin } from "../Middleware/authMiddleware.js";

const router = express.Router();

// User: Validate coupon
router.post("/validate", protect, validateCoupon);

// Admin: Management
router.get("/", protect, admin, getAllCoupons);
router.post("/create", protect, admin, createCoupon);
router.delete("/:id", protect, admin, deleteCoupon);

export default router;

