import express from "express";
import { restaurantLogin } from "../controllers/restaurantAuthController.js";

const router = express.Router();

router.post("/login", restaurantLogin);

export default router;
