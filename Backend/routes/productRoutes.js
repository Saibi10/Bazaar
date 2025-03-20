const express = require('express');
const { createProduct, getProducts, getProductById, updateProduct, deleteProduct } = require('../controllers/productController');
const upload = require('../config/multer');

const router = express.Router();

// POST /products - Create a new product with image upload
router.post('/', upload.array('images', 5), createProduct); // 'images' is the field name, max 5 files
// GET /products - Get all products
router.get('/', getProducts);
// GET /products/:productId - Get a single product by ID
router.get('/:productId', getProductById);
// PUT /products/:productId - Update a product
router.put('/:productId', updateProduct);
// DELETE /products/:productId - Delete a product
router.delete('/:productId', deleteProduct);

module.exports = router;