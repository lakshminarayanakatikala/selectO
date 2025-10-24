const mongoose = require("mongoose");

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
    rating:{
        type:Number,
        default:2  // outof 5 
    },
    quantitie :{
        type : Number,
        default: 0,
    },
    stock: {
      type: Boolean,
      default :false
    },
    category: {
      type: String,
      trim: true,
    },
    image: {
      type: [String],  //if we add 3 or 4 images urls so string is not possible so i add Array of strings
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
