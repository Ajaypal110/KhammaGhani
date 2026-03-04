import express from "express";
import protect from "../Middleware/authMiddleware.js";
import {
    getMyAgents,
    addAgent,
    updateAgent,
    deleteAgent,
} from "../controllers/deliveryAgentController.js";

const router = express.Router();

router.get("/my-agents", protect, getMyAgents);
router.post("/add-agent", protect, addAgent);
router.put("/agent/:id", protect, updateAgent);
router.delete("/agent/:id", protect, deleteAgent);

export default router;
