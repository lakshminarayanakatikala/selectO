const express = require('express')
const {
  getProducts,
  addProduct,
  deleteProduct,
  updateProduct,
  toggleStock,
  uploadProducts,
  applyDiscountToAllProducts,
  restoreOriginalPrices,
  applyCategoryDiscount,
  removeCategoryDiscount,
  toggleBestSelling,
  getBestSellingProducts,
  getRelevantProducts,
} = require("../controllers/productController.js");
const authMiddleware = require('../middleware/authMiddleware.js')
const multer = require("multer");
// const upload = multer({ dest: "uploads/" });
const upload = require("../middleware/multer.js");
const uploadExcel = require("../middleware/multerExcel.js");

const productRoute = express.Router()


productRoute.get("/",authMiddleware, getProducts)  // after complete the testing add authMiddleware for seurity

productRoute.post(
  "/add",
  authMiddleware,
  upload.array("images", 4),
  addProduct
);

productRoute.post(
  "/upload",
  authMiddleware,
  uploadExcel.single("file"),
  uploadProducts
);

productRoute.delete("/:id", authMiddleware ,deleteProduct );
productRoute.put("/:id",authMiddleware , updateProduct);
productRoute.patch("/stock/:id",authMiddleware , toggleStock);

//discount for all products
productRoute.patch("/discount", authMiddleware, applyDiscountToAllProducts);
productRoute.patch("/restore-prices", authMiddleware, restoreOriginalPrices);

// Category-wise discount
productRoute.patch("/category/discount", authMiddleware, applyCategoryDiscount);
productRoute.patch("/category/remove-discount", authMiddleware, removeCategoryDiscount);

// best selling 
productRoute.post("/best-selling", authMiddleware, toggleBestSelling);
productRoute.get("/best-selling", getBestSellingProducts);

// get relavent products 
productRoute.get("/:productId/relevant", getRelevantProducts);



module.exports = productRoute


