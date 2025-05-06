const Order = require('../../models/Order');
const mongoose = require('mongoose');
require('../setup');

describe('Order Model Tests', () => {
    test('should create an order with valid data', async () => {
        const orderData = {
            buyer: new mongoose.Types.ObjectId(),
            seller: new mongoose.Types.ObjectId(),
            items: [
                {
                    product: new mongoose.Types.ObjectId(),
                    quantity: 2
                },
                {
                    product: new mongoose.Types.ObjectId(),
                    quantity: 1
                }
            ],
            shippingAddress: new mongoose.Types.ObjectId(),
            totalAmount: 79.97,
            status: 'IN PROGRESS'
        };

        const order = new Order(orderData);
        const savedOrder = await order.save();

        expect(savedOrder._id).toBeDefined();
        expect(savedOrder.buyer).toEqual(orderData.buyer);
        expect(savedOrder.seller).toEqual(orderData.seller);
        expect(savedOrder.items.length).toBe(2);
        expect(savedOrder.totalAmount).toBe(orderData.totalAmount);
        expect(savedOrder.status).toBe('IN PROGRESS');
        expect(savedOrder.paymentStatus).toBe('PENDING');
        expect(savedOrder.orderDate).toBeDefined();
    });

    test('should fail validation when required fields are missing', async () => {
        const invalidOrder = new Order({
            status: 'IN PROGRESS'
        });

        let validationError;
        try {
            await invalidOrder.save();
        } catch (error) {
            validationError = error;
        }

        expect(validationError).toBeDefined();
        expect(validationError.name).toBe('ValidationError');
        expect(validationError.errors.buyer).toBeDefined();
        expect(validationError.errors.seller).toBeDefined();
        expect(validationError.errors.items).toBeDefined();
        expect(validationError.errors.shippingAddress).toBeDefined();
        expect(validationError.errors.totalAmount).toBeDefined();
    });

    test('should only accept valid order statuses', async () => {
        const invalidStatusOrder = new Order({
            buyer: new mongoose.Types.ObjectId(),
            seller: new mongoose.Types.ObjectId(),
            items: [
                {
                    product: new mongoose.Types.ObjectId(),
                    quantity: 1
                }
            ],
            shippingAddress: new mongoose.Types.ObjectId(),
            totalAmount: 19.99,
            status: 'INVALID_STATUS'
        });

        let validationError;
        try {
            await invalidStatusOrder.save();
        } catch (error) {
            validationError = error;
        }

        expect(validationError).toBeDefined();
        expect(validationError.name).toBe('ValidationError');
        expect(validationError.errors.status).toBeDefined();
    });
}); 