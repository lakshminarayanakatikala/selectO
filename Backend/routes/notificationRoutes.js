const express = require("express");
const notificationRoutes = express.Router();
const {
  getSellerNotifications,
  markAsRead,
} = require("../controllers/notificationController");
const authMiddleware = require("../middleware/authMiddleware");

notificationRoutes.get("/", authMiddleware, getSellerNotifications);
notificationRoutes.patch("/:id/read", authMiddleware, markAsRead);

module.exports = notificationRoutes;
