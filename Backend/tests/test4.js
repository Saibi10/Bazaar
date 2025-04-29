const Address = require('../../models/Address');
const User = require('../../models/User');
const addressController = require('../../controllers/addressController');

// Mock dependencies
jest.mock('../../models/Address');
jest.mock('../../models/User');

describe('Address Controller', () => {
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

  describe('createAddress', () => {
    it('should create a new address successfully', async () => {
      // Setup
      const mockAddress = {
        _id: 'address123',
        user: 'user123',
        type: 'home',
        name: 'John Doe',
        phoneNumber: '1234567890',
        addressLine1: '123 Main St',
        city: 'Anytown',
        state: 'State',
        postalCode: '12345',
        country: 'Country',
        isDefault: true,
        save: jest.fn().mockResolvedValue(true),
      };
      
      const mockUser = {
        _id: 'user123',
        addresses: [],
        save: jest.fn().mockResolvedValue(true),
      };
      
      Address.mockImplementation(() => mockAddress);
      User.findById.mockResolvedValue(mockUser);
      
      req.body = {
        userId: 'user123',
        type: 'home',
        name: 'John Doe',
        phoneNumber: '1234567890',
        addressLine1: '123 Main St',
        city: 'Anytown',
        state: 'State',
        postalCode: '12345',
        country: 'Country',
        isDefault: true,
      };

      // Execute
      await addressController.createAddress(req, res);

      // Assert
      expect(Address).toHaveBeenCalledWith(expect.objectContaining({
        user: 'user123',
        type: 'home',
        name: 'John Doe',
        phoneNumber: '1234567890',
        addressLine1: '123 Main St',
      }));
      expect(mockAddress.save).toHaveBeenCalled();
      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(mockUser.addresses.push).toHaveBeenCalledWith(mockAddress._id);
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Address created successfully',
          address: mockAddress,
        })
      );
    });

    it('should handle errors during address creation', async () => {
      // Setup
      const errorMessage = 'Database connection failed';
      Address.mockImplementation(() => {
        throw new Error(errorMessage);
      });
      
      req.body = {
        userId: 'user123',
        type: 'home',
        name: 'John Doe',
        phoneNumber: '1234567890',
        addressLine1: '123 Main St',
      };

      // Execute
      await addressController.createAddress(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Error creating address',
          error: errorMessage,
        })
      );
    });
  });

  describe('getUserAddresses', () => {
    it('should return all addresses for a user', async () => {
      // Setup
      const userId = 'user123';
      const mockAddresses = [
        { _id: 'address1', user: userId },
        { _id: 'address2', user: userId },
      ];
      
      req.params.userId = userId;
      Address.find.mockResolvedValue(mockAddresses);

      // Execute
      await addressController.getUserAddresses(req, res);

      // Assert
      expect(Address.find).toHaveBeenCalledWith({ user: userId });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockAddresses);
    });

    it('should handle errors when fetching addresses', async () => {
      // Setup
      const errorMessage = 'Database error';
      req.params.userId = 'user123';
      Address.find.mockRejectedValue(new Error(errorMessage));

      // Execute
      await addressController.getUserAddresses(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Error fetching addresses',
          error: errorMessage,
        })
      );
    });
  });

  describe('updateAddress', () => {
    it('should update an address successfully', async () => {
      // Setup
      const addressId = 'address123';
      const updateData = {
        name: 'Updated Name',
        phoneNumber: '9876543210',
      };
      
      const updatedAddress = {
        _id: addressId,
        user: 'user123',
        ...updateData,
      };
      
      req.params.addressId = addressId;
      req.body = updateData;
      
      Address.findByIdAndUpdate.mockResolvedValue(updatedAddress);

      // Execute
      await addressController.updateAddress(req, res);

      // Assert
      expect(Address.findByIdAndUpdate).toHaveBeenCalledWith(
        addressId,
        updateData,
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Address updated successfully',
          address: updatedAddress,
        })
      );
    });

    it('should return 404 when address not found', async () => {
      // Setup
      req.params.addressId = 'nonexistent';
      req.body = { name: 'Updated Name' };
      
      Address.findByIdAndUpdate.mockResolvedValue(null);

      // Execute
      await addressController.updateAddress(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Address not found',
        })
      );
    });
  });

  describe('deleteAddress', () => {
    it('should delete an address successfully', async () => {
      // Setup
      const addressId = 'address123';
      const userId = 'user123';
      
      const mockAddress = {
        _id: addressId,
        user: userId,
      };
      
      const mockUser = {
        _id: userId,
        addresses: [addressId],
        save: jest.fn().mockResolvedValue(true),
      };
      
      req.params.addressId = addressId;
      
      Address.findById.mockResolvedValue(mockAddress);
      User.findById.mockResolvedValue(mockUser);
      Address.findByIdAndDelete.mockResolvedValue(mockAddress);

      // Execute
      await addressController.deleteAddress(req, res);

      // Assert
      expect(Address.findById).toHaveBeenCalledWith(addressId);
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(mockUser.addresses.pull).toHaveBeenCalledWith(addressId);
      expect(mockUser.save).toHaveBeenCalled();
      expect(Address.findByIdAndDelete).toHaveBeenCalledWith(addressId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Address deleted successfully',
        })
      );
    });

    it('should return 404 when address not found', async () => {
      // Setup
      req.params.addressId = 'nonexistent';
      Address.findById.mockResolvedValue(null);

      // Execute
      await addressController.deleteAddress(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Address not found',
        })
      );
    });
  });
});