const Product = require("../models/ProductModel");

// Add new product 
exports.addProduct = async (req, res) => {
  try {
    const {
      sellerId,
      name,
      description,
      price,
      stock,
      rating,
      quantitie,
      category,
      images,
    } = req.body;

    // Validation
    if (!name || !description || !price || !stock || !category || !sellerId) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required"});
    }

    if (images && images.length > 4) {
      return res
        .status(400)
        .json({
          success: false,
          message: "You can upload up to 4 images only",
        });
    }

    const newProduct = new Product({
      sellerId,
      name,
      description,
      price,
      stock,
      rating,
      quantitie,
      category,
      images: images || [],
    });

    await newProduct.save();
    res
      .status(201)
      .json({ message: "Product added successfully", product: newProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    if(products.length > 0){
        res.status(200).json({ success: true, products: products });
    }else{
        res.status(202).json({ success : false ,message : 'Products array is empty'});

    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};



//  DELETE — remove a product by ID
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.seller._id; // from authMiddleware

    const product = await Product.findOneAndDelete({ _id: id, sellerId });

    if (!product) {
      return res
        .status(404)
        .json({ message: "Product not found or not authorized to delete" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT — update product details (name, price, description, etc.)
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.seller._id;

    const updatedFields = req.body; // allow partial or full updates

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: id, sellerId },
      { $set: updatedFields },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res
        .status(404)
        .json({ message: "Product not found or not authorized to update" });
    }

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH — toggle product stock availability (true/false)
exports.toggleStock = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.seller._id;

    const product = await Product.findOne({ _id: id, sellerId });
    if (!product) {
      return res
        .status(404)
        .json({ message: "Product not found or not authorized" });
    }

    // Flip stock status (true -> false, false -> true)
    product.stock = !product.stock;
    await product.save();

    res.status(200).json({
      message: `Stock status updated to ${
        product.stock ? "In Stock" : "Out of Stock"
      }`,
      product,
    });
  } catch (error) {
    console.error("Error toggling stock:", error);
    res.status(500).json({ message: "Server error" });
  }
};
