// controllers/favoriteController.js
const User = require("../models/UserModel");
const Product = require("../models/ProductModel");

// Toggle Favorite (add/remove)

exports.toggleFavorite = async (req, res) => {
  try {
    const userId = req.user._id; // from auth middleware
    const { productId } = req.body;

    const user = await User.findById(userId);
  
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const index = user.favorites.indexOf(productId);

    if (index === -1) {
      // Add favorite
      user.favorites.push(productId);
      await user.save();
      return res
        .status(200)
        .json({ success: true, message: "Added to favorites" });
    } else {
      // Remove favorite
      user.favorites.splice(index, 1);
      await user.save();
      return res
        .status(200)
        .json({ success: true, message: "Removed from favorites" });
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//  Get all favorite products
exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate("favorites");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

