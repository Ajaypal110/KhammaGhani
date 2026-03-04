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

    const parsedVariations = (req.body.variations ? JSON.parse(req.body.variations) : []).filter(v => v.name && v.name.trim() !== "" && v.price);
    const parsedAddOns = (req.body.addOns ? JSON.parse(req.body.addOns) : []).filter(a => a.name && a.name.trim() !== "" && a.price);
    const finalPrice = req.body.price || (parsedVariations.length > 0 ? parsedVariations[0].price : 0);

    const menu = await Menu.create({
      name: req.body.name,
      price: finalPrice,
      category: req.body.category,
      contents: req.body.contents,
      description: req.body.description,
      isVeg: req.body.isVeg === "true" || req.body.isVeg === true,
      image: imageUrl,
      dietaryType: req.body.dietaryType || "Veg",
      discountPrice: req.body.discountPrice,
      isGstIncluded: req.body.isGstIncluded === "true" || req.body.isGstIncluded === true,
      spiceLevel: req.body.spiceLevel || "None",
      inStock: req.body.inStock === "true" || req.body.inStock === true,
      preparationTime: req.body.preparationTime,
      availableDays: req.body.availableDays ? JSON.parse(req.body.availableDays) : [],
      availableTime: req.body.availableTime ? JSON.parse(req.body.availableTime) : {},
      tags: req.body.tags ? JSON.parse(req.body.tags) : [],
      addOns: parsedAddOns,
      variations: parsedVariations,
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

    const { name, price, category, contents, description, dietaryType, discountPrice, spiceLevel, preparationTime } = req.body;

    menu.name = name || menu.name;
    menu.category = category || menu.category;
    menu.contents = contents || menu.contents;
    menu.description = description || menu.description;
    menu.dietaryType = dietaryType || menu.dietaryType;
    menu.discountPrice = discountPrice || menu.discountPrice;
    menu.spiceLevel = spiceLevel || menu.spiceLevel;
    menu.preparationTime = preparationTime || menu.preparationTime;

    if (req.body.isVeg !== undefined) {
      menu.isVeg = req.body.isVeg === "true" || req.body.isVeg === true;
    }
    if (req.body.isGstIncluded !== undefined) {
      menu.isGstIncluded = req.body.isGstIncluded === "true" || req.body.isGstIncluded === true;
    }
    if (req.body.inStock !== undefined) {
      menu.inStock = req.body.inStock === "true" || req.body.inStock === true;
    }

    // Handle Variations and Add-ons
    if (req.body.variations !== undefined) {
      const parsedV = JSON.parse(req.body.variations).filter(v => v.name && v.name.trim() !== "" && v.price);
      menu.variations = parsedV;
      // Sync price if variations were provided
      if (parsedV.length > 0) {
        if (!price || Number(price) === menu.price) {
          menu.price = parsedV[0].price;
        } else {
          menu.price = price;
        }
      } else {
        menu.price = price || menu.price;
      }
    } else {
      menu.price = price || menu.price;
    }

    if (req.body.addOns !== undefined) {
      menu.addOns = JSON.parse(req.body.addOns).filter(a => a.name && a.name.trim() !== "" && a.price);
    }
    if (req.body.tags !== undefined) menu.tags = JSON.parse(req.body.tags);
    if (req.body.availableDays !== undefined) menu.availableDays = JSON.parse(req.body.availableDays);
    if (req.body.availableTime !== undefined) menu.availableTime = JSON.parse(req.body.availableTime);

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