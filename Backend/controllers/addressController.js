const Address = require('../models/addressModel')

exports.addAddress = async (req, res) => {
  try {
    const userId = req.user._id;

    const {
      house,
      street,
      landmark,
      city,
      state,
      pincode,
      label,
      latitude,
      longitude,
      recipientName,
      recipientPhone,
      isDefault,
    } = req.body;

    if (!house || !street || !city || !state || !pincode) {
      return res.status(400).json({ success: false, message: "All address fields are required" });
    }

    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: "Coordinates are required" });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ success: false, message: "Invalid coordinates" });
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({ success: false, message: "Coordinates out of range" });
    }

    // full manual address
    const fullAddress = `${house}, ${street}, ${landmark ? landmark + ", " : ""}${city}, ${state} - ${pincode}`;

    // geocoder (optional but recommended)
    // you can plug Google / Mapbox here
    const formattedAddress = fullAddress; // fallback

    // only one default
    if (isDefault) {
      await Address.updateMany({ userId }, { isDefault: false });
    }

    const newAddress = await Address.create({
      userId,
      label,
      house,
      street,
      landmark,
      city,
      state,
      pincode,
      fullAddress,
      formattedAddress,
      recipientName,
      recipientPhone,
      location: {
        type: "Point",
        coordinates: [lng, lat],
      },
      locationSource: req.body.locationSource || "manual_geocoded",
      isDefault: !!isDefault,
    });

    res.status(201).json({
      success: true,
      message: "Address saved",
      address: newAddress,
    });

  } catch (error) {
    console.error("Add Address Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.getAddresses = async (req, res) => {
  try {
    const userId = req.user._id;

    const addresses = await Address.find({ userId }).sort({ isDefault: -1 });

    res.status(200).json({
      success: true,
      count: addresses.length,
      addresses,
    });
  } catch (error) {
    console.error("Get Addresses Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.setDefaultAddress = async (req, res) => {
  try {
    const { addressId } = req.body;
    const userId = req.user._id;

    const exists = await Address.findOne({ _id: addressId, userId });
    if (!exists) return res.status(404).json({ success: false, message: "Address not found" });


    await Address.updateMany({ userId }, { isDefault: false });
    await Address.findByIdAndUpdate(addressId, { isDefault: true });
    

    res.status(200).json({
      success: true,
      message: "Default address updated",
    });
  } catch (error) {
    console.error("Set Default Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const userId = req.user._id;

    const deleted = await Address.deleteOne({ _id: addressId, userId });
    if (deleted.deletedCount === 0) return res.status(404).json({ success: false, message: "Address not found" });


    // await Address.deleteOne({ _id: addressId, userId });

    res.status(200).json({
      success: true,
      message: "Address deleted",
    });
  } catch (error) {
    console.error("Delete Address Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

