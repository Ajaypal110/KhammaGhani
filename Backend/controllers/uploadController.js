import cloudinary from "../config/cloudinary.js";
import User from "../Models/user.js";

export const uploadProfileImage = async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);

    const user = await User.findById(req.user.id);
    user.profileImage = result.secure_url;
    await user.save();

    res.json({ image: result.secure_url });
  } catch (err) {
    res.status(500).json({ message: "Upload failed" });
  }
};
