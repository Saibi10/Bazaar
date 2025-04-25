const express = require('express');
const { createProduct, getProducts, getProductByUserId, updateProduct, deleteProduct, getProductById, addImagesInProduct } = require('../controllers/productController');
const upload = require('../config/multer');

const router = express.Router();

// POST /products - Create a new product with image upload
router.post('/', createProduct);
// PATCH /products/:productId/images - Add images to a product
router.put('/:productId/images', upload.array('images', 5), addImagesInProduct);
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