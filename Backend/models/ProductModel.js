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
    originalPrice: { type: Number, default: 0 }, // store price before discount
    sellerDiscount: {
      type: Number,
      default: 0,
    },
    isDiscounted: { type: Boolean, default: false }, // indicates offer active
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
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isBestSelling: { type: Boolean, default: false },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

//  Middleware: After a product is saved, automatically link it to the Seller 
productSchema.post("save", async function (doc) {
  try {
    await Seller.findByIdAndUpdate(doc.sellerId, {
      $addToSet: { products: doc._id }, // avoids duplicates
    });
  } catch (error) {
    console.error("Error linking product to seller:", error.message);
  }
});


//  Middleware: Trigger alert automatically when stock changes
productSchema.post("save", async function (doc) {
  try {
    if (doc.stock <= 0) {
      await Notification.create({
        sellerId: doc.sellerId,
        message: `${doc.name} is out of stock!`,
        type: "OUT_OF_STOCK",
      });
    } else if (doc.stock < 10) {
      await Notification.create({
        sellerId: doc.sellerId,
        message: `${doc.name} stock is low (${doc.stock} left)!`,
        type: "LOW_STOCK",
      });
    }
  } catch (error) {
    console.error("Error creating stock notification:", error);
  }
});

module.exports = mongoose.model("Product", productSchema);
