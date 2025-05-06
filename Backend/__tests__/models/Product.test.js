const Product = require('../../models/Product');
const mongoose = require('mongoose');
require('../setup');

describe('Product Model Tests', () => {
    test('should create a product with valid data', async () => {
        const productData = {
            userId: new mongoose.Types.ObjectId(),
            name: 'Test Product',
            description: 'This is a test product',
            price: 19.99,
            category: ['Electronics'],
            pics_url: ['testimage1.jpg', 'testimage2.jpg'],
            stock: 10,
            brand: 'Test Brand'
        };

        const product = new Product(productData);
        const savedProduct = await product.save();

        expect(savedProduct._id).toBeDefined();
        expect(savedProduct.name).toBe(productData.name);
        expect(savedProduct.price).toBe(productData.price);
        expect(savedProduct.category[0]).toBe(productData.category[0]);
        expect(savedProduct.stock).toBe(productData.stock);
        expect(savedProduct.pics_url.length).toBe(2);
        expect(savedProduct.createdAt).toBeDefined();
        expect(savedProduct.updatedAt).toBeDefined();
    });

    test('should fail validation when required fields are missing', async () => {
        const invalidProduct = new Product({
            name: 'Invalid Product',
            // Missing other required fields
        });

        let validationError;
        try {
            await invalidProduct.save();
        } catch (error) {
            validationError = error;
        }

        expect(validationError).toBeDefined();
        expect(validationError.name).toBe('ValidationError');
        expect(validationError.errors.userId).toBeDefined();
        expect(validationError.errors.category).toBeDefined();
        expect(validationError.errors.price).toBeDefined();
    });

    test('should enforce category to be from allowed values', async () => {
        const invalidCategoryProduct = new Product({
            userId: new mongoose.Types.ObjectId(),
            name: 'Invalid Category Product',
            description: 'This product has an invalid category',
            price: 10.99,
            category: ['InvalidCategory'], // Invalid category
            stock: 5
        });

        let validationError;
        try {
            await invalidCategoryProduct.save();
        } catch (error) {
            validationError = error;
        }

        expect(validationError).toBeDefined();
        expect(validationError.name).toBe('ValidationError');
        expect(validationError.errors.category).toBeDefined();
    });
}); 