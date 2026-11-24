import express from "express";

import {
  createWebsite,
  getWebsites,
  getWebsite,
  updateWebsite,
  toggleWebsiteMonitoring,
  deleteWebsite,
} from "../controllers/websiteController.js";

import protect from "../middleware/authMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";

import {
  createWebsiteSchema,
  updateWebsiteSchema,
} from "../utils/websiteValidation.js";

const router = express.Router();

// CREATE WEBSITE
router.post("/", protect, validateRequest(createWebsiteSchema), createWebsite);

// GET ALL WEBSITES IN A WORKSPACE
router.get("/organization/:organizationId", protect, getWebsites);

// ENABLE OR DISABLE WEBSITE MONITORING
router.patch("/:id/monitoring", protect, toggleWebsiteMonitoring);

// GET SINGLE WEBSITE
router.get("/:id", protect, getWebsite);

// UPDATE WEBSITE
router.patch(
  "/:id",
  protect,
  validateRequest(updateWebsiteSchema),
  updateWebsite,
);

// DELETE WEBSITE
router.delete("/:id", protect, deleteWebsite);

export default router;
