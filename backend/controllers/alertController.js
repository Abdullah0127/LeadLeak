import mongoose from "mongoose";

import Alert from "../models/Alert.js";
import Membership from "../models/Membership.js";

// ==========================================
// GET ORGANIZATION ALERTS
// ==========================================

export const getOrganizationAlerts = async (req, res) => {
  try {
    const { organizationId } = req.params;

    // Validate organization ID.
    if (!mongoose.isValidObjectId(organizationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid organization ID.",
      });
    }

    // Check active organization membership.
    const membership = await Membership.findOne({
      user: req.user._id,
      organization: organizationId,
      status: "active",
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this organization.",
      });
    }

    // Pagination.
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);

    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 20),
    );

    const skip = (page - 1) * limit;

    const filters = { organization: organizationId };

    if (["website_down", "website_recovered", "ssl_expiring"].includes(req.query.type)) {
      filters.type = req.query.type;
    }

    if (["pending", "sending", "sent", "failed"].includes(req.query.status)) {
      filters.status = req.query.status;
    }

    if (req.query.test === "true") {
      filters.title = {
        $regex: "(retry reliability test|controlled|simulated|test)",
        $options: "i",
      };
    }

    // Retrieve organization alerts.
    const [alerts, total] = await Promise.all([
      Alert.find(filters)
        .populate("website", "name url")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Alert.countDocuments(filters),
    ]);

    return res.status(200).json({
      success: true,
      alerts: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        records: alerts,
      },
    });
  } catch (error) {
    console.error("Get Organization Alerts Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve organization alerts.",
    });
  }
};
