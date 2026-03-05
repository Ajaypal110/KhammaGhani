import express from "express";
import {
    getDashboardStats,
    getAllOrdersAdmin,
    getAllRestaurantsAdmin,
    getAllUsersAdmin,
    getAllAgentsAdmin,
    getAllMenuAdmin,
    getAnalyticsAdmin,
    getRestaurantDetailAdmin,
    getAllBookingsAdmin,
    updateBookingStatusAdmin
} from "../controllers/adminController.js";
import { protect, admin } from "../Middleware/authMiddleware.js";

const router = express.Router();

// All routes are protected and admin-only
router.use(protect);
router.use(admin);

router.get("/stats", getDashboardStats);
router.get("/orders", getAllOrdersAdmin);
router.get("/restaurants", getAllRestaurantsAdmin);
router.get("/users", getAllUsersAdmin);
router.get("/agents", getAllAgentsAdmin);
router.get("/menu", getAllMenuAdmin);
router.get("/analytics", getAnalyticsAdmin);
router.get("/restaurants/:id", getRestaurantDetailAdmin);
router.get("/bookings", getAllBookingsAdmin);
router.patch("/bookings/:id", updateBookingStatusAdmin);

export default router;
