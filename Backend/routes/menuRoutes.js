import express from "express";
import Menu from "../Models/Menu.js";
import protect from "../Middleware/authMiddleware.js";
import { upload } from "../Middleware/upload.js";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

// Helper: upload buffer to Cloudinary using base64 (more reliable than streams)
const uploadToCloudinary = async (file, folder) => {
  const b64 = file.buffer.toString("base64");
  const dataURI = `data:${file.mimetype};base64,${b64}`;
  const result = await cloudinary.uploader.upload(dataURI, {
    folder,
    resource_type: "image",
  });
  return result;
};

/* ===============================
   GET ALL MENU ITEMS (Public - Home)
================================ */
router.get("/", async (req, res) => {
  try {
    const menu = await Menu.find().populate("restaurant", "name");
    res.json(menu);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ===============================
   ADD MENU (Restaurant Only)
================================ */
router.post("/", protect, upload.single("image"), async (req, res) => {
  try {
    if (req.user.role !== "restaurant") {
      return res.status(403).json({ message: "Only restaurants can add menu items" });
    }

    let imageUrl = req.body.image || "";

    if (req.file) {
      const result = await uploadToCloudinary(req.file, "khammaghani/menu");
      imageUrl = result.secure_url;
    }

    const menu = await Menu.create({
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      image: imageUrl,
      restaurant: req.user._id,
    });

    res.status(201).json(menu);
  } catch (err) {
    console.error("Menu add error:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ===============================
   GET MY MENU (Dashboard)
================================ */
router.get("/my-menu", protect, async (req, res) => {
  try {
    if (req.user.role !== "restaurant") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const menu = await Menu.find({ restaurant: req.user._id });
    res.json(menu);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ===============================
   UPDATE MENU
================================ */
router.put("/:id", protect, upload.single("image"), async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id);

    if (!menu)
      return res.status(404).json({ message: "Menu not found" });

    if (menu.restaurant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { name, price, description } = req.body;

    menu.name = name || menu.name;
    menu.price = price || menu.price;
    menu.description = description || menu.description;

    if (req.file) {
      const result = await uploadToCloudinary(req.file, "khammaghani/menu");
      menu.image = result.secure_url;
    }

    await menu.save();
    res.json(menu);
  } catch (err) {
    console.error("Menu update error:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ===============================
   DELETE MENU
================================ */
router.delete("/:id", protect, async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id);

    if (!menu)
      return res.status(404).json({ message: "Menu not found" });

    if (menu.restaurant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Delete image from Cloudinary if it exists
    if (menu.image && menu.image.includes("cloudinary")) {
      try {
        const parts = menu.image.split("/");
        const publicId = "khammaghani/menu/" + parts[parts.length - 1].split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (e) {
        console.log("Cloudinary delete error (non-critical):", e.message);
      }
    }

    await menu.deleteOne();
    res.json({ message: "Menu deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ===============================
   GET MENU BY RESTAURANT ID (User View)
================================ */
router.get("/restaurant/:restaurantId", async (req, res) => {
  try {
    const menu = await Menu.find({ restaurant: req.params.restaurantId });
    res.json(menu);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET SINGLE DISH
router.get("/item/:id", async (req, res) => {
  try {
    const dish = await Menu.findById(req.params.id);
    res.json(dish);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;