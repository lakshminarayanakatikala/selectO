const express = require('express')
const {getProducts , addProduct } = require("../controllers/productController.js")
const authMiddleware = require('../middleware/authMiddleware.js')

const productRoute = express.Router()


productRoute.get("/", getProducts)  // after complete the testing add authMiddleware for seurity
productRoute.post("/add" ,addProduct)
// productRoute.post("/upload" ,);
// productRoute.delete("/:id",);
// productRoute.put("/:id",);
// productRoute.patch("/stock/:id",);

module.exports = productRoute

