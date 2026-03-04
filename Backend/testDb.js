import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import DeliveryAgent from "./Models/DeliveryAgent.js";

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB via ESM");

        const agentId = "JAIPURAGT01";
        const newPassword = "123456";

        const agent = await DeliveryAgent.findOne({ agentId });
        if (!agent) {
            console.log("Agent not found.");
            return;
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        agent.password = hashedPassword;

        await agent.save();
        console.log(`✅ SUCCESS! Agent ${agentId} password has been forcibly reset to: ${newPassword}`);

    } catch (err) {
        console.error("Error:", err);
    } finally {
        mongoose.connection.close();
    }
};

run();
