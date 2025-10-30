const Seller = require("../models/SellerModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cloudinary = require("../config/cloudinary.js");
const fs = require("fs");
// Register new seller
// exports.registerSeller = async (req, res) => {
//   try {
//     const { name, email, password, shopName, address, phone } = req.body;

//     // Check if seller already exists (by email or phone)
//     const existingSeller = await Seller.findOne({
//       $or: [{ email }, { phone }],
//     });

//     if (existingSeller) {
//       return res.status(400).json({
//         message: "Seller already registered with this email or phone number",
//       });
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create new seller
//     const newSeller = new Seller({
//       name,
//       email,
//       password: hashedPassword,
//       shopName,
//       address,
//       phone,
//       adminApproval: true, // temporary until admin app is made
//     });

//     await newSeller.save();

//     res.status(201).json({
//       message: "Seller registered successfully",
//       seller: {
//         id: newSeller._id,
//         name: newSeller.name,
//         email: newSeller.email,
//         phone: newSeller.phone,
//         shopName: newSeller.shopName,
//       },
//     });
//   } catch (error) {
//     console.error("Error registering seller:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

exports.registerSeller = async (req, res) => {
  try {
    const { name, email, password, shopName, address, phone } = req.body;

    // Check if seller already exists
    const existingSeller = await Seller.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingSeller) {
      return res.status(400).json({
        message: "Seller already registered with this email or phone number",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let shopImage = "";

    // If file uploaded, upload it to Cloudinary
    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "sellerShops",
        resource_type: "image",
      });

      shopImage = uploadResult.secure_url;

      // remove local temp file
      fs.unlinkSync(req.file.path);
    }

    // Create new seller
    const newSeller = new Seller({
      name,
      email,
      password: hashedPassword,
      shopName,
      address,
      phone,
      shopImage,
      adminApproval: true, // default
    });

    await newSeller.save();

    res.status(201).json({
      message: "Seller registered successfully",
      seller: {
        id: newSeller._id,
        name: newSeller.name,
        email: newSeller.email,
        phone: newSeller.phone,
        shopName: newSeller.shopName,
        shopImage: newSeller.shopImage,
      },
    });
  } catch (error) {
    console.error("Error registering seller:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 *  Login seller (using email OR phone)
 */
exports.loginSeller = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;


    // Check if seller exists by email or phone
    const seller = await Seller.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
    });
        
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    // Check admin approval
    if (!seller.adminApproval) {
      return res
        .status(403)
        .json({ message: "Your account is pending admin approval" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
  
    // Generate JWT token
    const token = jwt.sign(
      { sellerId: seller._id, email: seller.email },
      process.env.JWT_SECRET
    );

    res.status(200).json({
      message: "Login successful",
      token,
      seller: {
        id: seller._id,
        name: seller.name,
        email: seller.email,
        phone: seller.phone,
        shopName: seller.shopName,
      },
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Server error" });
  }
};


//  Toggle Online/Offline status
exports.toggleOnlineStatus = async (req, res) => {
  try {
    const sellerId = req.seller._id;
    const { isOnline } = req.body; // expect true/false

    const seller = await Seller.findByIdAndUpdate(
      sellerId,
      { isOnline },
      { new: true }
    );

    if (!seller) {
      return res.status(404).json({ success: false, message: "Seller not found" });
    }

    res.status(200).json({
      success: true,
      message: `Shop is now ${isOnline ? "Online 🟢" : "Offline 🔴"}`,
      seller,
    });
  } catch (error) {
    console.error("Error toggling online status:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



//  Get all sellers with  filter: online/offline
exports.getAllSellers = async (req, res) => {
  try {
    const { status } = req.query; // "online", "offline", or undefined
    let filter = {};

    if (status === "online") {
      filter.isOnline = true;
    } else if (status === "offline") {
      filter.isOnline = false;
    }

    const sellers = await Seller.find(filter).select(
      "shopName address phone isOnline products"
    );

    if (!sellers || sellers.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No sellers found for the selected filter",
        sellers: [],
      });
    }

    res.status(200).json({
      success: true,
      total: sellers.length,
      sellers,
    });
  } catch (error) {
    console.error("Error fetching sellers:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

