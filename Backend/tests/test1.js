const mongoose = require('mongoose');
const Product = require('../../models/Product');
const productController = require('../../controllers/productController');
const cloudinary = require('../../config/cloudinary');
const fs = require('fs');

// Mock dependencies
jest.mock('../../models/Product');
jest.mock('../../config/cloudinary');
jest.mock('fs');

describe('Product Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      files: [],
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createProduct', () => {
    it('should create a new product successfully', async () => {
      // Setup
      const mockProduct = {
        _id: 'product123',
        name: 'Test Product',
        save: jest.fn().mockResolvedValue(true),
      };
      
      Product.mockImplementation(() => mockProduct);
      
      req.body = {
        name: 'Test Product',
        category: 'Electronics',
        price: 99.99,
        description: 'A test product',
        stock: 10,
        brand: 'Test Brand',
        userId: 'user123',
      };

      // Execute
      await productController.createProduct(req, res);

      // Assert
      expect(Product).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Test Product',
        category: 'Electronics',
        price: 99.99,
      }));
      expect(mockProduct.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Product created successfully',
          product: mockProduct,
        })
      );
    });

    it('should handle errors during product creation', async () => {
      // Setup
      const errorMessage = 'Database connection failed';
      Product.mockImplementation(() => {
        throw new Error(errorMessage);
      });
      
      req.body = {
        name: 'Test Product',
        category: 'Electronics',
        price: 99.99,
      };

      // Execute
      await productController.createProduct(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Error creating product',
          error: errorMessage,
        })
      );
    });
  });

  describe('getProducts', () => {
    it('should return all products', async () => {
      // Setup
      const mockProducts = [
        { _id: 'product1', name: 'Product 1' },
        { _id: 'product2', name: 'Product 2' },
      ];
      
      Product.find.mockResolvedValue(mockProducts);

      // Execute
      await productController.getProducts(req, res);

      // Assert
      expect(Product.find).toHaveBeenCalledWith({});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockProducts);
    });

    it('should handle errors when fetching products', async () => {
      // Setup
      const errorMessage = 'Database error';
      Product.find.mockRejectedValue(new Error(errorMessage));

      // Execute
      await productController.getProducts(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Error fetching products',
          error: errorMessage,
        })
      );
    });
  });

  describe('getProductByUserId', () => {
    it('should return products for a specific user', async () => {
      // Setup
      const userId = 'user123';
      const mockProducts = [
        { _id: 'product1', name: 'Product 1', userId },
        { _id: 'product2', name: 'Product 2', userId },
      ];
      
      req.params.userId = userId;
      Product.find.mockResolvedValue(mockProducts);

      // Execute
      await productController.getProductByUserId(req, res);

      // Assert
      expect(Product.find).toHaveBeenCalledWith({ userId });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockProducts);
    });

    it('should return 404 when no products found for user', async () => {
      // Setup
      req.params.userId = 'user123';
      Product.find.mockResolvedValue([]);

      // Execute
      await productController.getProductByUserId(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'No products found for this user',
        })
      );
    });
  });

  describe('updateProduct', () => {
    it('should update a product successfully', async () => {
      // Setup
      const productId = 'product123';
      const updateData = {
        name: 'Updated Product',
        price: 129.99,
      };
      
      const updatedProduct = {
        _id: productId,
        ...updateData,
      };
      
      req.params.productId = productId;
      req.body = updateData;
      
      Product.findByIdAndUpdate.mockResolvedValue(updatedProduct);

      // Execute
      await productController.updateProduct(req, res);

      // Assert
      expect(Product.findByIdAndUpdate).toHaveBeenCalledWith(
        productId,
        updateData,
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Product updated successfully',
          product: updatedProduct,
        })
      );
    });

    it('should return 404 when product not found', async () => {
      // Setup
      req.params.productId = 'nonexistent';
      Product.findByIdAndUpdate.mockResolvedValue(null);

      // Execute
      await productController.updateProduct(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Product not found',
        })
      );
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product successfully', async () => {
      // Setup
      const productId = 'product123';
      const deletedProduct = {
        _id: productId,
        name: 'Product to delete',
      };
      
      req.params.productId = productId;
      Product.findByIdAndDelete.mockResolvedValue(deletedProduct);

      // Execute
      await productController.deleteProduct(req, res);

      // Assert
      expect(Product.findByIdAndDelete).toHaveBeenCalledWith(productId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Product deleted successfully',
        })
      );
    });

    it('should return 404 when product not found for deletion', async () => {
      // Setup
      req.params.productId = 'nonexistent';
      Product.findByIdAndDelete.mockResolvedValue(null);

      // Execute
      await productController.deleteProduct(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Product not found',
        })
      );
    });
  });

  describe('addImagesInProduct', () => {
    it('should add images to a product successfully', async () => {
      // Setup
      const productId = 'product123';
      const mockProduct = {
        _id: productId,
        pics_url: [],
        save: jest.fn().mockResolvedValue(true),
      };
      
      req.params.productId = productId;
      req.files = [
        { path: 'path/to/image1.jpg' },
        { path: 'path/to/image2.jpg' },
      ];
      
      Product.findById.mockResolvedValue(mockProduct);
      
      cloudinary.uploader.upload.mockResolvedValueOnce({
        secure_url: 'https://cloudinary.com/image1.jpg',
      });
      cloudinary.uploader.upload.mockResolvedValueOnce({
        secure_url: 'https://cloudinary.com/image2.jpg',
      });

      // Execute
      await productController.addImagesInProduct(req, res);

      // Assert
      expect(Product.findById).toHaveBeenCalledWith(productId);
      expect(cloudinary.uploader.upload).toHaveBeenCalledTimes(2);
      expect(mockProduct.pics_url).toEqual([
        'https://cloudinary.com/image1.jpg',
        'https://cloudinary.com/image2.jpg',
      ]);
      expect(mockProduct.save).toHaveBeenCalled();
      expect(fs.unlinkSync).toHaveBeenCalledTimes(2);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Images added successfully',
          product: mockProduct,
        })
      );
    });

    it('should return 400 when no files are uploaded', async () => {
      // Setup
      req.params.productId = 'product123';
      req.files = [];

      // Execute
      await productController.addImagesInProduct(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'No files uploaded',
        })
      );
    });

    it('should return 404 when product not found', async () => {
      // Setup
      req.params.productId = 'nonexistent';
      req.files = [{ path: 'path/to/image.jpg' }];
      
      Product.findById.mockResolvedValue(null);

      // Execute
      await productController.addImagesInProduct(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Product not found',
        })
      );
    });
  });
});