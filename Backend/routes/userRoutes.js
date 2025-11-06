const express = require("express");
const userRoutes = express.Router();
const {
  registerUser,
  getNearbySellers,
  sendOtp,
  verifyOtp,
} = require("../controllers/userController");
const {getSingleProduct, getAllCategories, getProductsByCategory, getAllProducts, getExclusiveOffers, getBachelorFilterProducts } = require("../controllers/productController")
const userAuthMiddleware = require("../middleware/userAuthMiddleware");
const { toggleFavorite, getFavorites } = require("../controllers/favoriteController");
const { getUserProfile, updateUserProfile } = require("../controllers/userProfileController");

// // Register
// userRoutes.post("/register", registerUser);

// // Login
// userRoutes.post("/login", loginUser);

userRoutes.post("/send-otp", sendOtp);
userRoutes.post("/verify-otp", verifyOtp);
userRoutes.post("/register", registerUser);

// Toggle a favorite
userRoutes.post("/toggle", userAuthMiddleware, toggleFavorite);

// Get all favorites
userRoutes.get("/", userAuthMiddleware,getFavorites);
userRoutes.get("/products/bachelor-filter", getBachelorFilterProducts);
userRoutes.get("/products/:id", userAuthMiddleware,getFavorites);
userRoutes.get("/singleproduct/:id", getSingleProduct);
// Get all products
userRoutes.get("/products", getAllProducts);
userRoutes.get("/products/offers/exclusive", getExclusiveOffers);

// get near by sellers 
userRoutes.use("/nearbyseller", getNearbySellers);


userRoutes.get("/categories", getAllCategories);
userRoutes.get("/category/:category", getProductsByCategory);

//user profile routes

userRoutes.get("/profile", userAuthMiddleware, getUserProfile);
// Edit user profile (name, email)
userRoutes.put("/profile", userAuthMiddleware, updateUserProfile);



module.exports = userRoutes;
