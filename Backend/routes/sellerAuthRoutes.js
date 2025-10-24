const express = require("express");

const sellerAuthRoutes = express.Router();
const {
  registerSeller,
  loginSeller,
} = require("../controllers/sellerAuthController");

// Register new seller
sellerAuthRoutes.post("/register", registerSeller);

// Login with email OR phone
sellerAuthRoutes.post("/login", loginSeller);

module.exports = sellerAuthRoutes;
