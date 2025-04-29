const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../../config/jwtUtils');
const userController = require('../../controllers/userController');

// Mock dependencies
jest.mock('../../models/User');
jest.mock('bcryptjs');
jest.mock('../../config/jwtUtils');

describe('User Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      userId: 'user123', // For authenticated routes
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      // Setup
      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        save: jest.fn().mockResolvedValue(true),
      };
      
      User.mockImplementation(() => mockUser);
      
      req.body = {
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      // Execute
      await userController.createUser(req, res);

      // Assert
      expect(User).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      }));
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User created successfully',
          user: mockUser,
        })
      );
    });

    it('should handle errors during user creation', async () => {
      // Setup
      const errorMessage = 'Email already exists';
      User.mockImplementation(() => {
        throw new Error(errorMessage);
      });
      
      req.body = {
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      // Execute
      await userController.createUser(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Error creating user',
          error: errorMessage,
        })
      );
    });
  });

  describe('getUser', () => {
    it('should return user details for authenticated user', async () => {
      // Setup
      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
      };
      
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      // Execute
      await userController.getUser(req, res);

      // Assert
      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User fetched successfully',
          user: mockUser,
        })
      );
    });

    it('should return 404 when user not found', async () => {
      // Setup
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      // Execute
      await userController.getUser(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User not found',
        })
      );
    });

    it('should handle errors when fetching user', async () => {
      // Setup
      const errorMessage = 'Database error';
      User.findById.mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error(errorMessage)),
      });

      // Execute
      await userController.getUser(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Error fetching user',
          error: errorMessage,
        })
      );
    });
  });

  describe('loginUser', () => {
    it('should login user successfully with valid credentials', async () => {
      // Setup
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        comparePassword: jest.fn().mockResolvedValue(true),
      };
      
      const mockToken = 'jwt-token-123';
      
      User.findOne.mockResolvedValue(mockUser);
      generateToken.mockReturnValue(mockToken);
      
      req.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      // Execute
      await userController.loginUser(req, res);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(mockUser.comparePassword).toHaveBeenCalledWith('password123');
      expect(generateToken).toHaveBeenCalledWith('user123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Login successful',
          token: mockToken,
          user: mockUser,
        })
      );
    });

    it('should return 400 when user not found', async () => {
      // Setup
      User.findOne.mockResolvedValue(null);
      
      req.body = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      // Execute
      await userController.loginUser(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid email or password',
        })
      );
    });

    it('should return 400 when password is incorrect', async () => {
      // Setup
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        comparePassword: jest.fn().mockResolvedValue(false),
      };
      
      User.findOne.mockResolvedValue(mockUser);
      
      req.body = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      // Execute
      await userController.loginUser(req, res);

      // Assert
      expect(mockUser.comparePassword).toHaveBeenCalledWith('wrongpassword');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid email or password',
        })
      );
    });

    it('should handle errors during login', async () => {
      // Setup
      const errorMessage = 'Database error';
      User.findOne.mockRejectedValue(new Error(errorMessage));
      
      req.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      // Execute
      await userController.loginUser(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Error logging in',
          error: errorMessage,
        })
      );
    });
  });
});