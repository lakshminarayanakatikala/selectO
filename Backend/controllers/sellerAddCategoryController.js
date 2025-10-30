const Category = require("../models/CategoryModel.js");
const cloudinary = require("../config/cloudinary.js");
const fs = require("fs");

// Add new category
const addCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Category image file is required",
      });
    }

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: "categories",
      resource_type: "image",
    });

    // Remove local temp file
    fs.unlinkSync(req.file.path);

    // Save in DB
    const category = await Category.create({
      name,
      image: uploadResult.secure_url,
    });

    res.status(201).json({
      success: true,
      message: "Category added successfully",
      category,
    });
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get all categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { addCategory, getAllCategories };
