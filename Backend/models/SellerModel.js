const mongoose = require("mongoose");

const sellerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    shopName: {
      type: String,
      required: true,
      trim: true,
    },
    shopImage: {
      type: String, // Cloudinary URL
      default: "", // in case image not uploaded
      required: true,
    },
    // address: {
    //   type: String,
    //   required: true,
    // },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String, // readable address (manual or reverse-geocoded)
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    products: [
      // this was helpful for example count the totatl product of the seller
      {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Product",
        default: [],
      },
    ],
    categories: [{ type: String }],
    adminApproval: {
      type: Boolean,
      default: true, // for now true, later only admin can approve
    },
    isOnline: { type: Boolean, default: false },
  },
  { timestamps: true }
);


sellerSchema.index({ location: "2dsphere" });
module.exports = mongoose.model("Seller", sellerSchema);
