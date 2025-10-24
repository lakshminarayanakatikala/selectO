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
    if (!name || !description || !price || !stock || !category ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
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
