const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    pics_url: [{
        type: String,
    }],
    category: [{
        type: String,
        enum: ['Beauty', 'Fashion', 'Toys', 'Style', 'Clothing', 'Electronics', 'Eome', 'Sports', 'Other'],
        required: true,
    }],
    price: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
    },
    stock: {
        type: Number,
        required: true,
        default: 0,
    },
    brand: {
        type: String,
    },
    ratings: {
        type: Number,
        default: 0,
    },
    reviews: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        comment: String,
        rating: Number,
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;