import express from "express";
import protectAgent from "../Middleware/agentAuthMiddleware.js";
import {
    loginAgent,
    getAgentProfile,
    toggleStatus,
    updateOrderStatus
} from "../controllers/agentPortalController.js";

const router = express.Router();

router.post("/login", loginAgent);

// Protected Agent Routes
router.get("/me", protectAgent, getAgentProfile);
router.put("/status", protectAgent, toggleStatus);
router.put("/order/:id/status", protectAgent, updateOrderStatus);

export default router;
