const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: { type: [Number] },
    },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);
userSchema.index({ location: "2dsphere" });

userSchema.virtual("addresses", {
  ref: "Address",
  localField: "_id",
  foreignField: "userId",
  justOne: false,
});

// Ensure virtuals are included in JSON responses
userSchema.set("toObject", { virtuals: true });
userSchema.set("toJSON", { virtuals: true });
module.exports = mongoose.model("User", userSchema);
