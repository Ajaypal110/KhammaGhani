import Coupon from "../Models/Coupon.js";

// Validate coupon code
export const validateCoupon = async (req, res) => {
    try {
        const { code, subtotal } = req.body;

        if (!code) {
            return res.status(400).json({ message: "Coupon code is required" });
        }

        const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

        if (!coupon) {
            return res.status(404).json({ message: "Invalid or expired coupon code" });
        }

        // Check expiry
        if (new Date() > new Date(coupon.expiryDate)) {
            return res.status(400).json({ message: "Coupon has expired" });
        }

        // Check min order amount
        if (subtotal < coupon.minOrderAmount) {
            return res.status(400).json({
                message: `Min order amount for this coupon is ₹${coupon.minOrderAmount}`
            });
        }

        // Special Case: ADMINOFF - Makes the total cart amount ₹1
        if (coupon.code === "ADMINOFF") {
            return res.json({
                message: "Admin Coupon Applied! Final total will be ₹1.",
                code: coupon.code,
                discount: 0, // Frontend will handle the ₹1 override
                isTotalOverride: true,
                overrideAmount: 1
            });
        }

        // Calculate discount
        let discount = 0;
        if (coupon.discountType === "percentage") {
            discount = Math.round((subtotal * coupon.discountValue) / 100);
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                discount = coupon.maxDiscount;
            }
        } else {
            discount = coupon.discountValue;
        }

        res.json({
            message: "Coupon applied successfully!",
            code: coupon.code,
            discount
        });

    } catch (error) {
        console.error("Coupon validation error:", error);
        res.status(500).json({ message: "Error validating coupon" });
    }
};

// Admin: Get all coupons
export const getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: Create coupon
export const createCoupon = async (req, res) => {
    try {
        const coupon = new Coupon(req.body);
        await coupon.save();
        res.status(201).json(coupon);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Admin: Delete coupon
export const deleteCoupon = async (req, res) => {
    try {
        await Coupon.findByIdAndDelete(req.params.id);
        res.json({ message: "Coupon deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

