
import mongoose from "mongoose";

// ORGANIZATION MODEL
const organizationSchema = new mongoose.Schema(
  {
    // Organization name
    name: {
      type: String,
      required: [true, "Organization name is required"],
      trim: true,
      maxlength: 100,
    },

    // Workspace type
    type: {
      type: String,
      required: true,
      enum: ["business", "developer", "agency"],
    },

    // User who created this organization
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Organization status
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Organization = mongoose.model(
  "Organization",
  organizationSchema
);

export default Organization;
