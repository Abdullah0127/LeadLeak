import mongoose from "mongoose";

import Organization from "../models/Organization.js";
import Membership from "../models/Membership.js";

// ========================================
// CREATE NEW ORGANIZATION / WORKSPACE
// ========================================
export const createOrganization = async (req, res) => {
  try {
    const { name, type } = req.body;

    // Create organization
    const organization = await Organization.create({
      name,
      type,
      owner: req.user._id,
    });

    // Create owner membership
    await Membership.create({
      user: req.user._id,
      organization: organization._id,
      role: "owner",
      status: "active",
    });

    return res.status(201).json({
      success: true,
      message: "Workspace created successfully!",
      organization,
    });
  } catch (error) {
    console.error("Create Organization Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to create workspace.",
    });
  }
};

// ========================================
// GET ALL ORGANIZATIONS OF LOGGED-IN USER
// ========================================
export const getOrganizations = async (req, res) => {
  try {
    const memberships = await Membership.find({
      user: req.user._id,
      status: "active",
    }).populate({
      path: "organization",
      match: { isActive: true },
    });

    const organizations = memberships
      .filter((membership) => membership.organization)
      .map((membership) => ({
        ...membership.organization.toObject(),
        role: membership.role,
      }));

    return res.status(200).json({
      success: true,
      count: organizations.length,
      organizations,
    });
  } catch (error) {
    console.error("Get Organizations Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve organizations.",
    });
  }
};

// ========================================
// GET SINGLE ORGANIZATION
// ========================================
export const getOrganization = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate organization ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid organization ID.",
      });
    }

    const membership = await Membership.findOne({
      user: req.user._id,
      organization: id,
      status: "active",
    }).populate({
      path: "organization",
      match: { isActive: true },
    });

    if (!membership || !membership.organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found or access denied.",
      });
    }

    return res.status(200).json({
      success: true,
      organization: {
        ...membership.organization.toObject(),
        role: membership.role,
      },
    });
  } catch (error) {
    console.error("Get Organization Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve organization.",
    });
  }
};

// ========================================
// UPDATE ORGANIZATION
// ========================================
export const updateOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type } = req.body;

    // Validate organization ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid organization ID.",
      });
    }

    // Find active membership
    const membership = await Membership.findOne({
      user: req.user._id,
      organization: id,
      status: "active",
    });

    if (!membership || membership.role !== "owner") {
      return res.status(403).json({
        success: false,
        message: "Only the workspace owner can update it.",
      });
    }

    // Find active organization
    const organization = await Organization.findOne({
      _id: id,
      isActive: true,
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found.",
      });
    }

    // Update provided fields
    if (name !== undefined) organization.name = name;
    if (type !== undefined) organization.type = type;

    await organization.save();

    return res.status(200).json({
      success: true,
      message: "Workspace updated successfully!",
      organization,
    });
  } catch (error) {
    console.error("Update Organization Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update workspace.",
    });
  }
};

// ========================================
// DELETE ORGANIZATION (SOFT DELETE)
// ========================================
export const deleteOrganization = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate organization ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid organization ID.",
      });
    }

    // Find active membership
    const membership = await Membership.findOne({
      user: req.user._id,
      organization: id,
      status: "active",
    });

    // Only owner can delete workspace
    if (!membership || membership.role !== "owner") {
      return res.status(403).json({
        success: false,
        message: "Only the workspace owner can delete it.",
      });
    }

    // Find active organization
    const organization = await Organization.findOne({
      _id: id,
      isActive: true,
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found.",
      });
    }

    // Deactivate organization
    organization.isActive = false;

    await organization.save();

    // Suspend all memberships
    await Membership.updateMany({ organization: id }, { status: "suspended" });

    return res.status(200).json({
      success: true,
      message: "Workspace deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Organization Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to delete workspace.",
    });
  }
};
