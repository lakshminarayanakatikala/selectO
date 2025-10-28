const express = require("express");
const userRoutes = express.Router();
const { registerUser, loginUser } = require("../controllers/userController");
const userAuthMiddleware = require("../middleware/userAuthMiddleware");
const { toggleFavorite, getFavorites } = require("../controllers/favoriteController");

// Register
userRoutes.post("/register", registerUser);

// Login
userRoutes.post("/login", loginUser);

// Toggle a favorite
userRoutes.post("/toggle", userAuthMiddleware, toggleFavorite);

// Get all favorites
userRoutes.get("/", userAuthMiddleware,getFavorites );


module.exports = userRoutes;
