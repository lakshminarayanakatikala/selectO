const express = require("express");
const cartRouter = express.Router();
const {
  addToCart,
  getCart,
  removeFromCart,
  clearCart,
  decreaseCartItem,
  addAllFavoritesToCart,
} = require("../controllers/cartController");
const userAuthMiddleware = require("../middleware/userAuthMiddleware");


// All routes are protected (require login)
cartRouter.post("/add", userAuthMiddleware, addToCart);
cartRouter.post("/remove", userAuthMiddleware, decreaseCartItem);
cartRouter.get("/", userAuthMiddleware, getCart);
cartRouter.delete("/delete", userAuthMiddleware, removeFromCart);
cartRouter.delete("/clear", userAuthMiddleware, clearCart);
cartRouter.post("/favorites/add-all-to-cart", userAuthMiddleware, addAllFavoritesToCart);

module.exports = cartRouter;
