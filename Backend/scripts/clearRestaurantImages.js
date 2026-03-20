import mongoose from "mongoose";
import User from "../Models/User.js";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const clearRestaurantImages = async () => {
    try {
        await connectDB();

        console.log("🧹 Clearing all restaurant images...");
        const result = await User.updateMany(
            { role: "restaurant" },
            { $set: { restaurantImages: [] } }
        );

        console.log(`✅ Cleared images for ${result.modifiedCount} restaurants.`);
        process.exit(0);
    } catch (err) {
        console.error("❌ Cleanup failed:", err);
        process.exit(1);
    }
};

clearRestaurantImages();
