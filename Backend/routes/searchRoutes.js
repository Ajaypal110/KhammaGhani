import express from "express";
import { searchDish } from "../controllers/searchController.js";

const router = express.Router();

router.get("/search", searchDish);

export default router;
