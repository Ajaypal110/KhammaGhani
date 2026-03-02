import express from "express";
import protect from "../Middleware/authmiddleware.js";
import { upload } from "../Middleware/upload.js";
import cloudinary from "../config/cloudinary.js";
import User from "../Models/user.js";

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

export default router;
