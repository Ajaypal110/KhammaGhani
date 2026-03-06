import mongoose from "mongoose";
import dotenv from "dotenv";
import Coupon from "../Models/Coupon.js";
import connectDB from "../config/db.js";

dotenv.config();

const coupons = [
    {
        code: "FIRST10",
        discountType: "percentage",
        discountValue: 10,
        minOrderAmount: 0,
        maxDiscount: 500,
        expiryDate: new Date("2026-12-31"),
        isActive: true
    },
    {
        code: "GET100",
        discountType: "fixed",
        discountValue: 100,
        minOrderAmount: 1000,
        expiryDate: new Date("2026-12-31"),
        isActive: true
    },
    {
        code: "WELCOME",
        discountType: "percentage",
        discountValue: 20,
        minOrderAmount: 500,
        maxDiscount: 200,
        expiryDate: new Date("2026-12-31"),
        isActive: true
    },
    {
        code: "ADMINOFF",
        discountType: "fixed",
        discountValue: 0, // Logic handled via isTotalOverride
        minOrderAmount: 0,
        expiryDate: new Date("2026-12-31"),
        isActive: true
    }
];

const seedCoupons = async () => {
    try {
        await connectDB();
        await Coupon.deleteMany(); // Clear existing
        await Coupon.insertMany(coupons);
        console.log("Coupons seeded successfully!");
        process.exit();
    } catch (error) {
        console.error("Seeding error:", error);
        process.exit(1);
    }
};

seedCoupons();
