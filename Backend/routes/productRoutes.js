const express = require('express');
const { createProduct, getProducts, getProductByUserId, updateProduct, deleteProduct, getProductById } = require('../controllers/productController');
const upload = require('../config/multer');

const router = express.Router();

// POST /products - Create a new product with image upload
router.post('/', upload.array('images', 5), createProduct); // 'images' is the field name, max 5 files
// GET /products - Get all products
router.get('/', getProducts);
// GET /products/:userId - Get products by User ID
router.get('/user/:userId', getProductByUserId);
// PUT /products/:productId - Update a product
router.put('/:productId', updateProduct);
// PUT /products/:productId - getProductById
router.get('/:productId', getProductById);
// DELETE /products/:productId - Delete a product
router.delete('/:productId', deleteProduct);

module.exports = router;