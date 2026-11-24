import express from "express";

import protect from "../middleware/authMiddleware.js";

import {
  runWebsiteCheck,
  getWebsiteMonitoringHistory,
} from "../controllers/monitoringController.js";

const router = express.Router();

// MANUALLY CHECK WEBSITE STATUS
router.post("/:id/check", protect, runWebsiteCheck);

// GET WEBSITE MONITORING HISTORY
router.get("/:id/history", protect, getWebsiteMonitoringHistory);

export default router;
