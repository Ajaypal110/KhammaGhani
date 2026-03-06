import DeliveryAgent from "../Models/DeliveryAgent.js";
import Order from "../Models/Order.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Generate JWT for Delivery Agent
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// @desc    Agent Login
// @route   POST /api/agent-portal/login
// @access  Public
export const loginAgent = async (req, res) => {
    const { agentId, password } = req.body;
    console.log("LOGIN ATTEMPT -> Agent ID:", agentId, "Password:", password);

    try {
        const agent = await DeliveryAgent.findOne({ agentId }).select("+password").populate("restaurant", "name address");
        console.log("Found Agent in DB?", agent ? "Yes" : "No");

        if (agent) {
            const isMatch = await bcrypt.compare(password, agent.password);
            console.log("Password Matches Hash?", isMatch);

            if (isMatch) {
                return res.json({
                    _id: agent._id,
                    agentId: agent.agentId,
                    name: agent.name,
                    phone: agent.phone,
                    status: agent.status,
                    restaurant: agent.restaurant,
                    token: generateToken(agent._id),
                });
            }
        }

        console.log("Sending 401 Invalid Credentials");
        res.status(401).json({ message: "Invalid Agent ID or password" });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Agent Profile & Active Orders
// @route   GET /api/agent-portal/me
// @access  Private (Agent)
export const getAgentProfile = async (req, res) => {
    try {
        const agent = await DeliveryAgent.findById(req.agent._id).populate("restaurant", "name address phone");

        // Find assigned active orders
        const activeOrders = await Order.find({
            "deliveryAgent.agentId": req.agent._id,
            agentStatus: { $in: ["assigned", "accepted", "picked"] }
        })
            .populate("restaurant", "name address phone")
            .populate("items.menuId", "name image price")
            .populate("user", "name phone") // We will manually trim this below if not accepted
            .lean();

        const secureOrders = activeOrders.map(order => {
            const currentStatus = order.agentStatus?.toLowerCase() || "";
            if (currentStatus === "assigned") {
                const addrParts = order.deliveryAddress?.split(",") || [];
                const blurredAddr = addrParts.length > 2
                    ? addrParts.slice(-2).join(", ").trim()
                    : order.deliveryAddress || "Location Details Restricted";

                return {
                    ...order,
                    deliveryAddress: blurredAddr,
                    user: { name: "Customer Details Hidden" }
                };
            }
            return order; // If accepted/picked, show everything
        });

        // Find completed orders within the last 24 hours
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const completedOrders = await Order.find({
            "deliveryAgent.agentId": req.agent._id,
            agentStatus: "delivered",
            updatedAt: { $gte: twentyFourHoursAgo }
        })
            .populate("restaurant", "name address phone")
            .populate("items.menuId", "name image price")
            .populate("user", "name phone")
            .lean()
            .sort({ updatedAt: -1 }); // Newest completed first

        // Calculate Earnings Summary (From completedOrders)
        const earningsSummary = completedOrders.reduce((acc, order) => {
            acc.todayEarnings += order.totalAmount;
            acc.todayDeliveries += 1;
            if (order.paymentMethod === "Cash on Delivery" || order.paymentMethod === "COD") {
                acc.cashCollected += order.totalAmount;
            } else {
                acc.onlinePayments += order.totalAmount;
            }
            return acc;
        }, { todayEarnings: 0, todayDeliveries: 0, cashCollected: 0, onlinePayments: 0 });

        res.json({
            agent,
            activeOrders: secureOrders,
            completedOrders,
            earningsSummary
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle Agent Status (Online / Offline)
// @route   PUT /api/agent-portal/status
// @access  Private (Agent)
export const toggleStatus = async (req, res) => {
    try {
        const agent = await DeliveryAgent.findById(req.agent._id);

        if (agent.status === "Busy") {
            return res.status(400).json({ message: "Cannot change status while delivering an active order." });
        }

        agent.status = agent.status === "Available" ? "Offline" : "Available";
        await agent.save();

        res.json({ status: agent.status, message: `You are now ${agent.status}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Order Status (Accept / Pick / Deliver)
// @route   PUT /api/agent-portal/order/:id/status
// @access  Private (Agent)
export const updateOrderStatus = async (req, res) => {
    const { action } = req.body; // "accept", "pick", "deliver"
    const orderId = req.params.id;

    try {
        const order = await Order.findOne({ _id: orderId, "deliveryAgent.agentId": req.agent._id });
        if (!order) return res.status(404).json({ message: "Order not found or not assigned to you" });

        const agent = await DeliveryAgent.findById(req.agent._id);

        // Strict Sequence Checking (Case Insensitive)
        const currentAgentStatus = order.agentStatus?.toLowerCase() || "";

        if (action === "accept") {
            if (currentAgentStatus !== "assigned") {
                console.log(`[AgentPortal] Rejecting accept for order ${orderId}: current status is ${currentAgentStatus}`);
                return res.status(400).json({ message: "Can only accept assigned orders" });
            }
            order.agentStatus = "accepted";
            agent.status = "Busy";
            agent.currentOrderId = order._id;
            console.log(`[AgentPortal] Order ${orderId} ACCEPTED by agent ${req.agent._id}`);
        }
        else if (action === "pick") {
            if (currentAgentStatus !== "accepted") return res.status(400).json({ message: "Can only pick accepted orders" });
            order.agentStatus = "picked";
            order.status = "Out for Delivery"; // Sync frontend overarching status
        }
        else if (action === "deliver") {
            if (currentAgentStatus !== "picked") return res.status(400).json({ message: "Can only deliver picked orders" });
            order.agentStatus = "delivered";
            order.status = "Delivered";

            agent.status = "Available";
            agent.currentOrderId = null;
        }
        else if (action === "collect_cod") {
            // New action block specific to Cash on Delivery
            if (currentAgentStatus !== "picked") return res.status(400).json({ message: "Can only collect cash for picked orders" });
            if (order.paymentMethod !== "Cash on Delivery") return res.status(400).json({ message: "Order is not COD" });

            order.agentStatus = "delivered";
            order.status = "Delivered";
            order.cashCollected = true;
            order.paymentStatus = "Paid"; // Mark as paid

            agent.status = "Available";
            agent.currentOrderId = null;
        }
        else {
            return res.status(400).json({ message: "Invalid action" });
        }

        await order.save();
        await agent.save();

        console.log(`[AgentPortal] Successfully updated order ${orderId} to ${order.agentStatus}`);
        res.json({ message: `Order marked as ${order.agentStatus}`, order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
