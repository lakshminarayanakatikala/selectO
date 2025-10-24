const express = require('express')
const {getProducts , addProduct,uploadProducts } = require("../controllers/productController.js")
const authMiddleware = require('../middleware/authMiddleware.js')
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const productRoute = express.Router()


productRoute.get("/", getProducts)  // after complete the testing add authMiddleware for seurity
productRoute.post("/add" ,addProduct)
productRoute.post("/upload", upload.single("file"), uploadProducts);

// productRoute.post("/upload" ,);
// productRoute.delete("/:id",);
// productRoute.put("/:id",);
// productRoute.patch("/stock/:id",);

module.exports = productRoute

