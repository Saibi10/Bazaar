// Simulated Order Service
class OrderService {
    constructor(orderRepository, productRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    async createOrder(orderData) {
        if (!orderData.buyer) {
            throw new Error('Buyer ID is required');
        }

        if (!orderData.seller) {
            throw new Error('Seller ID is required');
        }

        if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
            throw new Error('Order must contain at least one item');
        }

        if (!orderData.shippingAddress) {
            throw new Error('Shipping address is required');
        }

        // Check product availability and calculate total
        let totalAmount = 0;
        for (const item of orderData.items) {
            const product = await this.productRepository.findById(item.product);

            if (!product) {
                throw new Error(`Product with ID ${item.product} not found`);
            }

            if (product.stock < item.quantity) {
                throw new Error(`Insufficient stock for product: ${product.name}`);
            }

            totalAmount += product.price * item.quantity;

            // Update stock
            await this.productRepository.updateStock(product.id, product.stock - item.quantity);
        }

        // Create order with calculated total
        const order = await this.orderRepository.create({
            ...orderData,
            totalAmount,
            status: 'IN PROGRESS',
            paymentStatus: 'PENDING',
            orderDate: new Date()
        });

        return order;
    }

    async getUserOrders(userId) {
        if (!userId) {
            throw new Error('User ID is required');
        }

        return this.orderRepository.findByUserId(userId);
    }

    async getOrderById(orderId) {
        if (!orderId) {
            throw new Error('Order ID is required');
        }

        const order = await this.orderRepository.findById(orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        return order;
    }

    async updateOrderStatus(orderId, status, userId) {
        const order = await this.orderRepository.findById(orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        // Only seller can update status
        if (order.seller !== userId) {
            throw new Error('Unauthorized: Only the seller can update the order status');
        }

        if (!['IN PROGRESS', 'COMPLETED', 'RETURNED'].includes(status)) {
            throw new Error('Invalid status value');
        }

        return this.orderRepository.updateStatus(orderId, status);
    }
}

describe('Order Service Tests', () => {
    // Mock repositories
    let mockOrderRepository;
    let mockProductRepository;
    let orderService;

    beforeEach(() => {
        // Create fresh mocks for each test
        mockOrderRepository = {
            create: jest.fn(),
            findByUserId: jest.fn(),
            findById: jest.fn(),
            updateStatus: jest.fn()
        };

        mockProductRepository = {
            findById: jest.fn(),
            updateStock: jest.fn()
        };

        orderService = new OrderService(mockOrderRepository, mockProductRepository);
    });

    test('createOrder validates required buyer', async () => {
        const invalidOrderData = {
            // Missing buyer
            seller: 'seller123',
            items: [{ product: 'product123', quantity: 2 }],
            shippingAddress: 'address123'
        };

        await expect(orderService.createOrder(invalidOrderData)).rejects.toThrow('Buyer ID is required');
    });

    test('createOrder validates required seller', async () => {
        const invalidOrderData = {
            buyer: 'buyer123',
            // Missing seller
            items: [{ product: 'product123', quantity: 2 }],
            shippingAddress: 'address123'
        };

        await expect(orderService.createOrder(invalidOrderData)).rejects.toThrow('Seller ID is required');
    });

    test('createOrder validates items array', async () => {
        const invalidOrderData = {
            buyer: 'buyer123',
            seller: 'seller123',
            items: [], // Empty array
            shippingAddress: 'address123'
        };

        await expect(orderService.createOrder(invalidOrderData)).rejects.toThrow('Order must contain at least one item');
    });

    test('createOrder checks product existence', async () => {
        const orderData = {
            buyer: 'buyer123',
            seller: 'seller123',
            items: [
                { product: 'nonexistentProduct', quantity: 2 }
            ],
            shippingAddress: 'address123'
        };

        mockProductRepository.findById.mockResolvedValue(null);

        await expect(orderService.createOrder(orderData)).rejects.toThrow('Product with ID nonexistentProduct not found');
    });

    test('createOrder checks product stock', async () => {
        const orderData = {
            buyer: 'buyer123',
            seller: 'seller123',
            items: [
                { product: 'product123', quantity: 10 }
            ],
            shippingAddress: 'address123'
        };

        const mockProduct = {
            id: 'product123',
            name: 'Test Product',
            price: 29.99,
            stock: 5 // Not enough stock
        };

        mockProductRepository.findById.mockResolvedValue(mockProduct);

        await expect(orderService.createOrder(orderData)).rejects.toThrow('Insufficient stock for product: Test Product');
    });

    test('createOrder calculates total and creates order', async () => {
        const orderData = {
            buyer: 'buyer123',
            seller: 'seller123',
            items: [
                { product: 'product1', quantity: 2 },
                { product: 'product2', quantity: 1 }
            ],
            shippingAddress: 'address123'
        };

        const mockProducts = [
            { id: 'product1', name: 'Product 1', price: 29.99, stock: 10 },
            { id: 'product2', name: 'Product 2', price: 19.99, stock: 5 }
        ];

        mockProductRepository.findById
            .mockImplementation((id) => {
                return mockProducts.find(p => p.id === id);
            });

        const expectedTotal = (29.99 * 2) + 19.99;
        const expectedOrder = {
            id: 'order123',
            ...orderData,
            totalAmount: expectedTotal,
            status: 'IN PROGRESS'
        };

        mockOrderRepository.create.mockResolvedValue(expectedOrder);

        const result = await orderService.createOrder(orderData);

        expect(mockProductRepository.updateStock).toHaveBeenCalledTimes(2);
        expect(mockOrderRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({
                ...orderData,
                totalAmount: expectedTotal,
                status: 'IN PROGRESS',
                paymentStatus: 'PENDING'
            })
        );
        expect(result).toEqual(expectedOrder);
    });
}); 