import DeliveryAgent from "../Models/DeliveryAgent.js";
import bcrypt from "bcryptjs";

// GET all agents for logged-in restaurant
export const getMyAgents = async (req, res) => {
    try {
        const agents = await DeliveryAgent.find({ restaurant: req.user._id });
        res.json(agents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ADD a new delivery agent (max 5)
export const addAgent = async (req, res) => {
    try {
        const count = await DeliveryAgent.countDocuments({ restaurant: req.user._id });
        if (count >= 5) {
            return res.status(400).json({ message: "Maximum 5 delivery agents allowed per restaurant" });
        }

        const { name, phone, password, agentId, vehicleType, vehicleNumber } = req.body;

        if (!name || !phone || !password || !agentId || !vehicleNumber) {
            return res.status(400).json({ message: "Name, phone, password, agent ID, and vehicle number are required" });
        }

        const existingAgent = await DeliveryAgent.findOne({ agentId });
        if (existingAgent) {
            return res.status(400).json({ message: "An agent with this ID already exists. Please choose a different ID." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const agent = await DeliveryAgent.create({
            restaurant: req.user._id,
            agentId,
            name,
            phone,
            password: hashedPassword,
            vehicleType: vehicleType || "Bike",
            vehicleNumber,
        });

        res.status(201).json(agent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE delivery agent
export const updateAgent = async (req, res) => {
    try {
        const agent = await DeliveryAgent.findById(req.params.id);

        if (!agent) {
            return res.status(404).json({ message: "Agent not found" });
        }
        if (agent.restaurant.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        const { name, phone, password, agentId, vehicleType, vehicleNumber, status } = req.body;
        if (name) agent.name = name;
        if (phone) agent.phone = phone;
        if (agentId) agent.agentId = agentId;
        if (vehicleType) agent.vehicleType = vehicleType;
        if (vehicleNumber) agent.vehicleNumber = vehicleNumber;
        if (status) agent.status = status;

        if (password) {
            agent.password = await bcrypt.hash(password, 10);
        }

        const updated = await agent.save();
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE delivery agent
export const deleteAgent = async (req, res) => {
    try {
        const agent = await DeliveryAgent.findById(req.params.id);

        if (!agent) {
            return res.status(404).json({ message: "Agent not found" });
        }
        if (agent.restaurant.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        await DeliveryAgent.findByIdAndDelete(req.params.id);
        res.json({ message: "Agent deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
