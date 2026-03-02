// routes/orderRoutes.js
import express from "express";
import protect from "../Middleware/authMiddleware.js";
import {
    placeOrder,
    createRazorpayOrderFood,
    verifyPaymentFood,
    getMyOrders,
    getAllOrders,
    updateOrderStatus
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/order", protect, placeOrder);
router.get("/myorders", protect, getMyOrders);
router.get("/allorders", protect, getAllOrders);
router.put("/:id/status", protect, updateOrderStatus);

// Payment routes
router.post("/razorpay-order/:id", protect, createRazorpayOrderFood);
router.post("/verify-payment/:id", protect, verifyPaymentFood);

export default router;
