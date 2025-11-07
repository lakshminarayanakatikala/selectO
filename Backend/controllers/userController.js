const User = require("../models/UserModel");
const Seller = require("../models/SellerModel");
const Product = require("../models/ProductModel")
const Category = require("../models/CategoryModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Otp = require("../models/OtpModel");
const twilioClient = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);


//  Helper function to create token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

// //  Register user
// exports.registerUser = async (req, res) => {
//   try {
//     const { name, email, phone, password, confirmPassword } = req.body;

//     // Validate fields
//     if (!name || !email || !phone || !password || !confirmPassword) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     // Password confirmation
//     if (password !== confirmPassword) {
//       return res.status(400).json({ message: "Passwords do not match" });
//     }

//     // Check for existing user
//     const existingUser = await User.findOne({
//       $or: [{ email }, { phone }],
//     });

//     if (existingUser) {
//       return res
//         .status(400)
//         .json({ message: "User already exists with this email or phone" });
//     }

//     // Hash password manually
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create new user
//     const user = new User({
//       name,
//       email,
//       phone,
//       password: hashedPassword,
//     });

//     await user.save();

//     // Generate token (auto login after registration)
//     const token = generateToken(user._id);

//     res.status(201).json({
//       success: true,
//       message: "User registered successfully",
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         phone: user.phone,
//       },
//     });
//   } catch (error) {
//     console.error("Register Error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// //  Login user (email or phone)
// exports.loginUser = async (req, res) => {
//   try {
//     const { identifier, password } = req.body; // identifier = email or phone

//     if (!identifier || !password) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     const user = await User.findOne({
//       $or: [{ email: identifier }, { phone: identifier }],
//     });

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Compare password manually
//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     // Generate token
//     const token = generateToken(user._id);

//     res.status(200).json({
//       success: true,
//       message: "Login successful",
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         phone: user.phone,
//       },
//     });
//   } catch (error) {
//     console.error("Login Error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };





/* ---------------------- SEND OTP ---------------------- */
exports.sendOtp = async (req, res) => {
  try {
    let { phone } = req.body;

    if (!phone) {
      return res
        .status(400)
        .json({ success: false, message: "Phone number required" });
    }

    if (!phone.startsWith("+") && phone.length === 10) {
      phone = `+91${phone}`;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP
    await Otp.findOneAndUpdate(
      { phone },
      { otp, createdAt: Date.now() },
      { upsert: true, new: true }
    );

    const isProd = process.env.NODE_ENV === "production";

    if (isProd) {
      await twilioClient.messages.create({
        body: `Your Selecto verification code is ${otp}. It expires in 5 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone,
      });
    } else {
      console.log("DEV MODE: OTP =", otp);
    }

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      phone,
      ...(process.env.NODE_ENV !== "production" && { otp }), // dev only
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ---------------------- VERIFY OTP ---------------------- */
exports.verifyOtp = async (req, res) => {
  try {
    let { phone, otp } = req.body;
    if (!phone || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Phone and OTP required" });
    }

    // Normalize phone number
    let formattedPhone = phone;
    if (!phone.startsWith("+") && phone.length === 10) {
      formattedPhone = `+91${phone}`;
    }

    // Check OTP record
    const otpRecord = await Otp.findOne({
      $or: [{ phone }, { phone: formattedPhone }],
    });
    if (!otpRecord || otpRecord.otp !== otp) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    // Remove OTP record
    // await Otp.deleteMany({ phone: formattedPhone });

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ phone }, { phone: formattedPhone }],
    });

    if (existingUser) {
      const token = generateToken(existingUser._id);
      return res.status(200).json({
        success: true,
        message: "Login successful",
        isNewUser: false,
        token,
        user: {
          id: existingUser._id,
          name: existingUser.name,
          email: existingUser.email,
          phone: existingUser.phone,
        },
      });
    }

    // New user → ask for details (name/email)
    return res.status(200).json({
      success: true,
      message: "OTP verified. Please complete registration.",
      isNewUser: true,
      phone: formattedPhone,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


/* ---------------------- REGISTER AFTER OTP ---------------------- */
// exports.registerUser = async (req, res) => {
//   try {
//     const { name, email } = req.body;

//     if (!name || !email) {
//       return res.status(400).json({
//         success: false,
//         message: "Name, email, and phone are required",
//       });
//     }


//     // Prevent duplicate registration
//     let user = await User.findOne({ phone });
//     if (user) {
//       return res
//         .status(400)
//         .json({ success: false, message: "User already exists" });
//     }

//     user = new User({
//       name,
//       email,
//       phone,
//     });

//     await user.save();

//     const token = generateToken(user._id);

//     return res.status(201).json({
//       success: true,
//       message: "User registered successfully",
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         phone: user.phone,
//       },
//     });
//   } catch (error) {
//     console.error("Register error:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };



// GET /api/sellers

exports.registerUser = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    // Find the latest verified phone from OTP collection
    const lastOtp = await Otp.findOne().sort({ createdAt: -1 });
    console.log(lastOtp)

    if (!lastOtp || !lastOtp.phone) {
      return res.status(400).json({
        success: false,
        message: "No verified phone found. Please verify OTP first.",
      });
    }

    const phone = lastOtp.phone;

    //  Check if user already exists
    let existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists. Please login instead.",
      });
    }

    // Register new user
    const user = new User({
      name,
      email,
      phone,
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Optionally remove OTP after registration
    await Otp.deleteMany({ phone });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getAllSellers = async (req, res) => {
  try {
    const sellers = await Seller.find().select(
      "shopName address phone shopImage location isOnline adminApproval"
    );
    res.status(200).json({ success: true, sellers });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/sellers/:sellerId/products
exports.getSellerProducts = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const products = await Product.find({ sellerId });

    if (!products.length) {
      return res.status(200).json({ success: true, message: "No products found", products: [] });
    }

    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error("Error fetching seller products:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/sellers/:sellerId/categories
exports.getSellerCategories = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const categories = await Product.distinct("category", { sellerId });

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/sellers/:sellerId/products/:category
exports.getSellerProductsByCategory = async (req, res) => {
  try {
    const { sellerId, category } = req.params;

    const products = await Product.find({
      sellerId,
      category: { $regex: new RegExp(`^${category}$`, "i") },
    });

    res.status(200).json({ 
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Error filtering products:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// get near by sellers 

exports.getNearbySellers = async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 5000 } = req.query; // in meters

    const sellers = await Seller.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseFloat(maxDistance),
        },
      },
    });

    res.status(200).json({
      success: true,
      count: sellers.length,
      sellers,
    });
  } catch (error) {
    console.error("Error fetching nearby sellers:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// exports.getSellersByCategory = async (req, res) => {
//   try {
//     const { category } = req.params;

//     // Find all products in this category
//     const sellers = await Product.find({ category })
//       .populate("sellerId", "shopName location shopImage")
//       .distinct("sellerId");

//     const sellerDetails = await Seller.find({ _id: { $in: sellers } });

//     res.status(200).json({ success: true, sellers: sellerDetails });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

exports.getSellersByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    //  Find all products in this category and populate seller info
    const products = await Product.find({ category })
      .populate("sellerId", "shopName location shopImage address phone") //shopName shopImage address phone location description
      .lean();

    if (!products || products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No sellers or products found for this category",
      });
    }

    //  Extract unique sellers
    const uniqueSellersMap = new Map();
    products.forEach((product) => {
      if (!uniqueSellersMap.has(product.sellerId._id.toString())) {
        uniqueSellersMap.set(product.sellerId._id.toString(), {
          _id: product.sellerId._id,
          shopName: product.sellerId.shopName,
          address: product.sellerId.address, //  added address here
          phone: product.sellerId.phone,
          location: product.sellerId.location,
          shopImage: product.sellerId.shopImage,
          products: [],
        });
      }
      // Add product to this seller’s product list
      uniqueSellersMap.get(product.sellerId._id.toString()).products.push({
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        description: product.description,
      });
    });

    const sellersWithProducts = Array.from(uniqueSellersMap.values());

    // Response
    res.status(200).json({
      success: true,
      count: sellersWithProducts.length,
      category,
      sellers: sellersWithProducts,
    });
  } catch (error) {
    console.error("Error fetching sellers by category:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// GET /api/seller-page/:sellerId
// Optional query ?category=Fruits
exports.getSellerMainPage = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { category } = req.query;

    const seller = await Seller.findById(sellerId).select(
      "shopName shopImage address phone location description"
    );

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    const categories = await Product.distinct("category", { sellerId });
    // Get images for each category
    const allCategories = await Category.find({}, "name image");
    const categoriesWithImages = categories.map((cat) => {
      const matched = allCategories.find(
        (c) => c.name.toLowerCase() === cat.toLowerCase()
      );
      return {
        name: cat,
        image: matched
          ? matched.image
          : "https://res.cloudinary.com/demo/image/upload/v1/default.jpg",
      };
    });


    let selectedCategory = category || categories[0];
    const products = await Product.find({
      sellerId,
      category: { $regex: new RegExp(`^${selectedCategory}$`, "i") },
    });

    res.status(200).json({
      success: true,
      seller,
      categories,
      category_img: categoriesWithImages,
      selectedCategory,
      products,
    });
  } catch (error) {
    console.error("Error fetching seller page:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.getSellerProductWithRelated = async (req, res) => {
  try {
    const { sellerId, productId } = req.params;
    let { category } = req.query;

    // Fetch selected product
    const product = await Product.findOne({ _id: productId, sellerId })
      .populate("sellerId", "shopName shopImage address phone location")
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found for this seller",
      });
    }

    // If category not provided, auto-detect from product
    if (!category) {
      category = product.category;
    }

    //  Fetch related products from SAME seller & SAME category (EXCLUDE selected product)
    const relatedProducts = await Product.find({
      sellerId,
      category: { $regex: new RegExp(`^${category}$`, "i") },
      _id: { $ne: productId }, // exclude selected
    })
      .select("name price category image description")
      .lean();

    // Also send seller categories + images (optional but useful for frontend)
    const sellerCategories = await Product.distinct("category", { sellerId });

    const allCategories = await Category.find({}, "name image");

    const categoriesWithImages = sellerCategories.map((cat) => {
      const matched = allCategories.find(
        (c) => c.name.toLowerCase() === cat.toLowerCase()
      );
      return {
        name: cat,
        image: matched
          ? matched.image
          : "https://res.cloudinary.com/demo/image/upload/v1/default.jpg",
      };
    });

    //  Response
    res.status(200).json({
      success: true,
      seller: product.sellerId,
      selectedProduct: product,
      category,
      relatedProducts,
      categories: sellerCategories,
      categoryImages: categoriesWithImages,
    });
  } catch (error) {
    console.error("Error fetching product with related items:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

