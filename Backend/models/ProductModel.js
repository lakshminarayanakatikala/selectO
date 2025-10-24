const mongoose = require("mongoose");
const Seller = require("./SellerModel"); // Import Seller model to update products array 

const productSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      default: 2, // out of 5
    },
    quantitie: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Boolean,
      default: true,
    },
    category: {
      type: String,
      trim: true,
    },
    image: {
      type: [String], // allows 3–4 URLs
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

/* 🧠 Middleware: After a product is saved, automatically link it to the Seller */
productSchema.post("save", async function (doc) {
  try {
    await Seller.findByIdAndUpdate(doc.sellerId, {
      $addToSet: { products: doc._id }, // avoids duplicates
    });
  } catch (error) {
    console.error("Error linking product to seller:", error.message);
  }
});

module.exports = mongoose.model("Product", productSchema);
