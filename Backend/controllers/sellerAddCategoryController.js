const Category = require("../models/CategoryModel.js");
const cloudinary = require("../config/cloudinary.js");
const fs = require("fs");

// Add new category
const addCategory = async (req, res) => {
  try {
    const { name, imageUrl } = req.body; // user can send imageUrl or file

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Category name is required" });
    }

    let image;

    // If user uploads a file
    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "categories",
        resource_type: "image",
      });

      image = uploadResult.secure_url;
      fs.unlinkSync(req.file.path); // cleanup temp file
    }
    // Or user gives image URL directly
    else if (imageUrl) {
      image = imageUrl.trim();
    }
    // No image provided
    else {
      return res
        .status(400)
        .json({ success: false, message: "Category image is required" });
    }

    const category = await Category.create({
      name,
      image,
    });

    res.status(201).json({
      success: true,
      message: "Category added successfully",
      category,
    });
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).json({ success: false, message: error.message });
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
