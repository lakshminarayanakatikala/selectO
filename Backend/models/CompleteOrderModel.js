const mongoose = require("mongoose");

const completeOrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  totalPrice: { type: Number, required: true },
  finalPrice: { type: Number }, // after discounts
  paymentMode: { type: String, enum: ["COD", "Online"], default: "COD" },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  status: { type: String, enum: ["pending", "processing", "delivered", "cancelled"], default: "pending" },
  // array of child order ids
  childOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
}, { timestamps: true });

module.exports = mongoose.model("CompleteOrder", completeOrderSchema);
