const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const User = require('../../models/User');
const Product = require('../../models/Product');
require('../setup');

describe('API Integration Tests', () => {
    let token, userId, productId;

    beforeEach(async () => {
        // Create a test user and get token
        const userData = {
            name: 'Integration Test User',
            username: 'integrationtestuser',
            email: 'integrationtest@example.com',
            password: 'password123'
        };

        // Register user
        const registerResponse = await request(app)
            .post('/users/register')
            .send(userData);

        // Login to get token
        const loginResponse = await request(app)
            .post('/users/login')
            .send({
                email: userData.email,
                password: userData.password
            });

        token = loginResponse.body.token;
        userId = loginResponse.body.user._id;

        // Create a test product
        const productData = {
            name: 'Integration Test Product',
            description: 'Product for integration tests',
            price: 39.99,
            category: ['Electronics'],
            stock: 20
        };

        const productResponse = await request(app)
            .post('/products')
            .set('Authorization', `Bearer ${token}`)
            .send(productData);

        productId = productResponse.body.product._id;
    });

    test('GET /products should return all products', async () => {
        const response = await request(app)
            .get('/products');

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0].name).toBeDefined();
    });

    test('GET /products/:id should return a single product', async () => {
        const response = await request(app)
            .get(`/products/${productId}`);

        expect(response.status).toBe(200);
        expect(response.body.name).toBe('Integration Test Product');
        expect(response.body.price).toBe(39.99);
    });

    test('POST /addresses should create a new address', async () => {
        const addressData = {
            name: 'Home Address',
            phoneNumber: '1234567890',
            addressLine1: '123 Integration St',
            city: 'Integration City',
            state: 'Integration State',
            postalCode: '12345',
            country: 'Integration Country',
            isDefault: true,
            type: 'home'
        };

        const response = await request(app)
            .post('/addresses')
            .set('Authorization', `Bearer ${token}`)
            .send(addressData);

        expect(response.status).toBe(201);
        expect(response.body.address.addressLine1).toBe(addressData.addressLine1);
        expect(response.body.address.city).toBe(addressData.city);
        expect(response.body.address.user.toString()).toBe(userId);
    });

    test('POST /orders should create a new order', async () => {
        // First create an address to use for shipping
        const addressData = {
            name: 'Order Address',
            phoneNumber: '9876543210',
            addressLine1: '123 Order St',
            city: 'Order City',
            state: 'Order State',
            postalCode: '12345',
            country: 'Order Country',
            isDefault: true,
            type: 'home'
        };

        const addressResponse = await request(app)
            .post('/addresses')
            .set('Authorization', `Bearer ${token}`)
            .send(addressData);

        const addressId = addressResponse.body.address._id;

        // Now create an order
        const orderData = {
            buyer: userId,
            seller: userId, // Using the same user as seller for testing
            items: [
                {
                    product: productId,
                    quantity: 2
                }
            ],
            shippingAddress: addressId,
            totalAmount: 79.98
        };

        const response = await request(app)
            .post('/orders')
            .set('Authorization', `Bearer ${token}`)
            .send(orderData);

        expect(response.status).toBe(201);
        expect(response.body.order.buyer.toString()).toBe(userId);
        expect(response.body.order.totalAmount).toBe(orderData.totalAmount);
        expect(response.body.order.status).toBe('IN PROGRESS');
    });
}); 