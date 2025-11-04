const express = require('express')
const showProductsRoute = express.Router()

const {
  getAllSellers,
  getSellerProductsByCategory,
  getSellerCategories,
  getSellerProducts,
  getSellersByCategory,
  getSellerMainPage,
} = require("../controllers/userController");

// need to show sellers , seller products and categories

showProductsRoute.get("/sellers", getAllSellers); // All sellers
showProductsRoute.get("/sellers/:sellerId/products", getSellerProducts); // Seller’s all products
showProductsRoute.get("/sellers/:sellerId/categories", getSellerCategories); // Seller’s categories
showProductsRoute.get("/sellers/:sellerId/products/:category",getSellerProductsByCategory); // Seller’s category-wise products


//updated routes 

showProductsRoute.get("/category/:category/sellers", getSellersByCategory); // sellers for category

// seller main page api
showProductsRoute.get("/seller-page/:sellerId", getSellerMainPage);


module.exports = showProductsRoute;