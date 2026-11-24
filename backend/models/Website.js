import mongoose from "mongoose";
import crypto from "node:crypto";

// WEBSITE MODEL
const websiteSchema = new mongoose.Schema(
  {
    // Website name
    name: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    // Website URL
    url: {
      type: String,
      required: [true, "Website URL is required"],
      trim: true,
    },

    // Organization that owns this website
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    // User who added the website
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Website verification status
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "failed"],
      default: "pending",
    },

    // Website verification token
    verificationToken: {
      type: String,
      default: () => crypto.randomBytes(32).toString("hex"),
      select: false,
    },

    // Website verification method
    verificationMethod: {
      type: String,
      enum: ["meta_tag", "html_file"],
      default: "meta_tag",
    },

    // Date when website was verified
    verifiedAt: {
      type: Date,
      default: null,
    },

    // Website monitoring status
    isMonitoringEnabled: {
      type: Boolean,
      default: false,
    },

    // Last monitoring check
    lastCheckedAt: {
      type: Date,
      default: null,
    },

    // Last known website status
    lastStatus: {
      type: String,
      enum: ["up", "down", "unknown"],
      default: "unknown",
    },

    // Consecutive failed observations used before confirming an outage.
    consecutiveFailures: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Confirmed monitoring state, separate from transient failures.
    confirmedStatus: {
      type: String,
      enum: ["up", "down", "unknown"],
      default: "unknown",
    },
  },
  {
    timestamps: true,
  },
);

// Prevent duplicate website entries in the same organization
websiteSchema.index({ organization: 1, url: 1 }, { unique: true });

const Website = mongoose.model("Website", websiteSchema);

export default Website;
