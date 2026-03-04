import mongoose from "mongoose";

const deliveryAgentSchema = new mongoose.Schema(
    {
        restaurant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        agentId: { type: String, required: true, unique: true }, // NEW: Custom login ID
        name: { type: String, required: true },
        phone: { type: String, required: true },
        password: { type: String, required: true, select: false },
        vehicleType: {
            type: String,
            enum: ["Bike", "Scooter"],
            default: "Bike",
        },
        vehicleNumber: { type: String, required: true },
        status: {
            type: String,
            enum: ["Available", "Busy", "Offline"],
            default: "Offline",
        },
        currentOrderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            default: null,
        },
    },
    { timestamps: true }
);

export default mongoose.model("DeliveryAgent", deliveryAgentSchema);
