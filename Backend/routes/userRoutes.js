import express from "express";
import protect from "../Middleware/authMiddleware.js";
import { upload } from "../Middleware/upload.js";
import cloudinary from "../config/cloudinary.js";
import User from "../Models/User.js";

const router = express.Router();

// Only logged-in users
router.get("/profile", protect, (req, res) => {
  res.json(req.user);
});

// Upload profile image to Cloudinary
router.post("/upload-profile-image", protect, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image file required" });
    }

    // Upload buffer to Cloudinary using base64
    const b64 = req.file.buffer.toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "khammaghani/profiles",
      resource_type: "image",
    });

    const user = await User.findById(req.user._id);
    user.profileImage = result.secure_url;
    await user.save();

    res.json({ image: result.secure_url });
  } catch (err) {
    console.error("Profile image upload error:", err);
    res.status(500).json({ message: "Upload failed" });
  }
});

// ============ ADDRESS CRUD ============

// GET all addresses
router.get("/addresses", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.addresses || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADD new address
router.post("/addresses", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { fullName, phone, house, area, city, pincode, type } = req.body;

    if (!fullName || !phone || !house || !area || !city || !pincode) {
      return res.status(400).json({ message: "All address fields are required" });
    }

    const newAddr = {
      fullName, phone, house, area, city, pincode,
      type: type || "Home",
      label: type || "Home",
      address: `${house}, ${area}, ${city} - ${pincode}`,
    };

    user.addresses.push(newAddr);
    await user.save();
    res.status(201).json(user.addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE address
router.put("/addresses/:addrId", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const addr = user.addresses.id(req.params.addrId);
    if (!addr) return res.status(404).json({ message: "Address not found" });

    const { fullName, phone, house, area, city, pincode, type } = req.body;
    if (fullName) addr.fullName = fullName;
    if (phone) addr.phone = phone;
    if (house) addr.house = house;
    if (area) addr.area = area;
    if (city) addr.city = city;
    if (pincode) addr.pincode = pincode;
    if (type) { addr.type = type; addr.label = type; }
    addr.address = `${addr.house}, ${addr.area}, ${addr.city} - ${addr.pincode}`;

    await user.save();
    res.json(user.addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE address
router.delete("/addresses/:addrId", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter(a => a._id.toString() !== req.params.addrId);
    await user.save();
    res.json(user.addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
