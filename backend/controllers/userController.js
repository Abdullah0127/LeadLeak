import User from "../models/User.js";

// ========================================
// GET CURRENT LOGGED-IN USER
// ========================================
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "name email isActive createdAt",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get Current User Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve user information.",
    });
  }
};
