const Order = require('../../models/Order');
const User = require('../../models/User');
const Product = require('../../models/Product');
const Address = require('../../models/Address');
const {
    createOrder,
    getUserOrders,
    getOrderById,
    updateOrderStatus
} = require('../../controllers/orderController');
const mongoose = require('mongoose');
require('../setup');

// Mock Express request and response objects
const mockRequest = (body = {}, params = {}, userId = null) => {
    const req = { body, params };
    if (userId) req.userId = userId;
    return req;
};

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('Order Controller Tests', () => {
    let userId, sellerId, productId, addressId;

    beforeEach(async () => {
        // Create test user (buyer)
        const user = new User({
            name: 'Order Test User',
            username: 'ordertestuser',
            email: 'ordertest@example.com',
            password: 'orderpassword123'
        });
        await user.save();
        userId = user._id;

        // Create test seller
        const seller = new User({
            name: 'Order Test Seller',
            username: 'ordertestseller',
            email: 'ordertestseller@example.com',
            password: 'sellerpassword123'
        });
        await seller.save();
        sellerId = seller._id;

        // Create test product
        const product = new Product({
            userId: sellerId,
            name: 'Order Test Product',
            description: 'Test product for orders',
            price: 29.99,
            category: ['Electronics'],
            stock: 10
        });
        await product.save();
        productId = product._id;

        // Create test address
        const address = new Address({
            user: userId,
            name: 'Order Shipping Address',
            phoneNumber: '1234567890',
            addressLine1: '123 Test St',
            city: 'Test City',
            state: 'Test State',
            postalCode: '12345',
            country: 'Test Country',
            isDefault: true,
            type: 'home'
        });
        await address.save();
        addressId = address._id;
    });

    test('createOrder should create a new order', async () => {
        const req = mockRequest({
            buyer: userId,
            seller: sellerId,
            items: [
                {
                    product: productId,
                    quantity: 2
                }
            ],
            shippingAddress: addressId,
            totalAmount: 59.98
        }, {}, userId);

        const res = mockResponse();

        await createOrder(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                message: expect.any(String),
                order: expect.objectContaining({
                    buyer: expect.anything(),
                    seller: expect.anything(),
                    totalAmount: 59.98,
                    status: 'IN PROGRESS'
                })
            })
        );

        // Verify order was created in DB
        const orders = await Order.find({ buyer: userId });
        expect(orders.length).toBe(1);
    });

    test('getUserOrders should fetch all orders for a user', async () => {
        // Create test orders
        await Order.create([
            {
                buyer: userId,
                seller: sellerId,
                items: [
                    {
                        product: productId,
                        quantity: 1
                    }
                ],
                shippingAddress: addressId,
                totalAmount: 29.99,
                status: 'IN PROGRESS'
            },
            {
                buyer: userId,
                seller: sellerId,
                items: [
                    {
                        product: productId,
                        quantity: 2
                    }
                ],
                shippingAddress: addressId,
                totalAmount: 59.98,
                status: 'COMPLETED'
            }
        ]);

        const req = mockRequest({}, {}, userId);
        const res = mockResponse();

        await getUserOrders(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({
                    buyer: userId,
                    totalAmount: 29.99,
                    status: 'IN PROGRESS'
                }),
                expect.objectContaining({
                    buyer: userId,
                    totalAmount: 59.98,
                    status: 'COMPLETED'
                })
            ])
        );
    });
}); 