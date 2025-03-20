const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product', // Assuming you have a Product model
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
    }],
    totalAmount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['COMPLETED', 'RETURNED', 'CANCELED', 'IN PROGRESS'],
        default: 'IN PROGRESS',
    },
    paymentStatus: {
        type: String,
        enum: ['PENDING', 'PAID', 'FAILED'],
        default: 'PENDING',
    },
    orderDate: {
        type: Date,
        default: Date.now,
    },
    deliveryDate: {
        type: Date,
    },
    shippingAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
        required: true,
    },
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;