const Cart = require("../models/cartModel");
const Product = require("../models/ProductModel");
const User = require("../models/UserModel");

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

    // Populate product + seller info
    let cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      select: "name price image category quantity sellerId",
      populate: {
        path: "sellerId",
        select: "shopName shopImage address phone isOnline",
      },
    });

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Empty cart",
        cart: { sellers: [], totalPrice: 0 },
      });
    }

    let updated = false;
    let totalPrice = 0;

    // Recalculate prices
    const itemsWithTotal = cart.items.map((item) => {
      if (item.productId && item.price !== item.productId.price) {
        item.price = item.productId.price;
        updated = true;
      }

      const itemTotal = item.price * item.quantity;
      totalPrice += itemTotal;

      return {
        ...item._doc,
        total: itemTotal,
      };
    });

    if (updated) {
      cart.items = itemsWithTotal;
      cart.totalPrice = totalPrice;
      await cart.save();
    } else {
      cart.totalPrice = totalPrice;
    }

    //Group items by seller
    const groupedBySeller = {};

    for (const item of itemsWithTotal) {
      const product = item.productId;
      if (!product || !product.sellerId) continue;

      const sellerId = product.sellerId._id.toString();

      if (!groupedBySeller[sellerId]) {
        groupedBySeller[sellerId] = {
          sellerId,
          shopName: product.sellerId.shopName,
          shopImage: product.sellerId.shopImage,
          address: product.sellerId.address,
          phone: product.sellerId.phone,
          isOnline: product.sellerId.isOnline,
          items: [],
          sellerTotal: 0,
        };
      }

      groupedBySeller[sellerId].items.push(item);
      groupedBySeller[sellerId].sellerTotal += item.total;
    }

    // Convert object → array
    const sellers = Object.values(groupedBySeller);

      //Total cart quantity (sum of all item quantities)
    const cartItemCount = itemsWithTotal.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    res.status(200).json({
      success: true,
      cart: {
        sellers, // grouped by shop
        totalPrice,
        cartItemCount
      },
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



// exports.getCart = async (req, res) => {
//   try {
//     const userId = req.user._id;

//     let cart = await Cart.findOne({ userId })
//     .populate( 
//       "items.productId",
//       "name price image category quantity"
//     );

//     if (!cart) {
//       return res.status(200).json({
//         success: true,
//         message: "Empty cart",
//         cart: { items: [], totalPrice: 0 },
//       });
//     }

//     let updated = false;
//     let totalPrice = 0;

//     // Update item prices and calculate total per item
//     const itemsWithTotal = cart.items.map((item) => {
//       if (item.productId && item.price !== item.productId.price) {
//         item.price = item.productId.price;
//         updated = true;
//       }

//       const itemTotal = item.price * item.quantity;
//       totalPrice += itemTotal;

//       return {
//         ...item._doc, // include other item fields
//         total: itemTotal, // individual item total
//       };
//     });

//     if (updated) {
//       cart.items = itemsWithTotal;
//       cart.totalPrice = totalPrice;
//       await cart.save();
//     } else {
//       cart.totalPrice = totalPrice;
//     }

//     res
//       .status(200)
//       .json({ success: true, cart: { items: itemsWithTotal, totalPrice } });
//   } catch (error) {
//     console.error("Error fetching cart:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };


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



exports.addAllFavoritesToCart = async (req, res) => {
  try {
    const userId = req.user._id;

    // ✅ Get user and populate favorites
    const user = await User.findById(userId).populate("favorites");

    if (!user || user.favorites.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No favorite products found",
      });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [], totalPrice: 0 });
    }

    let addedCount = 0;

    for (const product of user.favorites) {
      if (!product) continue;

      // Check stock (if you store it as product.stock or product.quantity)
      if (product.stock !== undefined && product.stock <= 0) continue;

      // 🔍 Find if product already exists in the cart
      const existingItem = cart.items.find(
        (item) => item.productId.toString() === product._id.toString()
      );

      if (existingItem) {
        // ✅ Increase quantity, do not replace
        existingItem.quantity += 1;
      } else {
        // ✅ Add new product to cart
        cart.items.push({
          productId: product._id,
          quantity: 1,
          price: product.price,
        });
      }

      addedCount++;
    }

    // 🧮 Recalculate total price once
    cart.totalPrice = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    await cart.save();

    // 🧹 Clear favorites after adding successfully
    user.favorites = [];
    await user.save();

    res.status(200).json({
      success: true,
      message: `Added ${addedCount} favorite products to cart (existing items incremented) and cleared favorites.`,
      cart,
    });
  } catch (error) {
    console.error("Error adding all favorites to cart:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


