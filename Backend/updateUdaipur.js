import mongoose from 'mongoose';
import User from './Models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const updateUdaipur = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const res = await User.findOneAndUpdate(
            { name: /Udaipur/i, role: 'restaurant' },
            { address: "Fateh Sagar Lake, Udaipur, Rajasthan, India" },
            { new: true }
        );

        if (res) {
            console.log(`✅ Updated ${res.name} with address: ${res.address}`);
        } else {
            console.log("❌ Udaipur restaurant not found");
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

updateUdaipur();
