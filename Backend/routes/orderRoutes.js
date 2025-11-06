const express = require("express");
const ordersRouter = express.Router();
const {
  createOrder,
  getSellerOrders,
  getPendingOrders,
  getDeliveredOrders,
  updateOrderStatus,
  getUserCompleteOrders,
} = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");
const userAuthMiddleware = require("../middleware/userAuthMiddleware");

// Seller Order Routes 
ordersRouter.post("/create",userAuthMiddleware, createOrder);
ordersRouter.get("/complete-orders",userAuthMiddleware, getUserCompleteOrders);
ordersRouter.get("/all", authMiddleware, getSellerOrders);
ordersRouter.get("/pending", authMiddleware, getPendingOrders);
ordersRouter.get("/delivered", authMiddleware, getDeliveredOrders);
ordersRouter.patch("/status/:id", authMiddleware, updateOrderStatus);

module.exports = ordersRouter;
