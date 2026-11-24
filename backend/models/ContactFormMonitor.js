import mongoose from "mongoose";

// ==========================================
// CONTACT FORM MONITOR MODEL
// ==========================================

const contactFormMonitorSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    website: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Website",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    formUrl: {
      type: String,
      required: true,
      trim: true,
    },

    formType: {
      type: String,
      enum: ["elementor", "contact_form_7", "custom"],
      default: "custom",
    },

    testFields: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    successIndicator: {
      type: String,
      trim: true,
      default: "",
    },

    isMonitoringEnabled: {
      type: Boolean,
      default: false,
    },

    lastCheckedAt: {
      type: Date,
      default: null,
    },

    lastStatus: {
      type: String,
      enum: ["unknown", "working", "failed"],
      default: "unknown",
    },

    lastResponseTime: {
      type: Number,
      default: null,
    },

    lastError: {
      type: String,
      default: null,
    },

    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },

    archivedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// ==========================================
// DATABASE INDEXES
// ==========================================

contactFormMonitorSchema.index({
  organization: 1,
  website: 1,
});

contactFormMonitorSchema.index({
  isMonitoringEnabled: 1,
  lastCheckedAt: 1,
});

// ==========================================
// MODEL
// ==========================================

const ContactFormMonitor = mongoose.model(
  "ContactFormMonitor",
  contactFormMonitorSchema,
);

export default ContactFormMonitor;
