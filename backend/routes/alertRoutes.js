import express from "express";

import protect from "../middleware/authMiddleware.js";
import { getOrganizationAlerts } from "../controllers/alertController.js";

const router = express.Router();

// GET ORGANIZATION ALERTS
router.get("/organization/:organizationId", protect, getOrganizationAlerts);

export default router;
