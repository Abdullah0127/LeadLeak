import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { rateLimit } from "express-rate-limit";
import connectDB from "./config/db.js";

// ==========================================
// ROUTE IMPORTS
// ==========================================

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import organizationRoutes from "./routes/organizationRoutes.js";
import websiteRoutes from "./routes/websiteRoutes.js";
import verificationRoutes from "./routes/verificationRoutes.js";
import monitoringRoutes from "./routes/monitoringRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";
import contactFormMonitorRoutes from "./routes/contactFormMonitorRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";

// ==========================================
// SERVICES
// ==========================================

import { startMonitoringScheduler } from "./services/monitoringScheduler.js";

dotenv.config();

const app = express();
app.disable("x-powered-by");

// ==========================================
// MIDDLEWARE
// ==========================================

const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Origin is not allowed by CORS."));
    },
  }),
);
app.use(express.json({ limit: "1mb" }));

app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  }),
);

// ==========================================
// API ROUTES
// ==========================================

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/websites", websiteRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/monitoring", monitoringRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/contact-form-monitors", contactFormMonitorRoutes);

// Website analytics
app.use("/api/analytics", analyticsRoutes);

// ==========================================
// HEALTH CHECK
// ==========================================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "LeadLeak backend is running!",
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// START SERVER
// ==========================================

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  // Start automatic website monitoring after database connection.
  startMonitoringScheduler();

  app.listen(PORT, () => {
    console.log(`LeadLeak server running on http://localhost:${PORT}`);
  });
});
