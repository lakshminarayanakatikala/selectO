const express = require("express");
const userRoutes = express.Router();
const { registerUser, loginUser  } = require("../controllers/userController");
const {getSingleProduct, getAllCategories, getProductsByCategory, getAllProducts, getExclusiveOffers, getBachelorFilterProducts} = require("../controllers/productController")
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
userRoutes.get("/products/:id", userAuthMiddleware,getFavorites );
userRoutes.get("/singleproduct/:id", getSingleProduct);
// Get all products
userRoutes.get("/products", getAllProducts);
userRoutes.get("/products/offers/exclusive", getExclusiveOffers);


userRoutes.get("/categories", getAllCategories);
userRoutes.get("/category/:category", getProductsByCategory);
userRoutes.get("/products/bachelor-filter", getBachelorFilterProducts);



module.exports = userRoutes;
