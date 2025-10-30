const Cart = require("../models/cartModel");
const Product = require("../models/ProductModel");

//  Add or update multiple items in cart
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    if (quantity > product.quantitie) {
      return res
        .status(400)
        .json({ success: false, message: "Not enough quantitie available" });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [], totalPrice: 0 });
    }

    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (existingItem) {
      //  check total quantity (existing + new)
      const totalRequested = existingItem.quantity + quantity;
      if (totalRequested > product.quantitie) {
        return res.status(400).json({
          success: false,
          message: `Only ${
            product.quantitie - existingItem.quantity
          } more available`,
        });
      }

      existingItem.quantity += quantity;
      existingItem.price = product.offerPrice || product.price;
    } else {
      // Add new product to cart
      cart.items.push({
        productId,
        quantity,
        price: product.offerPrice || product.price,
      });
    }

    // Recalculate total price
    cart.totalPrice = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cart,
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// decrese the cart 
exports.decreaseCartItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, decreaseBy = 1 } = req.body; // Default decrease = 1

    const cart = await Cart.findOne({ userId });
    if (!cart)
      return res.status(404).json({ success: false, message: "Cart not found" });

    const item = cart.items.find(i => i.productId.toString() === productId);
    if (!item)
      return res.status(404).json({ success: false, message: "Item not found in cart" });

    // Decrease logic
    if (item.quantity > decreaseBy) {
      item.quantity -= decreaseBy;
    } else {
      // Remove item entirely if quantity <= decreaseBy
      cart.items = cart.items.filter(i => i.productId.toString() !== productId);
    }

    // Recalculate total price
    cart.totalPrice = cart.items.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    );

    await cart.save();

    res.status(200).json({
      success: true,
      message: `Item quantity decreased by ${decreaseBy}`,
      cart,
    });
  } catch (error) {
    console.error("Error decreasing cart item:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.getCart = async (req, res) => {
  try {
    const userId = req.user._id;

    let cart = await Cart.findOne({ userId })
    .populate( 
      "items.productId",
      "name price image category quantity"
    );

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Empty cart",
        cart: { items: [], totalPrice: 0 },
      });
    }

    let updated = false;
    let totalPrice = 0;

    // Update item prices and calculate total per item
    const itemsWithTotal = cart.items.map((item) => {
      if (item.productId && item.price !== item.productId.price) {
        item.price = item.productId.price;
        updated = true;
      }

      const itemTotal = item.price * item.quantity;
      totalPrice += itemTotal;

      return {
        ...item._doc, // include other item fields
        total: itemTotal, // individual item total
      };
    });

    if (updated) {
      cart.items = itemsWithTotal;
      cart.totalPrice = totalPrice;
      await cart.save();
    } else {
      cart.totalPrice = totalPrice;
    }

    res
      .status(200)
      .json({ success: true, cart: { items: itemsWithTotal, totalPrice } });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


//  Remove specific product
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart)
      return res.status(404).json({ success: false, message: "Cart not found" });

    //  Check if product exists in cart
    const itemExists = cart.items.some(
      (i) => i.productId.toString() === productId
    );

    if (!itemExists) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }



    cart.items = cart.items.filter((i) => i.productId.toString() !== productId);
    cart.totalPrice = cart.items.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    );

    await cart.save();
    res.status(200).json({ success: true, message: "Item removed", cart });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//  Clear all cart items
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user._id;
    await Cart.findOneAndUpdate({ userId }, { items: [], totalPrice: 0 });
    res.status(200).json({ success: true, message: "Cart cleared" });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
