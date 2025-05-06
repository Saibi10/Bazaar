const User = require('../../models/User');
const { createUser, loginUser, getUser, getUserById } = require('../../controllers/userController');
const { generateToken } = require('../../config/jwtUtils');
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

describe('User Controller Tests', () => {
    test('createUser should create a new user', async () => {
        const req = mockRequest({
            name: 'Test User',
            username: 'createtestuser',
            email: 'createtest@example.com',
            password: 'password123'
        });

        const res = mockResponse();

        await createUser(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'User created successfully',
                user: expect.any(Object)
            })
        );

        // Verify user was actually created in DB
        const user = await User.findOne({ email: 'createtest@example.com' });
        expect(user).toBeTruthy();
        expect(user.name).toBe('Test User');
    });

    test('loginUser should login a user with valid credentials', async () => {
        // First create a test user
        const testUser = new User({
            name: 'Login Test User',
            username: 'logintestuser',
            email: 'logintest@example.com',
            password: 'loginpassword123'
        });
        await testUser.save();

        const req = mockRequest({
            email: 'logintest@example.com',
            password: 'loginpassword123'
        });

        const res = mockResponse();

        await loginUser(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Login successful',
                token: expect.any(String),
                user: expect.any(Object)
            })
        );
    });

    test('loginUser should reject invalid credentials', async () => {
        // Create a test user
        const testUser = new User({
            name: 'Invalid Login Test User',
            username: 'invalidlogintestuser',
            email: 'invalidlogintest@example.com',
            password: 'correctpassword123'
        });
        await testUser.save();

        const req = mockRequest({
            email: 'invalidlogintest@example.com',
            password: 'wrongpassword123' // Wrong password
        });

        const res = mockResponse();

        await loginUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Invalid email or password'
            })
        );
    });

    test('getUser should fetch user by ID from token', async () => {
        // Create a user
        const testUser = new User({
            name: 'Get User Test',
            username: 'getusertestuser',
            email: 'getusertest@example.com',
            password: 'password123'
        });
        await testUser.save();

        const req = mockRequest({}, {}, testUser._id);
        const res = mockResponse();

        await getUser(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'User fetched successfully',
                user: expect.objectContaining({
                    name: 'Get User Test',
                    email: 'getusertest@example.com'
                })
            })
        );
    });
}); 