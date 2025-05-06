const Product = require('../../models/Product');
const User = require('../../models/User');
const {
    createProduct,
    getProducts,
    getProductById,
    updateProductById,
    deleteProductById
} = require('../../controllers/productController');
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

describe('Product Controller Tests', () => {
    let userId;

    beforeEach(async () => {
        // Create a seller user for the tests
        const sellerUser = new User({
            name: 'Seller Test User',
            username: 'sellertestuser',
            email: 'sellertest@example.com',
            password: 'sellerpassword123'
        });
        await sellerUser.save();
        userId = sellerUser._id;
    });

    test('createProduct should create a new product', async () => {
        const req = mockRequest({
            name: 'Test Product',
            description: 'This is a test product',
            price: 29.99,
            category: ['Electronics'],
            stock: 10,
            brand: 'Test Brand'
        }, {}, userId);

        const res = mockResponse();

        await createProduct(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                message: expect.any(String),
                product: expect.objectContaining({
                    name: 'Test Product',
                    price: 29.99,
                    userId: userId
                })
            })
        );

        // Verify product was created in DB
        const products = await Product.find({ name: 'Test Product' });
        expect(products.length).toBeGreaterThan(0);
    });

    test('getProducts should fetch all products', async () => {
        // Create some test products
        await Product.create([
            {
                userId: userId,
                name: 'Product 1',
                description: 'Description 1',
                price: 19.99,
                category: ['Beauty'],
                stock: 5
            },
            {
                userId: userId,
                name: 'Product 2',
                description: 'Description 2',
                price: 29.99,
                category: ['Fashion'],
                stock: 10
            }
        ]);

        const req = mockRequest();
        const res = mockResponse();

        await getProducts(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({
                    name: 'Product 1',
                    price: 19.99
                }),
                expect.objectContaining({
                    name: 'Product 2',
                    price: 29.99
                })
            ])
        );
    });

    test('getProductById should fetch a product by ID', async () => {
        // Create a test product
        const product = await Product.create({
            userId: userId,
            name: 'Test Product For ID',
            description: 'Description',
            price: 19.99,
            category: ['Toys'],
            stock: 5
        });

        const req = mockRequest({}, { id: product._id });
        const res = mockResponse();

        await getProductById(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'Test Product For ID',
                price: 19.99
            })
        );
    });
}); 