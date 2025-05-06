// Simulated Product Service
class ProductService {
    constructor(productRepository) {
        this.productRepository = productRepository;
    }

    async getProductById(id) {
        return this.productRepository.findById(id);
    }

    async getAllProducts(filters = {}) {
        return this.productRepository.findAll(filters);
    }

    async createProduct(productData) {
        // Validate required fields
        if (!productData.name) {
            throw new Error('Product name is required');
        }

        if (!productData.price || productData.price <= 0) {
            throw new Error('Product price must be greater than zero');
        }

        if (!productData.userId) {
            throw new Error('User ID is required');
        }

        return this.productRepository.create(productData);
    }

    async updateProduct(id, productData) {
        const product = await this.productRepository.findById(id);
        if (!product) {
            throw new Error('Product not found');
        }

        // Only owner can update
        if (productData.userId && product.userId !== productData.userId) {
            throw new Error('Unauthorized: Only the product owner can update it');
        }

        return this.productRepository.update(id, productData);
    }

    async deleteProduct(id, userId) {
        const product = await this.productRepository.findById(id);
        if (!product) {
            throw new Error('Product not found');
        }

        // Only owner can delete
        if (product.userId !== userId) {
            throw new Error('Unauthorized: Only the product owner can delete it');
        }

        return this.productRepository.delete(id);
    }
}

describe('Product Service Tests', () => {
    // Mock repository
    let mockProductRepository;
    let productService;

    beforeEach(() => {
        // Create a fresh mock for each test
        mockProductRepository = {
            findById: jest.fn(),
            findAll: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn()
        };

        productService = new ProductService(mockProductRepository);
    });

    test('getProductById calls repository and returns product', async () => {
        const mockProduct = { id: '123', name: 'Test Product', price: 29.99 };
        mockProductRepository.findById.mockResolvedValue(mockProduct);

        const product = await productService.getProductById('123');

        expect(mockProductRepository.findById).toHaveBeenCalledWith('123');
        expect(product).toEqual(mockProduct);
    });

    test('createProduct validates required name', async () => {
        const invalidProductData = { price: 29.99, userId: 'user123' };

        await expect(productService.createProduct(invalidProductData)).rejects.toThrow('Product name is required');
        expect(mockProductRepository.create).not.toHaveBeenCalled();
    });

    test('createProduct validates price greater than zero', async () => {
        const invalidProductData = { name: 'Test Product', price: -10, userId: 'user123' };

        await expect(productService.createProduct(invalidProductData)).rejects.toThrow('Product price must be greater than zero');
        expect(mockProductRepository.create).not.toHaveBeenCalled();
    });

    test('createProduct validates user ID', async () => {
        const invalidProductData = { name: 'Test Product', price: 29.99 };

        await expect(productService.createProduct(invalidProductData)).rejects.toThrow('User ID is required');
        expect(mockProductRepository.create).not.toHaveBeenCalled();
    });

    test('createProduct successfully creates a new product', async () => {
        const productData = { name: 'New Product', price: 29.99, userId: 'user123' };
        const createdProduct = { id: '456', ...productData };

        mockProductRepository.create.mockResolvedValue(createdProduct);

        const result = await productService.createProduct(productData);

        expect(mockProductRepository.create).toHaveBeenCalledWith(productData);
        expect(result).toEqual(createdProduct);
    });

    test('updateProduct checks ownership', async () => {
        const existingProduct = { id: '123', name: 'Existing Product', price: 19.99, userId: 'user123' };
        mockProductRepository.findById.mockResolvedValue(existingProduct);

        const updateData = { name: 'Updated Product', userId: 'differentUser' };

        await expect(productService.updateProduct('123', updateData)).rejects.toThrow('Unauthorized: Only the product owner can update it');
        expect(mockProductRepository.update).not.toHaveBeenCalled();
    });
}); 