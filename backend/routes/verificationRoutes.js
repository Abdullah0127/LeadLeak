import express from "express";

import {
  startWebsiteVerification,
  verifyWebsite,
} from "../controllers/verificationController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// START WEBSITE VERIFICATION
router.post("/:id/start", protect, startWebsiteVerification);

// COMPLETE WEBSITE VERIFICATION
router.post("/:id/verify", protect, verifyWebsite);

export default router;
