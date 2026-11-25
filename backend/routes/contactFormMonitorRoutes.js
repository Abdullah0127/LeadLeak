import express from "express";

import protect from "../middleware/authMiddleware.js";
import { runContactFormTest } from "../controllers/contactFormMonitorController.js";

import {
  createFormMonitor,
  getOrganizationFormMonitorsController,
  getFormMonitor,
  deleteFormMonitor,
} from "../controllers/contactFormMonitorController.js";

// ==========================================
// CONTACT FORM MONITOR ROUTES
// ==========================================

const router = express.Router();

// ==========================================
// CREATE FORM MONITOR
// ==========================================

router.post("/", protect, createFormMonitor);

// ==========================================
// GET ORGANIZATION FORM MONITORS
// ==========================================

router.get(
  "/organization/:organizationId",
  protect,
  getOrganizationFormMonitorsController,
);

// Compatibility route for clients that omit "/organization".
router.get(
  "/:organizationId",
  protect,
  getOrganizationFormMonitorsController,
);

// ==========================================
// GET SINGLE FORM MONITOR
// ==========================================

router.get("/:organizationId/:monitorId", protect, getFormMonitor);

// ==========================================
// DELETE FORM MONITOR
// ==========================================

router.delete("/:organizationId/:monitorId", protect, deleteFormMonitor);

// ==========================================
// MANUALLY TEST CONTACT FORM
// ==========================================

router.post("/:organizationId/:monitorId/test", protect, runContactFormTest);

export default router;
