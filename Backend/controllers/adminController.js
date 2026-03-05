import Order from "../Models/Order.js";
import User from "../Models/User.js";
import DeliveryAgent from "../Models/DeliveryAgent.js";
import Menu from "../Models/Menu.js";
import Reservation from "../Models/Reservation.js";
import mongoose from "mongoose";

// 1. GET DASHBOARD OVERVIEW STATS
export const getDashboardStats = async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const ordersToday = await Order.countDocuments({ createdAt: { $gte: startOfToday } });

        const totalUsers = await User.countDocuments({ role: "user" });
        const totalRestaurants = await User.countDocuments({ role: "restaurant" });
        const totalAgents = await DeliveryAgent.countDocuments();

        const activeOrders = await Order.countDocuments({
            status: { $in: ["Placed", "Confirmed", "Assigned", "Accepted", "Preparing", "Ready", "Picked"] }
        });

        // Revenue Breakdown
        const revenueData = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    onlinePaid: { $sum: { $cond: [{ $and: [{ $eq: ["$paymentStatus", "Paid"] }, { $eq: ["$paymentMethod", "Razorpay"] }] }, "$totalAmount", 0] } },
                    codDelivered: { $sum: { $cond: [{ $and: [{ $eq: ["$status", "Delivered"] }, { $eq: ["$paymentMethod", "COD"] }] }, "$totalAmount", 0] } },
                    pendingCod: { $sum: { $cond: [{ $and: [{ $ne: ["$status", "Delivered"] }, { $eq: ["$paymentMethod", "COD"] }] }, "$totalAmount", 0] } }
                }
            }
        ]);

        const bookingRevenue = await Reservation.aggregate([
            { $match: { paymentStatus: "Paid" } },
            { $group: { _id: null, total: { $sum: "$bookingAmount" } } }
        ]);

        const stats = revenueData[0] || { onlinePaid: 0, codDelivered: 0, pendingCod: 0 };
        const totalBookingRev = bookingRevenue.length > 0 ? bookingRevenue[0].total : 0;

        res.json({
            totalOrders,
            ordersToday,
            totalRevenue: stats.onlinePaid + stats.codDelivered + totalBookingRev,
            onlineRevenue: stats.onlinePaid,
            codRevenue: stats.codDelivered,
            pendingCod: stats.pendingCod,
            bookingRevenue: totalBookingRev,
            totalRestaurants,
            totalUsers,
            totalAgents,
            activeOrders
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. GET ORDERS FOR ADMIN (All)
export const getAllOrdersAdmin = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("user", "name email")
            .populate("restaurant", "name")
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. GET RESTAURANTS WITH FINANCIAL STATS
export const getAllRestaurantsAdmin = async (req, res) => {
    try {
        const restaurants = await User.aggregate([
            { $match: { role: "restaurant" } },
            {
                $lookup: {
                    from: "orders",
                    localField: "_id",
                    foreignField: "restaurant",
                    as: "orders"
                }
            },
            {
                $project: {
                    name: 1,
                    restaurantId: 1,
                    city: 1,
                    email: 1,
                    phone: 1,
                    status: 1,
                    totalOrders: { $size: "$orders" },
                    totalRevenue: {
                        $sum: {
                            $map: {
                                input: "$orders",
                                as: "order",
                                in: { $cond: [{ $or: [{ $and: [{ $eq: ["$$order.paymentStatus", "Paid"] }, { $eq: ["$$order.paymentMethod", "Razorpay"] }] }, { $and: [{ $eq: ["$$order.status", "Delivered"] }, { $eq: ["$$order.paymentMethod", "COD"] }] }] }, "$$order.totalAmount", 0] }
                            }
                        }
                    },
                    onlineRevenue: {
                        $sum: {
                            $map: {
                                input: "$orders",
                                as: "order",
                                in: { $cond: [{ $and: [{ $eq: ["$$order.paymentStatus", "Paid"] }, { $eq: ["$$order.paymentMethod", "Razorpay"] }] }, "$$order.totalAmount", 0] }
                            }
                        }
                    },
                    codRevenue: {
                        $sum: {
                            $map: {
                                input: "$orders",
                                as: "order",
                                in: { $cond: [{ $and: [{ $eq: ["$$order.status", "Delivered"] }, { $eq: ["$$order.paymentMethod", "COD"] }] }, "$$order.totalAmount", 0] }
                            }
                        }
                    }
                }
            }
        ]);
        res.json(restaurants);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 4. GET USERS (Standard Customers)
export const getAllUsersAdmin = async (req, res) => {
    try {
        const users = await User.find({ role: "user" }).select("-password");
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 5. GET DELIVERY AGENTS (All)
export const getAllAgentsAdmin = async (req, res) => {
    try {
        const agents = await DeliveryAgent.find().populate("restaurant", "name");
        res.json(agents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 6. GET ALL MENU ITEMS (Global)
export const getAllMenuAdmin = async (req, res) => {
    try {
        const menuItems = await Menu.find().populate("restaurant", "name");
        res.json(menuItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 7. GET ANALYTICS DATA (Charts)
export const getAnalyticsAdmin = async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const ordersTrends = await Order.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 },
                    revenue: { $sum: "$totalAmount" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        const statusDist = await Order.aggregate([
            { $group: { _id: "$status", value: { $sum: 1 } } }
        ]);

        const revenueByRes = await Order.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "restaurant",
                    foreignField: "_id",
                    as: "resInfo"
                }
            },
            { $unwind: "$resInfo" },
            {
                $group: {
                    _id: "$resInfo.name",
                    revenue: { $sum: "$totalAmount" },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { revenue: -1 } },
            { $limit: 10 }
        ]);

        const paymentDist = await Order.aggregate([
            { $group: { _id: "$paymentMethod", value: { $sum: "$totalAmount" } } }
        ]);

        res.json({ ordersTrends, statusDist, revenueByRes, paymentDist });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 8. GET RESTAURANT DETAIL WITH ORDERS
export const getRestaurantDetailAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const restaurant = await User.findById(id).select("-password");
        if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

        const orders = await Order.find({ restaurant: id })
            .populate("user", "name email")
            .sort({ createdAt: -1 });

        const stats = await Order.aggregate([
            { $match: { restaurant: new mongoose.Types.ObjectId(id) } },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: { $cond: [{ $or: [{ $and: [{ $eq: ["$paymentStatus", "Paid"] }, { $eq: ["$paymentMethod", "Razorpay"] }] }, { $and: [{ $eq: ["$status", "Delivered"] }, { $eq: ["$paymentMethod", "COD"] }] }] }, "$totalAmount", 0] } },
                    onlineRevenue: { $sum: { $cond: [{ $and: [{ $eq: ["$paymentStatus", "Paid"] }, { $eq: ["$paymentMethod", "Razorpay"] }] }, "$totalAmount", 0] } },
                    codRevenue: { $sum: { $cond: [{ $and: [{ $eq: ["$status", "Delivered"] }, { $eq: ["$paymentMethod", "COD"] }] }, "$totalAmount", 0] } }
                }
            }
        ]);

        res.json({ restaurant, orders, stats: stats[0] || {} });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 9. GET ALL BOOKINGS FOR ADMIN
export const getAllBookingsAdmin = async (req, res) => {
    try {
        const bookings = await Reservation.find()
            .populate("user", "name email")
            .populate("restaurant", "name")
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 10. UPDATE BOOKING STATUS
export const updateBookingStatusAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const booking = await Reservation.findByIdAndUpdate(id, { status }, { new: true });
        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
