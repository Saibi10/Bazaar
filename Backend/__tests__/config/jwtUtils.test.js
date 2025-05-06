const { generateToken, verifyToken } = require('../../config/jwtUtils');
const mongoose = require('mongoose');
require('../setup');

describe('JWT Utilities Tests', () => {
    let userId;

    beforeEach(() => {
        userId = new mongoose.Types.ObjectId().toString();
    });

    test('should generate a valid JWT token', () => {
        const token = generateToken(userId);

        expect(token).toBeDefined();
        expect(typeof token).toBe('string');
        expect(token.split('.').length).toBe(3); // JWT has 3 parts: header, payload, signature
    });

    test('should verify a valid token correctly', () => {
        const token = generateToken(userId);
        const decoded = verifyToken(token);

        expect(decoded).toBeDefined();
        expect(decoded.userId).toBe(userId);
        expect(decoded.exp).toBeDefined(); // Should have an expiration
    });

    test('should throw error when verifying an invalid token', () => {
        const invalidToken = 'invalid.token.string';

        expect(() => {
            verifyToken(invalidToken);
        }).toThrow();
    });

    test('should throw error when verifying a tampered token', () => {
        const token = generateToken(userId);
        const parts = token.split('.');

        // Tamper with the middle section (payload)
        const tamperedToken = `${parts[0]}.${parts[1]}abc.${parts[2]}`;

        expect(() => {
            verifyToken(tamperedToken);
        }).toThrow();
    });
}); 