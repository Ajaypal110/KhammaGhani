import express from "express";
import mongoose from "mongoose";
import User from "../Models/User.js";
import protect from "../Middleware/authMiddleware.js";
import { upload } from "../Middleware/upload.js";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

// Helper: upload buffer to Cloudinary using base64
const uploadToCloudinary = async (file, folder) => {
  const b64 = file.buffer.toString("base64");
  const dataURI = `data:${file.mimetype};base64,${b64}`;
  const result = await cloudinary.uploader.upload(dataURI, {
    folder,
    resource_type: "image",
  });
  return result;
};

// Helper: extract Cloudinary public_id from URL
const getPublicId = (url, folder) => {
  try {
    const parts = url.split("/");
    const filename = parts[parts.length - 1].split(".")[0];
    return `${folder}/${filename}`;
  } catch {
    return null;
  }
};

/* =========================
   UPLOAD RESTAURANT IMAGE (File → Cloudinary)
========================= */
router.post("/upload-image", protect, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image file required" });
    }

    const restaurant = await User.findById(req.user._id);

    if (!restaurant || restaurant.role !== "restaurant") {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (restaurant.restaurantImages.length >= 10) {
      return res.status(400).json({ message: "Maximum 10 images allowed. Delete an image first." });
    }

    const result = await uploadToCloudinary(req.file, "khammaghani/restaurants");
    restaurant.restaurantImages.push(result.secure_url);
    await restaurant.save();

    res.json({ message: "Image uploaded successfully", images: restaurant.restaurantImages });
  } catch (error) {
    console.error("Restaurant image upload error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* =========================
   ADD RESTAURANT IMAGE (URL)
========================= */
router.post("/add-image", protect, async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: "Image URL required" });
    }

    const restaurant = await User.findById(req.user._id);

    if (!restaurant || restaurant.role !== "restaurant") {
      return res.status(403).json({ message: "Not authorized" });
    }

    restaurant.restaurantImages.push(imageUrl);
    await restaurant.save();

    res.json({ message: "Image added successfully", images: restaurant.restaurantImages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================
   DELETE RESTAURANT IMAGE
========================= */
router.post("/remove-image", protect, async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: "Image URL required" });
    }

    const restaurant = await User.findById(req.user._id);

    if (!restaurant || restaurant.role !== "restaurant") {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Delete from Cloudinary if it's a Cloudinary URL
    if (imageUrl.includes("cloudinary")) {
      const publicId = getPublicId(imageUrl, "khammaghani/restaurants");
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (e) {
          console.log("Cloudinary delete error:", e.message);
        }
      }
    }

    restaurant.restaurantImages = restaurant.restaurantImages.filter(
      (img) => img !== imageUrl
    );
    await restaurant.save();

    res.json({ message: "Image removed", images: restaurant.restaurantImages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================
   GET MY RESTAURANT IMAGES (dashboard)
   ⚠️ MUST be BEFORE /:id routes!
========================= */
router.get("/my/images", protect, async (req, res) => {
  try {
    const restaurant = await User.findById(req.user._id).select("restaurantImages");
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    res.json(restaurant.restaurantImages || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================
   GET MY RESTAURANT PROFILE (dashboard)
========================= */
router.get("/my/profile", protect, async (req, res) => {
  try {
    const restaurant = await User.findById(req.user._id).select("-password -__v");
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================
   UPDATE MY TOTAL TABLES
========================= */
router.put("/my/tables", protect, async (req, res) => {
  try {
    const { totalTables } = req.body;

    if (!totalTables || totalTables < 1 || totalTables > 100) {
      return res.status(400).json({ message: "Total tables must be between 1 and 100" });
    }

    const restaurant = await User.findById(req.user._id);
    if (!restaurant || restaurant.role !== "restaurant") {
      return res.status(403).json({ message: "Not authorized" });
    }

    restaurant.totalTables = totalTables;
    await restaurant.save();

    res.json({ message: "Tables updated", totalTables: restaurant.totalTables });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================
   UPDATE MY PAYMENT SETTINGS
========================= */
router.put("/my/payment-settings", protect, async (req, res) => {
  try {
    const { bookingFee, upiId, paymentEnabled } = req.body;

    const restaurant = await User.findById(req.user._id);
    if (!restaurant || restaurant.role !== "restaurant") {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (bookingFee !== undefined) restaurant.bookingFee = Number(bookingFee);
    if (upiId !== undefined) restaurant.upiId = upiId;
    if (paymentEnabled !== undefined) restaurant.paymentEnabled = paymentEnabled;

    await restaurant.save();

    res.json({
      message: "Payment settings updated",
      bookingFee: restaurant.bookingFee,
      upiId: restaurant.upiId,
      paymentEnabled: restaurant.paymentEnabled,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================
   UPDATE MY ADDRESS
========================= */
router.put("/my/address", protect, async (req, res) => {
  try {
    const { address, lat, lon } = req.body;

    const restaurant = await User.findById(req.user._id);
    if (!restaurant || restaurant.role !== "restaurant") {
      return res.status(403).json({ message: "Not authorized" });
    }

    restaurant.address = address;
    if (lat !== undefined) restaurant.lat = Number(lat);
    if (lon !== undefined) restaurant.lon = Number(lon);

    await restaurant.save();

    res.json({
      message: "Address and coordinates updated successfully",
      address: restaurant.address,
      lat: restaurant.lat,
      lon: restaurant.lon,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================
   GET ALL RESTAURANTS
========================= */
router.get("/", async (req, res) => {
  try {
    const restaurants = await User.find({ role: "restaurant" }).select("-password -__v");
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================
   GET SINGLE RESTAURANT
========================= */
router.get("/:id", async (req, res) => {
  try {
    const restaurant = await User.findById(req.params.id).select("-password -__v");
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================
   GET RESTAURANT IMAGES
========================= */
router.get("/:id/images", async (req, res) => {
  try {
    const restaurant = await User.findById(req.params.id).select("restaurantImages name");
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    res.json(restaurant.restaurantImages || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* =========================
   GET MY ANALYTICS (Dashboard)
========================= */
router.get("/my/analytics", protect, async (req, res) => {
  try {
    const restaurantId = req.user._id;

    // Fetch all orders for this restaurant (excluding cancelled)
    const orders = await mongoose.model("Order").find({
      restaurant: restaurantId,
      status: { $ne: "Cancelled" }
    }).populate("items.menuId", "name");

    const totalRevenue = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
    const totalOrders = orders.length;

    // Monthly Data (Current Month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyOrders = orders.filter(o => new Date(o.createdAt) >= startOfMonth);
    const monthlyRevenue = monthlyOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
    const monthlyOrdersCount = monthlyOrders.length;

    // Top Selling Items Calculation
    const itemMap = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const dishId = item.menuId?._id?.toString() || item.menuId?.toString() || "Unknown";
        const dishName = item.menuId?.name || "Unknown Item";

        if (!itemMap[dishId]) {
          itemMap[dishId] = { count: 0, name: dishName };
        }
        itemMap[dishId].count += (item.qty || 1);
      });
    });

    const topItems = Object.values(itemMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.json({
      totalRevenue,
      totalOrders,
      monthlyRevenue,
      monthlyOrdersCount,
      topItems,
      monthlyData: [], // Placeholder for chart data if needed later
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* =========================
   UPDATE MY PROFILE (General)
========================= */
router.put("/my/profile", protect, async (req, res) => {
  try {
    const { name, phone, profileImage } = req.body;
    const restaurant = await User.findById(req.user._id);

    if (!restaurant || restaurant.role !== "restaurant") {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (name) restaurant.name = name;
    if (phone) restaurant.phone = phone;
    if (profileImage) restaurant.profileImage = profileImage;

    await restaurant.save();
    res.json({ message: "Profile updated successfully", restaurant });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
