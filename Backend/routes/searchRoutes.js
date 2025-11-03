// routes/searchRoutes.js
const express = require("express");
const {
  getSearchSuggestions,
  searchProducts,
  searchSellerProducts
} = require("../controllers/searchController");

const searchRouter = express.Router();

searchRouter.get("/suggestions", getSearchSuggestions);
searchRouter.get("/products", searchProducts);
searchRouter.get("/seller/:sellerId/search", searchSellerProducts);

module.exports = searchRouter;
