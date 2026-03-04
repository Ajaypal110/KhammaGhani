import jwt from "jsonwebtoken";
import DeliveryAgent from "../Models/DeliveryAgent.js";

const protectAgent = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];

            // Decode token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Find the agent
            req.agent = await DeliveryAgent.findById(decoded.id);

            if (!req.agent) {
                return res.status(401).json({ message: "Not authorized as an agent" });
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: "Not authorized, token failed" });
        }
    }

    if (!token) {
        res.status(401).json({ message: "Not authorized, no token" });
    }
};

export default protectAgent;
