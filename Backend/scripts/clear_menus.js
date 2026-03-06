import mongoose from "mongoose";
import Menu from "../Models/Menu.js";
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

const clearMenus = async () => {
    try {
        await connectDB();

        console.log("🧹 Clearing all existing menu items from the database...");
        const result = await Menu.deleteMany({});
        console.log(`✅ Deleted ${result.deletedCount} menu items.`);

        console.log("\n🎉 Database cleanup completed successfully!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Cleanup failed:", err);
        process.exit(1);
    }
};

clearMenus();
