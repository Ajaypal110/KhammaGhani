// routes/orderRoutes.js
import express from "express";
import protect from "../Middleware/authmiddleware.js";
import { placeOrder } from "../controllers/orderController.js";

const router = express.Router();

router.post("/order", protect, placeOrder);

export default router;
