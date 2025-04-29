const Order = require('../../models/Order');
const User = require('../../models/User');
const orderController = require('../../controllers/orderController');

// Mock dependencies
jest.mock('../../models/Order');
jest.mock('../../models/User');

describe('Order Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create a new order successfully', async () => {
      // Setup
      const mockOrder = {
        _id: 'order123',
        save: jest.fn().mockResolvedValue(true),
      };
      
      const mockUser = {
        _id: 'user123',
        orders: [],
        save: jest.fn().mockResolvedValue(true),
      };
      
      Order.mockImplementation(() => mockOrder);
      User.findById.mockResolvedValue(mockUser);
      
      req.body = {
        buyerId: 'user123',
        sellerId: 'seller123',
        items: [{ product: 'product123', quantity: 2 }],
        totalAmount: 199.98,
        shippingAddressId: 'address123',
      };

      // Execute
      await orderController.createOrder(req, res);

      // Assert
      expect(Order).toHaveBeenCalledWith(expect.objectContaining({
        buyer: 'user123',
        seller: 'seller123',
        items: [{ product: 'product123', quantity: 2 }],
        totalAmount: 199.98,
        shippingAddress: 'address123',
      }));
      expect(mockOrder.save).toHaveBeenCalled();
      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(mockUser.orders.push).toHaveBeenCalledWith(mockOrder._id);
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Order created successfully',
          order: mockOrder,
        })
      );
    });

    it('should handle errors during order creation', async () => {
      // Setup
      const errorMessage = 'Database connection failed';
      Order.mockImplementation(() => {
        throw new Error(errorMessage);
      });
      
      req.body = {
        buyerId: 'user123',
        sellerId: 'seller123',
        items: [{ product: 'product123', quantity: 2 }],
        totalAmount: 199.98,
        shippingAddressId: 'address123',
      };

      // Execute
      await orderController.createOrder(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Error creating order',
          error: errorMessage,
        })
      );
    });
  });

  describe('getUserOrders', () => {
    it('should return all orders for a user', async () => {
      // Setup
      const userId = 'user123';
      const mockOrders = [
        { _id: 'order1', buyer: userId },
        { _id: 'order2', buyer: userId },
      ];
      
      req.params.userId = userId;
      
      Order.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockOrders),
        }),
      });

      // Execute
      await orderController.getUserOrders(req, res);

      // Assert
      expect(Order.find).toHaveBeenCalledWith({ buyer: userId });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockOrders);
    });

    it('should handle errors when fetching orders', async () => {
      // Setup
      const errorMessage = 'Database error';
      req.params.userId = 'user123';
      
      Order.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockRejectedValue(new Error(errorMessage)),
        }),
      });

      // Execute
      await orderController.getUserOrders(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Error fetching orders',
          error: errorMessage,
        })
      );
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status successfully', async () => {
      // Setup
      const orderId = 'order123';
      const updatedOrder = {
        _id: orderId,
        status: 'COMPLETED',
        paymentStatus: 'PAID',
        returnReason: null,
      };
      
      req.params.orderId = orderId;
      req.body = {
        status: 'COMPLETED',
        paymentStatus: 'PAID',
      };
      
      Order.findByIdAndUpdate.mockResolvedValue(updatedOrder);

      // Execute
      await orderController.updateOrderStatus(req, res);

      // Assert
      expect(Order.findByIdAndUpdate).toHaveBeenCalledWith(
        orderId,
        { status: 'COMPLETED', paymentStatus: 'PAID' },
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Order status updated successfully',
          order: updatedOrder,
        })
      );
    });

    it('should return 404 when order not found', async () => {
      // Setup
      req.params.orderId = 'nonexistent';
      req.body = { status: 'COMPLETED' };
      
      Order.findByIdAndUpdate.mockResolvedValue(null);

      // Execute
      await orderController.updateOrderStatus(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Order not found',
        })
      );
    });
  });

  describe('deleteOrder', () => {
    it('should delete an order successfully', async () => {
      // Setup
      const orderId = 'order123';
      const buyerId = 'user123';
      
      const mockOrder = {
        _id: orderId,
        buyer: buyerId,
      };
      
      const mockUser = {
        _id: buyerId,
        orders: [orderId],
        save: jest.fn().mockResolvedValue(true),
      };
      
      req.params.orderId = orderId;
      
      Order.findById.mockResolvedValue(mockOrder);
      User.findById.mockResolvedValue(mockUser);
      Order.findByIdAndDelete.mockResolvedValue(mockOrder);

      // Execute
      await orderController.deleteOrder(req, res);

      // Assert
      expect(Order.findById).toHaveBeenCalledWith(orderId);
      expect(User.findById).toHaveBeenCalledWith(buyerId);
      expect(mockUser.orders.pull).toHaveBeenCalledWith(orderId);
      expect(mockUser.save).toHaveBeenCalled();
      expect(Order.findByIdAndDelete).toHaveBeenCalledWith(orderId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Order deleted successfully',
        })
      );
    });

    it('should return 404 when order not found', async () => {
      // Setup
      req.params.orderId = 'nonexistent';
      Order.findById.mockResolvedValue(null);

      // Execute
      await orderController.deleteOrder(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Order not found',
        })
      );
    });
  });
});