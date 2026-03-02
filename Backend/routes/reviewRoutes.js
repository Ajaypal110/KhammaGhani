import express from "express";
import { protect } from "../Middleware/authMiddleware.js";
import Review from "../Models/Review.js";
import Order from "../Models/Order.js";
import Reservation from "../Models/Reservation.js";
import Restaurant from "../Models/Restaurant.js";

const router = express.Router();

// 1. Post a Review (Only Verified Buyers)
router.post("/", protect, async (req, res) => {
    try {
        const { targetType, targetId, rating, comment, sourceModel, sourceId } = req.body;

        if (!targetType || !targetId || !rating || !sourceModel || !sourceId) {
            return res.status(400).json({ message: "All review fields are required." });
        }

        // Check if the source order/reservation actually belongs to this user
        let sourceDoc;
        if (sourceModel === "Order") {
            sourceDoc = await Order.findOne({ _id: sourceId, user: req.user._id });
            if (!sourceDoc) return res.status(403).json({ message: "Order not found or not yours." });
            if (sourceDoc.status !== "Delivered") return res.status(403).json({ message: "Order must be Delivered to review." });
        } else if (sourceModel === "Reservation") {
            sourceDoc = await Reservation.findOne({ _id: sourceId, user: req.user._id });
            if (!sourceDoc) return res.status(403).json({ message: "Reservation not found or not yours." });
            if (sourceDoc.status !== "Confirmed") return res.status(403).json({ message: "Reservation must be Confirmed to review." });
        }

        // Check if already reviewed (could also depend if they try to review same thing from same source)
        const existingReview = await Review.findOne({ user: req.user._id, sourceModel, sourceId, targetType, targetId });
        if (existingReview) {
            return res.status(400).json({ message: "You have already reviewed this item from this order/booking." });
        }

        const review = new Review({
            user: req.user._id,
            targetType,
            targetId,
            rating: Number(rating),
            comment,
            sourceModel,
            sourceId,
        });

        await review.save();

        // After success, Recalculate Average Rating (Optional, but good for Restaurants)
        if (targetType === "Restaurant") {
            const allReviews = await Review.find({ targetType: "Restaurant", targetId });
            const avgRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;

            await Restaurant.findByIdAndUpdate(targetId, {
                rating: Number(avgRating.toFixed(1))
            });
        }

        // Mark the source as reviewed IF AND ONLY IF all expected targets are reviewed
        // A simplified approach for MVP: Once they hit submit on the modal, we mark the entire Order/Reservation as reviewed.
        if (sourceModel === "Order") {
            await Order.findByIdAndUpdate(sourceId, { isReviewed: true });
        } else if (sourceModel === "Reservation") {
            await Reservation.findByIdAndUpdate(sourceId, { isReviewed: true });
        }

        res.status(201).json({ message: "Review submitted successfully!", review });
    } catch (error) {
        console.error("Error posting review:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// 2. Fetch Reviews for a Target
router.get("/:targetType/:targetId", async (req, res) => {
    try {
        const { targetType, targetId } = req.params;
        const limit = parseInt(req.query.limit) || 20;

        const reviews = await Review.find({ targetType, targetId })
            .populate("user", "name profileImage") // Fetch the user's name and image
            .sort({ createdAt: -1 })
            .limit(limit);

        // Calculate aggregated stats
        const totalReviews = await Review.countDocuments({ targetType, targetId });
        const allReviews = await Review.find({ targetType, targetId }).select("rating");
        const avgRating = allReviews.length > 0 ? (allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length).toFixed(1) : 0;

        res.json({
            reviews,
            stats: {
                totalReviews,
                avgRating: Number(avgRating)
            }
        });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

export default router;
