const Order = require('../models/Order');
const User = require('../models/User');

// Create a new order
const createOrder = async (req, res) => {
    try {
        const { buyerId, sellerId, items, totalAmount, shippingAddressId } = req.body;

        const order = new Order({
            buyer: buyerId,
            seller: sellerId,
            items,
            totalAmount,
            shippingAddress: shippingAddressId,
        });
        await order.save();

        // Add the order to the buyer's orders array
        const buyer = await User.findById(buyerId);
        buyer.orders.push(order._id);
        await buyer.save();

        res.status(201).json({ message: 'Order created successfully', order });
    } catch (error) {
        res.status(400).json({ message: 'Error creating order', error: error.message });
    }
};

// Get all orders for a user
const getUserOrders = async (req, res) => {
    try {
        const { userId } = req.params;
        const orders = await Order.find({ buyer: userId }).populate('items.product').populate('shippingAddress');
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
};

// Update an order status
const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json({ message: 'Order status updated successfully', order });
    } catch (error) {
        res.status(400).json({ message: 'Error updating order status', error: error.message });
    }
};

// Delete an order
const deleteOrder = async (req, res) => {
    try {
        const { orderId } = req.params;

        // Remove the order from the buyer's orders array
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const buyer = await User.findById(order.buyer);
        buyer.orders.pull(orderId);
        await buyer.save();

        // Delete the order
        await Order.findByIdAndDelete(orderId);

        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting order', error: error.message });
    }
};

module.exports = { createOrder, getUserOrders, updateOrderStatus, deleteOrder };