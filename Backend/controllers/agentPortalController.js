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
            .populate("user", "name phone") // We will manually trim this below if not accepted
            .lean();

        // CUSTOMER PRIVACY FILTER
        // If agent hasn't clicked "Accept" yet, hide the customer's exact details
        const secureOrders = activeOrders.map(order => {
            if (order.agentStatus === "assigned") {
                return {
                    ...order,
                    deliveryAddress: order.deliveryAddress.split(",").slice(-2).join(",").trim(), // Show only city/pincode approx
                    user: { name: "Customer Details Hidden" }
                };
            }
            return order; // If accepted/picked, show everything
        });

        res.json({
            agent,
            activeOrders: secureOrders
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

        // Strict Sequence Checking
        if (action === "accept") {
            if (order.agentStatus !== "assigned") return res.status(400).json({ message: "Can only accept assigned orders" });
            order.agentStatus = "accepted";
            agent.status = "Busy";
            agent.currentOrderId = order._id;
        }
        else if (action === "pick") {
            if (order.agentStatus !== "accepted") return res.status(400).json({ message: "Can only pick accepted orders" });
            order.agentStatus = "picked";
            order.status = "Out for Delivery"; // Sync frontend overarching status
        }
        else if (action === "deliver") {
            if (order.agentStatus !== "picked") return res.status(400).json({ message: "Can only deliver picked orders" });
            order.agentStatus = "delivered";
            order.status = "Delivered";

            agent.status = "Available";
            agent.currentOrderId = null;
        }
        else {
            return res.status(400).json({ message: "Invalid action" });
        }

        await order.save();
        await agent.save();

        res.json({ message: `Order marked as ${order.agentStatus}`, order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
