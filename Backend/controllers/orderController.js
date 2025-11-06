const Order = require("../models/OrderModel");
const Product = require("../models/ProductModel");
const Seller = require("../models/SellerModel");
const mongoose = require("mongoose");
const CompleteOrder = require("../models/CompleteOrderModel");

//user can create order 

// exports.createOrder = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const { items, address, phone, paymentMode } = req.body;

//     if (!items || items.length === 0) {
//       return res
//         .status(400)
//         .json({ success: false, message: "No items in order" });  
//     }

//     let totalPrice = 0;
//     const orderItems = [];

//     for (const item of items) {
//       const product = await Product.findById(item.productId);

//       if (!product) {
//         return res.status(404).json({
//           success: false,
//           message: `Product not found: ${item.productId}`,
//         });
//       }

//       if (product.quantitie < item.quantity) {
//         return res.status(400).json({
//           success: false,
//           message: `${product.name} has only ${product.quantitie} left`,
//         });
//       }

//       // Calculate subtotal
//       const subtotal = product.price * item.quantity;
//       totalPrice += subtotal;

//       // Push to order items
//       orderItems.push({
//         productId: product._id,
//         quantity: item.quantity,
//         price: product.price,
//         sellerId: product.sellerId,
//         subtotal,
//       });

//       // Decrease stock quantity
//       product.quantitie -= item.quantity;
//       await product.save();
//     }

//     const order = new Order({
//       userId,
//       items: orderItems,
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


// exports.createOrder = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const { items, address, phone, paymentMode } = req.body;

//     if (!items || items.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "No items in order",
//       });
//     }

//     // Fetch all products in one query
//     const productIds = items.map((i) => i.productId);
//     const products = await Product.find({ _id: { $in: productIds } });

//     if (!products || products.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Products not found",
//       });
//     }

//     // Group products by sellerId
//     const groupedBySeller = {};

//     for (const item of items) {
//       const product = products.find((p) => p._id.toString() === item.productId);

//       if (!product) continue;

//       if (product.quantitie < item.quantity) {
//         return res.status(400).json({
//           success: false,
//           message: `${product.name} has only ${product.quantitie} left`,
//         });
//       }

//       const sellerId = product.sellerId.toString();

//       if (!groupedBySeller[sellerId]) groupedBySeller[sellerId] = [];

//       groupedBySeller[sellerId].push({
//         productId: product._id,
//         sellerId,
//         quantity: item.quantity,
//         price: product.price,
//         subtotal: product.price * item.quantity,
//       });

//       // Reduce product stock
//       product.quantitie -= item.quantity;
//       await product.save();
//     }

//     // Create individual orders per seller
//     const createdOrders = [];
//      let grandTotal = 0;

//     for (const [sellerId, sellerItems] of Object.entries(groupedBySeller)) {
//       const totalPrice = sellerItems.reduce((sum, i) => sum + i.subtotal, 0);
//       grandTotal += totalPrice
//       const newOrder = new Order({
//         userId,
//         items: sellerItems,
//         totalPrice,
//         finalPrice: totalPrice,
//         address,
//         phone,
//         paymentMode,
//         status: "pending",
//       });

//       await newOrder.save();
//       createdOrders.push(newOrder);
//     }

//     res.status(201).json({
//       success: true,
//       message: "Order placed successfully",
//       orders: createdOrders,
//       totalPrice: grandTotal
//     });
//   } catch (error) {
//     console.error("Order creation failed:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };


// POST /api/user/create-order
// body: { items: [{ productId, quantity }], address, phone, paymentMode }
exports.createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const userId = req.user._id;
    const { items, address, phone, paymentMode } = req.body;

    if (!items || !items.length) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: "No items in order" });
    }

    // 1) Load all requested products in one query
    const productIds = items.map(i => i.productId);
    const products = await Product.find({ _id: { $in: productIds } }).session(session);

    // Map productId => product
    const productsMap = {};
    products.forEach(p => { productsMap[p._id.toString()] = p; });

    // 2) Validate stock and calculate per-item subtotals, group by seller
    let grandTotal = 0;
    const groupedBySeller = {}; // sellerId -> [orderItem, ...]
    for (const it of items) {
      const pid = it.productId;
      const qty = Number(it.quantity);
      const product = productsMap[pid];

      if (!product) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ success: false, message: `Product not found: ${pid}` });
      }

      if ((product.quantitie || 0) < qty) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ success: false, message: `${product.name} has only ${product.quantitie} left` });
      }

      const sellerId = product.sellerId.toString();
      const subtotal = product.price * qty;
      grandTotal += subtotal;

      if (!groupedBySeller[sellerId]) groupedBySeller[sellerId] = [];
      groupedBySeller[sellerId].push({
        productId: product._id,
        sellerId: product.sellerId,
        quantity: qty,
        price: product.price,
        subtotal,
      });

      // Decrease product quantity immediately (reserve stock)
      product.quantitie = product.quantitie - qty;
      await product.save({ session });
    }

    // 3) Create the CompleteOrder
    const completeOrder = new CompleteOrder({
      userId,
      totalPrice: grandTotal,
      finalPrice: grandTotal,
      paymentMode: paymentMode || "COD",
      address,
      phone,
      childOrders: [],
    });

    await completeOrder.save({ session });

    // 4) Create one Order per seller
    const createdOrders = [];
    for (const [sellerId, sellerItems] of Object.entries(groupedBySeller)) {
      const totalPrice = sellerItems.reduce((s, it) => s + it.subtotal, 0);

      const order = new Order({
        completeOrderId: completeOrder._id,
        userId,
        items: sellerItems,
        totalPrice,
        status: "pending",
        address,
        phone,
        paymentMode: paymentMode || "COD",
      });

      await order.save({ session });
      createdOrders.push(order);

      // link to completeOrder
      completeOrder.childOrders.push(order._id);
    }

    // save completeOrder with child orders
    await completeOrder.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Return the single complete order with child orders embedded
    const populatedComplete = await CompleteOrder.findById(completeOrder._id)
      .populate({
        path: "childOrders",
        populate: [
          { path: "items.productId", select: "name price image category quantitie" },
          { path: "items.sellerId", select: "shopName shopImage address phone" }
        ]
      })
      .lean();

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      completeOrder: populatedComplete,
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Order creation failed:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// /api/user/complete-orders collect the user all orders
exports.getUserCompleteOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    const completeOrders = await CompleteOrder.find({ userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "childOrders",
        populate: [
          { path: "items.productId", select: "name price image category" },
          { path: "items.sellerId", select: "shopName shopImage address phone" }
        ]
      })
      .lean();

    return res.status(200).json({ success: true, count: completeOrders.length, completeOrders });
  } catch (err) {
    console.error("Error getUserCompleteOrders:", err);
    return res.status(500).json({ success: false, message: "Server error" });
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

// exports.updateOrderStatus = async (req, res) => {
//   try {
//     const { id } = req.params; // orderId
//     const { status } = req.body;
//     const sellerId = req.seller._id;

//     // Find the order for this seller
//     const order = await Order.findOne({ _id: id, "items.sellerId": sellerId });
//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found or not authorized",
//       });
//     }

//     // 2Update order status
//     order.status = status;

//     await order.save();

//     res.status(200).json({
//       success: true,
//       message: `Order marked as ${status} successfully`,
//       order,
//     });
//   } catch (error) {
//     console.error("Error updating order:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while updating order status",
//     });
//   }
// };


exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params; // orderId
    const { status } = req.body;
    const sellerId = req.seller._id;

    const validStatuses = ["pending", "processing", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const order = await Order.findOne({ _id: id, "items.sellerId": sellerId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or not authorized",
      });
    }

    // Enforce logical flow
    const current = order.status;
    if (
      (current === "pending" && status === "delivered") ||
      (current === "delivered" && status !== "delivered")
    ) {
      return res.status(400).json({
        success: false,
        message: `Cannot move from ${current} to ${status}`,
      });
    }

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


exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ userId })
      .populate("items.productId", "name price category image")
      .populate("items.sellerId", "shopName")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


