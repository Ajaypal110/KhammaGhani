import express from "express";
import protect from "../Middleware/authMiddleware.js";
import Menu from "../Models/Menu.js";
import Order from "../Models/Order.js";

const router = express.Router();

/* GET MY MENU */
router.get("/my-menu", protect, async (req, res) => {
  try {
    const menu = await Menu.find({ restaurant: req.user._id });
    res.json(menu);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ADD MENU */
router.post("/add-menu", protect, async (req, res) => {
  try {
    const { name, price } = req.body;

    const item = await Menu.create({
      name,
      price,
      restaurant: req.user._id,
    });

    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* GET MY ORDERS */
router.get("/orders", protect, async (req, res) => {
  try {
    const orders = await Order.find({
      restaurant: req.user._id,
    });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;