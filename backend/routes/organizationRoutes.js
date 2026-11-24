
import express from "express";

import {
  createOrganization,
  getOrganizations,
  getOrganization,
  updateOrganization,
  deleteOrganization,
} from "../controllers/organizationController.js";

import protect from "../middleware/authMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";

import {
  createOrganizationSchema,
} from "../utils/organizationValidation.js";

const router = express.Router();

// CREATE ORGANIZATION
router.post(
  "/",
  protect,
  validateRequest(createOrganizationSchema),
  createOrganization
);

// GET ALL ORGANIZATIONS
router.get(
  "/",
  protect,
  getOrganizations
);

// GET SINGLE ORGANIZATION
router.get(
  "/:id",
  protect,
  getOrganization
);

// UPDATE ORGANIZATION
router.patch(
  "/:id",
  protect,
  validateRequest(createOrganizationSchema.partial()),
  updateOrganization
);

// DELETE ORGANIZATION
router.delete(
  "/:id",
  protect,
  deleteOrganization
);

export default router;
