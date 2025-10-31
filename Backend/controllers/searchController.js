const Product = require("../models/ProductModel");
const Seller = require("../models/SellerModel");


exports.getSearchSuggestions = async (req, res) => {
  try {
    const query = req.query.q?.trim();

    if (!query) {
      return res.status(200).json({ success: true, suggestions: [] });
    }

    const suggestions = await Product.find(
      { name: { $regex: query, $options: "i" } }, // case-insensitive search
      { name: 1, _id: 0 } // only return name field
    ).limit(10);

    res.status(200).json({
      success: true,
      suggestions: [...new Set(suggestions.map((s) => s.name))], // remove duplicates
    });
  } catch (error) {
    console.error("Error in search suggestions:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.searchProducts = async (req, res) => {
  try {
    const query = req.query.q?.trim();

    if (!query) {
      return res
        .status(400)
        .json({ success: false, message: "Query is required" });
    }

    const products = await Product.aggregate([
      {
        $match: {
          name: { $regex: query, $options: "i" },
        },
      },
      {
        $lookup: {
          from: "sellers",
          localField: "sellerId",
          foreignField: "_id",
          as: "seller",
        },
      },
      { $unwind: "$seller" },
      {
        $project: {
          _id: 1,
          name: 1,
          price: 1,
          category: 1,
          image: { $arrayElemAt: ["$image", 0] }, // first image
          "seller.shopName": 1,
          "seller._id": 1,
        },
      },
      { $limit: 30 },
    ]);

    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

