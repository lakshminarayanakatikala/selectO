const Product = require("../models/ProductModel");
const Seller = require("../models/SellerModel");
const XLSX = require("xlsx");

// Add new product 
exports.addProduct = async (req, res) => {
  try {
    const sellerId = req.seller._id;
    const {
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
      images: images ,
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

// Get all products  -- particular seller

exports.getProducts = async (req, res) => {
  try {
    const sellerId = req.seller._id; // from authMiddleware

    // Find products only for this seller
    const products = await Product.find({ sellerId }).sort({ createdAt: -1 });

    if (products.length > 0) {
      res.status(200).json({
        success: true,
        count: products.length,
        products,
      });
    } else {
      res.status(202).json({
        success: false,
        message: "No products found for this seller",
      });
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



///add items using xl sheet

exports.uploadProducts = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Read Excel file
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const sellerId = req.seller._id; // from middleware

    // Prepare data
    const formattedData = data.map((item) => ({
      ...item,
      sellerId,
      image: item.image ? item.image.split(",").map((url) => url.trim()) : [],
    }));

    // 🛠 Insert all products for this seller
    const insertedProducts = await Product.insertMany(formattedData);

    // Extract product IDs
    const productIds = insertedProducts.map((product) => product._id);

    // 🔗 Update seller to include all new products
    await Seller.findByIdAndUpdate(
      sellerId,
      { $push: { products: { $each: productIds } } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Products uploaded successfully and linked to seller",
      count: insertedProducts.length,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, error: error.message });
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

    // Remove the product reference from Seller's products array
    await Seller.findByIdAndUpdate(
      sellerId,
      { $pull: { products: product._id } }, // remove product id
      { new: true }
    );

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
