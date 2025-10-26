const Order = require("../models/OrderModel");
const Product = require("../models/ProductModel");
const Seller = require("../models/SellerModel");

//user can create order 

exports.createOrder = async (req, res) => {
  try {
    const userId = req.user._id; // from user auth middleware
    const { productId, quantity, address, phone, paymentMode } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const totalPrice = product.price * quantity;

    const order = new Order({
      userId ,  // dummy user id
      sellerId: product.sellerId, // Auto-linked to seller
      productId,
      quantity,
      totalPrice,
      address,
      phone,
      paymentMode,
      status: "pending",
    });

    await order.save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Order creation failed:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// get all orders relavent to seller 

exports.getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.seller._id;

    const orders = await Order.find({ sellerId })
      .populate("productId", "name price category image")
      .sort({ createdAt: -1 });
    
    if (orders && orders.length > 0) {
      res.status(200).json({ success: true, orders });
    } else {
       res.status(200).json({ success: false, message : "There is no orders !" });
    }

  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



// Get pending (or request) orders
exports.getPendingOrders = async (req, res) => {
  try {
    const sellerId = req.seller._id;
    const orders = await Order.find({ sellerId, status: { $in: ["pending", "processing"] } })
      .populate("productId", "name price category image");

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching pending orders:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



//  Get delivered orders it is helpful for display the total deliverd orders

exports.getDeliveredOrders = async (req, res) => {
  try {
    const sellerId = req.seller._id;
    const orders = await Order.find({ sellerId, status: "delivered" })
      .populate("productId", "name price category image");

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching delivered orders:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//  Update order status (for example, mark as delivered)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params; // orderId
    const { status } = req.body;
    const sellerId = req.seller._id;

    const order = await Order.findOne({ _id: id, sellerId });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found or not authorized" });
    }

    order.status = status;
    await order.save();

    res.status(200).json({ success: true, message: `Order marked as ${status}`, order });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
