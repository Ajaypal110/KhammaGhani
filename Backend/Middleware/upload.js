import multer from "multer";

// Use memory storage so file buffer is available for Cloudinary upload
const storage = multer.memoryStorage();

export const upload = multer({ storage });

export default storage;