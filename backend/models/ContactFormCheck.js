import mongoose from "mongoose";

// ==========================================
// CONTACT FORM CHECK HISTORY MODEL
// ==========================================

const contactFormCheckSchema = new mongoose.Schema(
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

    contactFormMonitor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ContactFormMonitor",
      required: true,
    },

    status: {
      type: String,
      enum: ["working", "failed"],
      required: true,
    },

    responseTime: {
      type: Number,
      default: null,
    },

    httpStatus: {
      type: Number,
      default: null,
    },

    successMessage: {
      type: String,
      default: "",
    },

    error: {
      type: String,
      default: null,
    },

    testedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

// ==========================================
// DATABASE INDEXES
// ==========================================

contactFormCheckSchema.index({
  contactFormMonitor: 1,
  testedAt: -1,
});

contactFormCheckSchema.index({
  organization: 1,
  testedAt: -1,
});

// ==========================================
// MODEL
// ==========================================

const ContactFormCheck = mongoose.model(
  "ContactFormCheck",
  contactFormCheckSchema,
);

export default ContactFormCheck;
