import express from "express";

import protect from "../middleware/authMiddleware.js";

import { getWebsiteUptime } from "../controllers/analyticsController.js";

// ==========================================
// ANALYTICS ROUTES
// ==========================================

const router = express.Router();

// Get website uptime analytics
router.get("/websites/:id/uptime", protect, getWebsiteUptime);

export default router;
