const Seller = require("../models/SellerModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register new seller
exports.registerSeller = async (req, res) => {
  try {
    const { name, email, password, shopName, address, phone } = req.body;

    // Check if seller already exists (by email or phone)
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

    // Create new seller
    const newSeller = new Seller({
      name,
      email,
      password: hashedPassword,
      shopName,
      address,
      phone,
      adminApproval: true, // temporary until admin app is made
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
