const authMiddleware = require('../../config/authMiddleware');
const { generateToken } = require('../../config/jwtUtils');
const mongoose = require('mongoose');
require('../setup');

describe('Auth Middleware Tests', () => {
    let userId, validToken, mockReq, mockRes, mockNext;

    beforeEach(() => {
        userId = new mongoose.Types.ObjectId().toString();
        validToken = generateToken(userId);

        mockReq = {
            headers: {}
        };

        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        mockNext = jest.fn();
    });

    test('should pass with valid token in authorization header', () => {
        mockReq.headers.authorization = `Bearer ${validToken}`;

        authMiddleware(mockReq, mockRes, mockNext);

        expect(mockReq.userId).toBe(userId);
        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
    });

    test('should fail without authorization header', () => {
        // No authorization header set

        authMiddleware(mockReq, mockRes, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith(
            expect.objectContaining({
                message: expect.stringContaining('No token provided')
            })
        );
    });

    test('should fail with improperly formatted authorization header', () => {
        mockReq.headers.authorization = validToken; // Missing 'Bearer' prefix

        authMiddleware(mockReq, mockRes, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith(
            expect.objectContaining({
                message: expect.any(String)
            })
        );
    });

    test('should fail with invalid token', () => {
        mockReq.headers.authorization = 'Bearer invalidtoken';

        authMiddleware(mockReq, mockRes, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith(
            expect.objectContaining({
                message: expect.stringContaining('Invalid token')
            })
        );
    });
}); 