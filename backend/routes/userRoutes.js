import express from "express";

import { getCurrentUser } from "../controllers/userController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// GET LOGGED-IN USER
router.get("/me", protect, getCurrentUser);

export default router;
