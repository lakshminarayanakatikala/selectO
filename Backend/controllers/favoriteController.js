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

    const productIdStr = productId.toString();

    const index = user.favorites.findIndex(
      (fav) => fav.toString() === productIdStr
    );

    // const index = user.favorites.indexOf(productId);

    if (index === -1) {
      // Add favorite
      user.favorites.push(productIdStr);
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

//  Get all favorite all products without saparation
// exports.getFavorites = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const user = await User.findById(userId).populate("favorites");

//     if (!user) {
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found" });
//     }

//     res.status(200).json({ success: true, favorites: user.favorites });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user with populated favorite products + seller info
    const user = await User.findById(userId)
      .populate({
        path: "favorites",
        populate: {
          path: "sellerId",
          select: "shopName shopImage address phone location"
        }
      })
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const favorites = user.favorites;

    if (!favorites.length) {
      return res.status(200).json({
        success: true,
        groupedFavorites: [],
      });
    }

    // Group by sellerId
    const sellerMap = new Map();

    favorites.forEach((product) => {
      const seller = product.sellerId;
      if (!seller) return; // in case seller deleted

      const sellerId = seller._id.toString();

      if (!sellerMap.has(sellerId)) {
        sellerMap.set(sellerId, {
          sellerId: seller._id,
          shopName: seller.shopName,
          shopImage: seller.shopImage,
          address: seller.address,
          phone: seller.phone,
          location: seller.location,
          products: [],
        });
      }

      sellerMap.get(sellerId).products.push({
        _id: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        category: product.category,
        description: product.description,
      });
    });

    // Convert map to array
    const groupedFavorites = Array.from(sellerMap.values());

    res.status(200).json({
      success: true,
      totalSellers: groupedFavorites.length,
      groupedFavorites,
    });

  } catch (error) {
    console.error("Favorite grouping error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


