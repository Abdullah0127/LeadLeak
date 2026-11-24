import mongoose from "mongoose";

// MEMBERSHIP MODEL
const membershipSchema = new mongoose.Schema(
  {
    // User who belongs to this organization
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Organization the user belongs to
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    // User's role inside this organization
    role: {
      type: String,
      enum: ["owner", "admin", "member"],
      default: "member",
    },

    // Membership status
    status: {
      type: String,
      enum: ["active", "pending", "suspended"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
);

// A user can have only one membership per organization
membershipSchema.index({ user: 1, organization: 1 }, { unique: true });

const Membership = mongoose.model("Membership", membershipSchema);

export default Membership;
