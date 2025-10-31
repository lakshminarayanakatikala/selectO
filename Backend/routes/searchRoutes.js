// routes/searchRoutes.js
const express = require("express");
const {
  getSearchSuggestions,
  searchProducts
} = require("../controllers/searchController");

const searchRouter = express.Router();

searchRouter.get("/suggestions", getSearchSuggestions);
searchRouter.get("/products", searchProducts);

module.exports = searchRouter;
