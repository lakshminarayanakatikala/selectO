const Order = require("../models/OrderModel");
const Product = require("../models/ProductModel");
const Seller = require("../models/SellerModel");

//user can create order 
// exports.createOrder = async (req, res) => {
//   try {
//     const userId = req.user._id; // from user auth middleware
//     const { productId, quantity, address, phone, paymentMode } = req.body;

//     const product = await Product.findById(productId);
//     if (!product) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Product not found" });
//     }

//     const totalPrice = product.price * quantity;

//     const order = new Order({
//       userId ,  // user id
//       sellerId: product.sellerId, // Auto-linked to seller
//       productId,
//       quantity,
//       totalPrice,
//       address,
//       phone,
//       paymentMode,
//       status: "pending",
//     });

//     await order.save();

//     res.status(201).json({
//       success: true,
//       message: "Order placed successfully",
//       order,
//     });
//   } catch (error) {
//     console.error("Order creation failed:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };
exports.createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { items, address, phone, paymentMode } = req.body;

    if (!items || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No items in order" });  
    }

    let totalPrice = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.productId}`,
        });
      }

      if (product.quantitie < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `${product.name} has only ${product.quantitie} left`,
        });
      }

      // Calculate subtotal
      const subtotal = product.price * item.quantity;
      totalPrice += subtotal;

      // Push to order items
      orderItems.push({
        productId: product._id,
        quantity: item.quantity,
        price: product.price,
        sellerId: product.sellerId,
        subtotal,
      });

      // Decrease stock quantity
      product.quantitie -= item.quantity;
      await product.save();
    }

    const order = new Order({
      userId,
      items: orderItems,
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

    const orders = await Order.find({ "items.sellerId": sellerId })
      .populate("items.productId", "name price category image")
      .populate("items.sellerId", "name shopName")
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
    const orders = await Order.find({
      "items.sellerId": sellerId,
      status: { $in: ["pending", "processing"] },
    })
      .populate("items.productId", "name price category image")
      .populate("items.sellerId", "name shopName")
      .sort({ createdAt: -1 });

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
    const orders = await Order.find({
      "items.sellerId": sellerId,
      status: "delivered",
    })
      .populate("items.productId", "name price category image")
      .populate("items.sellerId", "name shopName")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching delivered orders:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//  Update order status (for example, mark as delivered and also decrese the product quantity automatically)

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params; // orderId
    const { status } = req.body;
    const sellerId = req.seller._id;

    // Find the order for this seller
    const order = await Order.findOne({ _id: id, "items.sellerId": sellerId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or not authorized",
      });
    }

    // 2Update order status
    order.status = status;

    await order.save();

    res.status(200).json({
      success: true,
      message: `Order marked as ${status} successfully`,
      order,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating order status",
    });
  }
};

