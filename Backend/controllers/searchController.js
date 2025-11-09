const Product = require("../models/ProductModel");
const Seller = require("../models/SellerModel");


const Category = require("../models/CategoryModel");


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


// Search products (name, category, description) within same seller
exports.searchSellerProducts = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { query, limit } = req.query; // e.g. /seller/123/search?query=apple&limit=5

    if (!query || !sellerId) {
      return res.status(400).json({
        success: false,
        message: "Search query and sellerId are required",
      });
    }

    // Limit (default 5 for autocomplete)
    const resultLimit = limit ? parseInt(limit) : 5;

    // Case-insensitive search by name, category, description
    const products = await Product.find({ 
      sellerId,
      $or: [
        { name: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } }, 
        { description: { $regex: query, $options: "i" } },
      ],
    })
      .select("name price category image description")
      .limit(resultLimit);

    // Return response
    if (products.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No matching products found for this seller please vist another store ",
        products: [],
      });
    }

    res.status(200).json({
      success: true,
      totalResults: products.length,
      products,
    });
  } catch (error) {
    console.error("Error searching seller products:", error);
    res.status(500).json({
      success: false,
      message: "Server error while searching products",
    });
  }
};


// // Search product & show available stores
// exports.getStoresByProduct = async (req, res) => {
//   try {
//     const query = req.query.q?.trim();

//     if (!query) {
//       return res.status(400).json({
//         success: false,
//         message: "Search query is required",
//       });
//     }

//     // Prevent regex injection
//     const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

//     // Find all products matching the query (name or description)
//     const products = await Product.find({
//       $or: [
//         { name: { $regex: safeQuery, $options: "i" } },
//         { description: { $regex: safeQuery, $options: "i" } }
//       ]
//     })
//       .populate("sellerId", "shopName address phone shopImage location")
//       .lean();

//     if (!products.length) {
//       return res.status(404).json({
//         success: false,
//         message: "No stores found selling this product",
//       });
//     }

//     // Group sellers uniquely
//     const storeMap = new Map();

//     products.forEach((product) => {
//       const seller = product.sellerId;
//       if (!seller) return;

//       const sellerId = seller._id.toString();

//       if (!storeMap.has(sellerId)) {
//         storeMap.set(sellerId, {
//           sellerId: seller._id,
//           shopName: seller.shopName,
//           shopImage: seller.shopImage,
//           address: seller.address,
//           phone: seller.phone,
//           location: seller.location,
//           products: [],
//         });
//       }

//       // Add only matched product to this seller list
//       storeMap.get(sellerId).products.push({
//         _id: product._id,
//         name: product.name,
//         price: product.price,
//         category: product.category,
//         description: product.description,
//         image: product.image,
//       });
//     });

//     return res.status(200).json({
//       success: true,
//       totalStores: storeMap.size,
//       search: query,
//       stores: Array.from(storeMap.values()),
//     });

//   } catch (error) {
//     console.error("Error fetching stores:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };



// exports.getStoresByProduct = async (req, res) => {
//   try {
//     const query = req.query.q?.trim();

//     if (!query) {
//       return res.status(400).json({
//         success: false,
//         message: "Search query is required",
//       });
//     }

//     // Clean spaces for no-space matching (lip gloss → lipgloss)
//     const cleanedQuery = query.replace(/\s+/g, "");

//     // ✅ Check if the query matches a category
//     const isCategorySearch = await Category.findOne({
//       name: { $regex: cleanedQuery, $options: "i" },
//     });

//     // ✅ CATEGORY SEARCH LOGIC (unchanged)
//     if (isCategorySearch) {
//       const products = await Product.find({
//         category: { $regex: cleanedQuery, $options: "i" },
//       })
//         .populate("sellerId", "shopName address phone shopImage location")
//         .lean();

//       if (!products.length) {
//         return res.status(404).json({
//           success: false,
//           message: "No stores found selling this category of products",
//         });
//       }

//       const storeMap = new Map();

//       products.forEach((product) => {
//         const seller = product.sellerId;
//         if (!seller) return;

//         const sellerId = seller._id.toString();

//         if (!storeMap.has(sellerId)) {
//           storeMap.set(sellerId, {
//             sellerId: seller._id,
//             shopName: seller.shopName,
//             shopImage: seller.shopImage,
//             address: seller.address,
//             phone: seller.phone,
//             location: seller.location,
//             products: [],
//           });
//         }

//         storeMap.get(sellerId).products.push({
//           _id: product._id,
//           name: product.name,
//           price: product.price,
//           description: product.description,
//           image: product.image,
//           category: product.category,
//         });
//       });

//       return res.status(200).json({
//         success: true,
//         totalStores: storeMap.size,
//         search: query,
//         stores: Array.from(storeMap.values()),
//       });
//     }

//     // ✅ PRODUCT SEARCH (with or without spaces)
//     const safeQuery = cleanedQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

//     // User’s actual spaced version (e.g., "lip gloss")
//     const spacedQuery = query.replace(/\s+/g, " ");

//     // Auto insert space version (lipgloss → lip gloss)
//     let autoSpaceQuery = cleanedQuery.replace(/([a-z])([A-Z])/g, "$1 $2");
//     if (autoSpaceQuery === cleanedQuery) {
//       autoSpaceQuery = cleanedQuery.replace(/([a-zA-Z]{3})([a-zA-Z]+)/, "$1 $2");
//     }

//     // ✅ Updated product searching logic (main fix)
//     const products = await Product.find({
//       $or: [
//         { name: { $regex: safeQuery, $options: "i" } },         // lipgloss
//         { name: { $regex: spacedQuery, $options: "i" } },       // lip gloss
//         { name: { $regex: autoSpaceQuery, $options: "i" } },    // lip gloss (auto)
//         { description: { $regex: safeQuery, $options: "i" } },
//         { description: { $regex: spacedQuery, $options: "i" } },
//         { description: { $regex: autoSpaceQuery, $options: "i" } }
//       ],
//     })
//       .populate("sellerId", "shopName address phone shopImage location")
//       .lean();

//     if (!products.length) {
//       return res.status(404).json({
//         success: false,
//         message: "No stores found selling this product",
//       });
//     }

//     // ✅ Group sellers
//     const storeMap = new Map();

//     products.forEach((product) => {
//       const seller = product.sellerId;
//       if (!seller) return;

//       const sellerId = seller._id.toString();

//       if (!storeMap.has(sellerId)) {
//         storeMap.set(sellerId, {
//           sellerId: seller._id,
//           shopName: seller.shopName,
//           shopImage: seller.shopImage,
//           address: seller.address,
//           phone: seller.phone,
//           location: seller.location,
//           products: [],
//         });
//       }

//       storeMap.get(sellerId).products.push({
//         _id: product._id,
//         name: product.name,
//         price: product.price,
//         description: product.description,
//         image: product.image,
//         category: product.category,
//       });
//     });

//     return res.status(200).json({
//       success: true,
//       totalStores: storeMap.size,
//       search: query, 
//       stores: Array.from(storeMap.values()),
//     });

//   } catch (error) {
//     console.error("Error in getStoresByProductOrCategory:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };


exports.getStoresByProduct = async (req, res) => {
  try {
    const query = req.query.q?.trim();

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    // Remove all spaces for matching "lipgloss" → "lip gloss"
    const cleanedQuery = query.replace(/\s+/g, "").toLowerCase();

    // Find matching category (space-insensitive)
    const allCategories = await Category.find().lean();

    const isCategorySearch = allCategories.find((cat) => {
      const cleanedCat = cat.name.replace(/\s+/g, "").toLowerCase();
      return cleanedCat.includes(cleanedQuery);
    });

    /*
     * CATEGORY SEARCH LOGIC (UPDATED)
     * User searches "makeup" or "make up" → show ALL Make Up category products
     */
    if (isCategorySearch) {
      const categoryName = isCategorySearch.name; // real category

      const products = await Product.find({
        category: { $regex: `^${categoryName}$`, $options: "i" },
      })
        .populate("sellerId", "shopName address phone shopImage location")
        .lean();

      if (!products.length) {
        return res.status(404).json({
          success: false,
          message: "No stores found selling this category of products",
        });
      }

      // Group sellers
      const storeMap = new Map();

      products.forEach((product) => {
        const seller = product.sellerId;
        if (!seller) return;

        const sellerId = seller._id.toString();

        if (!storeMap.has(sellerId)) {
          storeMap.set(sellerId, {
            sellerId: seller._id,
            shopName: seller.shopName,
            shopImage: seller.shopImage,
            address: seller.address,
            phone: seller.phone,
            location: seller.location,
            products: [], // Will contain ALL category products
          });
        }

        storeMap.get(sellerId).products.push({
          _id: product._id,
          name: product.name,
          price: product.price,
          description: product.description,
          image: product.image,
          category: product.category,
        });
      });

      return res.status(200).json({
        success: true,
        totalStores: storeMap.size,
        search: query,
        category: categoryName,
        stores: Array.from(storeMap.values()),
      });
    }

    // PRODUCT SEARCH (name/description) — also space-insensitive
    const safeQuery = cleanedQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const products = await Product.find({
      $or: [
        { name: { $regex: safeQuery, $options: "i" } },
        { description: { $regex: safeQuery, $options: "i" } },
      ],
    })
      .populate("sellerId", "shopName address phone shopImage location")
      .lean();

    if (!products.length) {
      return res.status(404).json({
        success: false,
        message: "No stores found selling this product",
      });
    }

    // Group by sellers for product search
    const storeMap = new Map();

    products.forEach((product) => {
      const seller = product.sellerId;
      if (!seller) return;

      const sellerId = seller._id.toString();

      if (!storeMap.has(sellerId)) {
        storeMap.set(sellerId, {
          sellerId: seller._id,
          shopName: seller.shopName,
          shopImage: seller.shopImage,
          address: seller.address,
          phone: seller.phone,
          location: seller.location,
          products: [],
        });
      }

      storeMap.get(sellerId).products.push({
        _id: product._id,
        name: product.name,
        price: product.price,
        description: product.description,
        image: product.image,
        category: product.category,
      });
    });

    return res.status(200).json({
      success: true,
      totalStores: storeMap.size,
      search: query,
      stores: Array.from(storeMap.values()),
    });

  } catch (error) {
    console.error("Error in getStoresByProductOrCategory:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

