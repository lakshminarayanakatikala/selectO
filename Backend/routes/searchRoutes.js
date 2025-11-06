// routes/searchRoutes.js
const express = require("express");
const {
  getSearchSuggestions,
  searchProducts,
  searchSellerProducts,
  getStoresByProduct
} = require("../controllers/searchController");

const searchRouter = express.Router();

searchRouter.get("/suggestions", getSearchSuggestions);
searchRouter.get("/products", searchProducts);
searchRouter.get("/seller/:sellerId/search", searchSellerProducts);
searchRouter.get("/universalSearch", getStoresByProduct);

module.exports = searchRouter;
