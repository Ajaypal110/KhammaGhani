import express from "express";
import {
  createReservation,
  getMyReservations,
  getRestaurantBookings,
  getAllReservations,
  updateReservationStatus,
  getBookedTables,
  cancelMyReservation,
  createRazorpayOrder,
  verifyPayment,
} from "../controllers/reservationController.js";
import { protect, admin } from "../Middleware/authMiddleware.js";

const router = express.Router();

// User routes
router.post("/", protect, createReservation);
router.get("/my", protect, getMyReservations);
router.put("/my/:id/cancel", protect, cancelMyReservation);

// Payment routes
router.post("/create-order/:id", protect, createRazorpayOrder);
router.post("/verify-payment/:id", protect, verifyPayment);

router.get("/booked-tables", getBookedTables);

// Restaurant routes
router.get("/restaurant-bookings", protect, getRestaurantBookings);

// Admin routes
router.get("/all", protect, admin, getAllReservations);
router.put("/:id/status", protect, updateReservationStatus);

export default router;
