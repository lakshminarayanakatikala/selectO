const express = require("express");
const addressRouter = express.Router();

const {
  addAddress,
  getAddresses,
  deleteAddress,
  setDefaultAddress,
} = require("../controllers/addressController");
const userAuthMiddleware = require("../middleware/userAuthMiddleware");



// Add new address
addressRouter.post("/add", userAuthMiddleware, addAddress);

// Get all addresses (default first)
addressRouter.get("/list", userAuthMiddleware, getAddresses);

// Get default address
// addressRouter.get("/default", userAuthMiddleware, getDefaultAddress);

// Set default address
addressRouter.put("/set-default", userAuthMiddleware, setDefaultAddress);

// Delete address
addressRouter.delete("/:addressId", userAuthMiddleware, deleteAddress);

module.exports = addressRouter;
