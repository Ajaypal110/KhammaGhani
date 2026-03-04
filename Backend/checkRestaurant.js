import "dotenv/config";
import mongoose from "mongoose";
import User from "./Models/User.js";

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const restaurants = await User.find({ role: "restaurant" });
        console.log("Found restaurants:", restaurants.length);
        restaurants.forEach(r => {
            console.log(`ID: ${r._id}, Name: ${r.name}, Address: ${r.address || "MISSING"}`);
        });
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.disconnect();
    }
};

run();
