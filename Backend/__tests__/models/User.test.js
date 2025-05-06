const User = require('../../models/User');
const mongoose = require('mongoose');
require('../setup');

describe('User Model Tests', () => {
    test('should create a new user successfully', async () => {
        const userData = {
            name: 'Test User',
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
        };

        const user = new User(userData);
        const savedUser = await user.save();

        // Check that the user was created with correct fields
        expect(savedUser._id).toBeDefined();
        expect(savedUser.name).toBe(userData.name);
        expect(savedUser.username).toBe(userData.username);
        expect(savedUser.email).toBe(userData.email);
        // Password should be hashed
        expect(savedUser.password).not.toBe(userData.password);
        // Default role should be 'user'
        expect(savedUser.role).toBe('user');
    });

    test('should fail validation when required fields are missing', async () => {
        const invalidUser = new User({
            name: 'Test User',
            // Missing username, email and password
        });

        let validationError;
        try {
            await invalidUser.save();
        } catch (error) {
            validationError = error;
        }

        expect(validationError).toBeDefined();
        expect(validationError.name).toBe('ValidationError');
        expect(validationError.errors.username).toBeDefined();
        expect(validationError.errors.email).toBeDefined();
        expect(validationError.errors.password).toBeDefined();
    });

    test('should correctly compare passwords', async () => {
        const userData = {
            name: 'Password Test User',
            username: 'pwdtestuser',
            email: 'pwdtest@example.com',
            password: 'correctPassword123',
        };

        const user = new User(userData);
        await user.save();

        // Test with correct password
        const isCorrectPassword = await user.comparePassword('correctPassword123');
        expect(isCorrectPassword).toBe(true);

        // Test with wrong password
        const isWrongPassword = await user.comparePassword('wrongPassword123');
        expect(isWrongPassword).toBe(false);
    });
}); 