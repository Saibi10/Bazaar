const express = require('express');
const { createOrder, getUserOrders, updateOrderStatus, deleteOrder } = require('../controllers/orderController');

const router = express.Router();

// POST /orders - Create a new order
router.post('/', createOrder);
// GET /orders/:userId - Get all orders for a user
router.get('/:userId', getUserOrders);
// PUT /orders/:orderId - Update an order status
router.put('/:orderId', updateOrderStatus);
// DELETE /orders/:orderId - Delete an order
router.delete('/:orderId', deleteOrder);

module.exports = router;