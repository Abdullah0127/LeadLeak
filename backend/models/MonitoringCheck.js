import mongoose from "mongoose";

// ==========================================
// MONITORING CHECK MODEL
// ==========================================

const monitoringCheckSchema = new mongoose.Schema(
  {
    website: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Website",
      required: true,
    },

    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    status: {
      type: String,
      enum: ["up", "down", "unknown"],
      required: true,
    },

    httpStatusCode: {
      type: Number,
      default: null,
    },

    responseTime: {
      type: Number,
      default: null,
    },

    sslStatus: {
      type: String,
      enum: ["valid", "invalid", "unknown"],
      default: "unknown",
    },

    sslExpiresAt: {
      type: Date,
      default: null,
    },

    sslError: {
      type: String,
      default: null,
    },

    errorMessage: {
      type: String,
      default: null,
    },

    checkedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

// ==========================================
// MONITORING HISTORY INDEX
// ==========================================

monitoringCheckSchema.index({ website: 1, checkedAt: -1 });

const MonitoringCheck = mongoose.model(
  "MonitoringCheck",
  monitoringCheckSchema,
);

export default MonitoringCheck;
