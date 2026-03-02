import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        targetType: {
            type: String,
            enum: ["Restaurant", "Menu"],
            required: true,
        },
        targetId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: "targetType", // dynamically refs either Restaurant or Menu collection
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
            default: 4,
        },
        comment: {
            type: String,
        },
        // Optional reference to the specific order or reservation this review came from
        sourceModel: {
            type: String,
            enum: ["Order", "Reservation"],
        },
        sourceId: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: "sourceModel",
        },
    },
    { timestamps: true }
);

export default mongoose.models.Review || mongoose.model("Review", reviewSchema);
