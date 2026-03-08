const Product = require('../models/product');

exports.getProducts = async (req, res) => {
  try {
    const results = await Product.getAll();
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { productName, price, imageUrl } = req.body;
    const newProduct = await Product.create({ productName, price, imageUrl });
    res.status(201).json({
      message: "Product added",
      product: newProduct
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};