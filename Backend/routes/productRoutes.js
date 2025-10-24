const express = require('express')
const {getProducts , addProduct , deleteProduct , updateProduct , toggleStock} = require("../controllers/productController.js")
const authMiddleware = require('../middleware/authMiddleware.js')

const productRoute = express.Router()


productRoute.get("/", getProducts)  // after complete the testing add authMiddleware for seurity
productRoute.post("/add", authMiddleware, addProduct);
// productRoute.post("/upload" ,);
productRoute.delete("/:id", authMiddleware ,deleteProduct );
productRoute.put("/:id",authMiddleware , updateProduct);
productRoute.patch("/stock/:id",authMiddleware , toggleStock);

module.exports = productRoute

//orders vastai 

