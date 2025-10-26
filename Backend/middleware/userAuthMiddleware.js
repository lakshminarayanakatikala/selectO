const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");

const userAuthMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({
          success: false,
          message: "No token provided, authorization denied",
        });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user from token
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Attach user to request object
    req.user = user;

    // Continue to next route
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

module.exports = userAuthMiddleware;
