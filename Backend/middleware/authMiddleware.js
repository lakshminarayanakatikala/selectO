const jwt = require("jsonwebtoken");
const Seller = require("../models/SellerModel");

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "No token provided, authorization denied" });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the seller in DB
    const seller = await Seller.findById(decoded.sellerId).select("-password");

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    // Check admin approval
    if (!seller.adminApproval) {
      return res
        .status(403)
        .json({ message: "Your account is pending admin approval" });
    }

    // Attach seller info to request
    req.seller = seller;

    // Continue to next middleware/controller
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(401).json({ message: "Token is invalid or expired" });
  }
};

module.exports = authMiddleware;
