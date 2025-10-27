const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        sellerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Seller",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
        subtotal: { type: Number, required: true, min: 0 },
      },
    ],

    totalPrice: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    finalPrice: { type: Number }, // totalPrice - discount

    status: {
      type: String,
      enum: ["pending", "processing", "delivered", "cancelled"],
      default: "pending",
    },

    address: { type: String, required: true },
    phone: { type: String, required: true },

    paymentMode: {
      type: String,
      enum: ["COD", "Online"],
      default: "COD",
    },

    transactionId: { type: String }, // optional for Online mode
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
