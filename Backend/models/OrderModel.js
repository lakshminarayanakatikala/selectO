const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Each item belongs to a seller
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

        // Added field — individual item status (important for multi-seller)
        itemStatus: {
          type: String,
          enum: ["pending", "processing", "delivered", "cancelled"],
          default: "pending",
        },
      },
    ],

    totalPrice: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    finalPrice: { type: Number }, // computed field (totalPrice - discount)

    // Global order status (for user overview)
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "partially_delivered",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },

    address: { type: String, required: true },
    phone: { type: String, required: true },

    paymentMode: {
      type: String,
      enum: ["COD", "Online"],
      default: "COD",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    transactionId: { type: String }, // for online payments
    deliveryDate: { type: Date }, // optional tracking
  },
  { timestamps: true }
);

// Pre-save hook to automatically compute finalPrice
orderSchema.pre("save", function (next) {
  if (!this.finalPrice) {
    this.finalPrice = this.totalPrice - (this.discount || 0);
  }

  // Auto-update global status if needed
  const itemStatuses = this.items.map((i) => i.itemStatus);
  if (itemStatuses.every((s) => s === "delivered")) {
    this.status = "delivered";
  } else if (
    itemStatuses.some((s) => s === "processing" || s === "delivered")
  ) {
    this.status = "partially_delivered";
  }

  next();
});

module.exports = mongoose.model("Order", orderSchema);
