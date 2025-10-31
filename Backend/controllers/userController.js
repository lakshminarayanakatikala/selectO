const User = require("../models/UserModel");
const Seller = require("../models/SellerModel");
const Product = require("../models/ProductModel")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//  Helper function to create token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

//  Register user
exports.registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;

    // Validate fields
    if (!name || !email || !phone || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Password confirmation
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Check for existing user
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email or phone" });
    }

    // Hash password manually
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    await user.save();

    // Generate token (auto login after registration)
    const token = generateToken(user._id);

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
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//  Login user (email or phone)
exports.loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier = email or phone

    if (!identifier || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare password manually
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// GET /api/sellers
exports.getAllSellers = async (req, res) => {
  try {
    const sellers = await Seller.find().select("shopName address phone isOnline");
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




exports.getSellersByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    // Find all products in this category
    const sellers = await Product.find({ category })
      .populate("sellerId", "shopName location shopImage")
      .distinct("sellerId");

    const sellerDetails = await Seller.find({ _id: { $in: sellers } });

    res.status(200).json({ success: true, sellers: sellerDetails });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
