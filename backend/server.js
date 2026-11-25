import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pathToFileURL } from "node:url";
import { rateLimit } from "express-rate-limit";
import net from "node:net";
import connectDB from "./config/db.js";
import { isPublicIP } from "./utils/websiteSecurity.js";

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

const configuredOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const isProduction =
  !["development", "test"].includes(
    String(process.env.NODE_ENV || "").toLowerCase(),
  );

if (isProduction && configuredOrigins.length === 0) {
  throw new Error("Production startup requires CLIENT_URL.");
}

const developmentOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
];

const allowedOrigins = [];

for (const origin of [
  ...configuredOrigins,
  ...(isProduction ? [] : developmentOrigins),
]) {
  let parsed;
  try {
    parsed = new URL(origin);
  } catch {
    throw new Error("Invalid configured CORS origin.");
  }

  if (
    !["http:", "https:"].includes(parsed.protocol) ||
    parsed.origin !== origin ||
    parsed.pathname !== "/" ||
    origin.includes("?") ||
    origin.includes("#") ||
    parsed.search ||
    parsed.hash ||
    parsed.username ||
    parsed.password
  ) {
    throw new Error("Invalid configured CORS origin.");
  }

  const hostname = parsed.hostname
    .replace(/^\[|\]$/g, "")
    .toLowerCase()
    .replace(/\.$/, "");
  const ipVersion = net.isIP(hostname);
  const localHostname =
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    (ipVersion > 0 && !isPublicIP(hostname));

  if (isProduction && localHostname) {
    throw new Error("Localhost origins are not allowed in production.");
  }

  allowedOrigins.push(parsed.origin);
}

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
  if (isProduction) {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains",
    );
  }
  next();
});

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
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

app.use(
  "/api/verification",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  }),
);
app.use(
  "/api/monitoring",
  rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 60,
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

// Return a controlled error for rejected CORS origins.
app.use((error, req, res, next) => {
  if (error?.message === "Origin is not allowed by CORS.") {
    return res.status(403).json({
      success: false,
      message: "Origin is not allowed.",
    });
  }

  return next(error);
});

// ==========================================
// START SERVER
// ==========================================

const PORT = process.env.PORT || 5000;

export { app };

export const startServer = async () => {
  await connectDB();
  startMonitoringScheduler();

  return app.listen(PORT, () => {
    console.log(`LeadLeak server running on http://localhost:${PORT}`);
  });
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startServer().catch((error) => {
    console.error("Server startup failed:", error.message);
    process.exitCode = 1;
  });
}
