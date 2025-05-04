const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// Create a new product with image upload
const createProduct = async (req, res) => {
    try {
        const { name, category, price, description, stock, brand, userId } = req.body;

        // Create the product
        const product = new Product({
            userId,
            name,
            category,
            price,
            description,
            stock,
            brand,
        });
        await product.save();

        res.status(201).json({ message: 'Product created successfully', product });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(400).json({ message: 'Error creating product', error: error.message });
    }
};

//Get Product by Product Id
const getProductById = async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product', error: error.message });
    }
};

// Get all products
const getProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
};

// Get a single product by ID
const getProductByUserId = async (req, res) => {
    try {
        const { userId } = req.params; // Extract userId from request parameters
        const products = await Product.find({ userId: userId }); // Find products associated with the userId

        res.status(200).json(products); // Return the list of products
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
};

const addImagesInProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        console.log("Starting")

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        if (req.files.length > 5) {
            return res.status(400).json({ message: 'Maximum 5 images can be uploaded at once' });
        }

        // Find the product first
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Upload all images to Cloudinary
        const uploadPromises = req.files.map(file =>
            cloudinary.uploader.upload(file.path, {
                folder: 'product_images'
            })
        );

        const results = await Promise.all(uploadPromises);

        // Add all new image URLs to the product's pics_url array
        results.forEach(result => {
            product.pics_url.push(result.secure_url);
        });

        await product.save();

        // Delete all temporary files
        req.files.forEach(file => {
            fs.unlinkSync(file.path);
        });

        res.status(200).json({
            message: 'Images added successfully',
            product: product
        });
    } catch (error) {
        console.error('Error adding images to product:', error);
        res.status(500).json({ message: 'Error adding images to product', error: error.message });
    }
};

// Update a product
const updateProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const updateData = req.body;

        const product = await Product.findByIdAndUpdate(productId, updateData, { new: true });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ message: 'Product updated successfully', product });
    } catch (error) {
        res.status(400).json({ message: 'Error updating product', error: error.message });
    }
};

// Delete a product
const deleteProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await Product.findByIdAndDelete(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting product', error: error.message });
    }
};

module.exports = { createProduct, getProducts, getProductByUserId, getProductById, updateProduct, deleteProduct, addImagesInProduct };