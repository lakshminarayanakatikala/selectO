const express = require("express");

const sellerAuthRoutes = express.Router();
const {
  registerSeller,
  loginSeller,
  toggleOnlineStatus,
  getAllSellers,
} = require("../controllers/sellerAuthController");
const authMiddleware = require("../middleware/authMiddleware");

// Register new seller
sellerAuthRoutes.post("/register", registerSeller);

// Login with email OR phone
sellerAuthRoutes.post("/login", loginSeller);

//  related of seller status
sellerAuthRoutes.get("/", getAllSellers);
sellerAuthRoutes.post("/status",authMiddleware ,toggleOnlineStatus);

module.exports = sellerAuthRoutes;
