import express from "express";
import {
  placeOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/ordercontroller.js";
import { protect, admin } from "../Middleware/authmiddleware.js";

const router = express.Router();

// User routes
router.post("/", protect, placeOrder);
router.get("/my", protect, getMyOrders);

// Admin routes
router.get("/", protect, admin, getAllOrders);
router.put("/:id", protect, admin, updateOrderStatus);

export default router;
