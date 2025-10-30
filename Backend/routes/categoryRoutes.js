const express = require("express");
const {
  addCategory,
  getAllCategories,
} = require("../controllers/sellerAddCategoryController.js");
const upload = require("../middleware/multer.js");

const categoryRouter = express.Router();

// Add category with image
categoryRouter.post("/add", upload.single("image"), addCategory); 

// Get all categories
categoryRouter.get("/all", getAllCategories);

module.exports = categoryRouter;
