const express = require("express");
const userRoutes = express.Router();
const { registerUser, loginUser } = require("../controllers/userController");

// Register
userRoutes.post("/register", registerUser);

// Login
userRoutes.post("/login", loginUser);

module.exports = userRoutes;
