// routes/orderRoutes.js
import express from "express";
import protect from "../Middleware/authMiddleware.js";
import {
    placeOrder,
    createRazorpayOrderFood,
    verifyPaymentFood,
    getMyOrders,
    getAllOrders,
    updateOrderStatus,
    confirmOrder,
    assignDeliveryAgent,
    markOrderDelivered,
    getDeliveryInfo
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/order", protect, placeOrder);
router.get("/myorders", protect, getMyOrders);
router.get("/allorders", protect, getAllOrders);
router.get("/delivery-info", protect, getDeliveryInfo);
router.put("/:id/status", protect, updateOrderStatus);

// Payment routes
router.post("/razorpay-order/:id", protect, createRazorpayOrderFood);
router.post("/verify-payment/:id", protect, verifyPaymentFood);

// Delivery agent assignment routes
router.put("/:id/confirm", protect, confirmOrder);
router.put("/:id/assign-agent", protect, assignDeliveryAgent);
router.put("/:id/delivered", protect, markOrderDelivered);

export default router;
