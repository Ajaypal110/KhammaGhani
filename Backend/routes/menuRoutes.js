import express from "express";
import {
  createMenuItem,
  getMenuItems,
  updateMenuItem,
  deleteMenuItem,
} from "../controllers/menuControllers.js";
import { protect, admin } from "../Middleware/authmiddleware.js";

const router = express.Router();

router.get("/", getMenuItems);
router.post("/", protect, admin, createMenuItem);
router.put("/:id", protect, admin, updateMenuItem);
router.delete("/:id", protect, admin, deleteMenuItem);

export default router;
