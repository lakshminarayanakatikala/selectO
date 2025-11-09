const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    label: { type: String, enum: ["Home", "Office", "Other"], default: "Home" },

    // delivery-specific
    recipientName: { type: String },
    recipientPhone: { type: String },

    // structured address
    house: { type: String, required: true },
    street: { type: String, required: true },
    landmark: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },

    // auto-generated from geocoder
    formattedAddress: { type: String },

    fullAddress: { type: String, required: true },

    // GeoJSON
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },

    // indicates where coordinates came from
    locationSource: {
      type: String,
      enum: ["device_gps", "map_picker", "manual_geocoded"],
      default: "manual_geocoded",
    },

    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

addressSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Address", addressSchema);
