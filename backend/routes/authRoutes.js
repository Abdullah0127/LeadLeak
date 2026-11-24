import express from "express";
import { rateLimit } from "express-rate-limit";

import { registerUser, loginUser } from "../controllers/authController.js";

import validateRequest from "../middleware/validateRequest.js";

import { registerSchema, loginSchema } from "../utils/authValidation.js";

const router = express.Router();

// AUTHENTICATION RATE LIMITER
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // Maximum 10 requests
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please try again later.",
  },
});

// REGISTER ROUTE
router.post(
  "/register",
  authLimiter,
  validateRequest(registerSchema),
  registerUser,
);

// LOGIN ROUTE
router.post("/login", authLimiter, validateRequest(loginSchema), loginUser);

export default router;
