// Simulated User Service
class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async getUserById(id) {
        return this.userRepository.findById(id);
    }

    async createUser(userData) {
        // Validate email format
        if (!userData.email || !userData.email.includes('@')) {
            throw new Error('Invalid email format');
        }

        // Validate password length
        if (!userData.password || userData.password.length < 8) {
            throw new Error('Password must be at least 8 characters');
        }

        // Check if user already exists
        const existingUser = await this.userRepository.findByEmail(userData.email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        return this.userRepository.create(userData);
    }

    async updateUser(id, userData) {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new Error('User not found');
        }
        return this.userRepository.update(id, userData);
    }

    async deleteUser(id) {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new Error('User not found');
        }
        return this.userRepository.delete(id);
    }
}

describe('User Service Tests', () => {
    // Mock repository
    let mockUserRepository;
    let userService;

    beforeEach(() => {
        // Create a fresh mock for each test
        mockUserRepository = {
            findById: jest.fn(),
            findByEmail: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn()
        };

        userService = new UserService(mockUserRepository);
    });

    test('getUserById calls repository and returns user', async () => {
        const mockUser = { id: '123', name: 'Test User', email: 'test@example.com' };
        mockUserRepository.findById.mockResolvedValue(mockUser);

        const user = await userService.getUserById('123');

        expect(mockUserRepository.findById).toHaveBeenCalledWith('123');
        expect(user).toEqual(mockUser);
    });

    test('createUser validates email format', async () => {
        const invalidUserData = { name: 'Test User', email: 'invalid-email', password: 'password123' };

        await expect(userService.createUser(invalidUserData)).rejects.toThrow('Invalid email format');
        expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    test('createUser validates password length', async () => {
        const invalidUserData = { name: 'Test User', email: 'test@example.com', password: 'short' };

        await expect(userService.createUser(invalidUserData)).rejects.toThrow('Password must be at least 8 characters');
        expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    test('createUser checks for existing user', async () => {
        const existingUser = { id: '123', name: 'Existing User', email: 'existing@example.com' };
        mockUserRepository.findByEmail.mockResolvedValue(existingUser);

        const userData = { name: 'New User', email: 'existing@example.com', password: 'password123' };

        await expect(userService.createUser(userData)).rejects.toThrow('User with this email already exists');
        expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    test('createUser successfully creates a new user', async () => {
        mockUserRepository.findByEmail.mockResolvedValue(null);
        const userData = { name: 'New User', email: 'new@example.com', password: 'password123' };
        const createdUser = { id: '456', ...userData };

        mockUserRepository.create.mockResolvedValue(createdUser);

        const result = await userService.createUser(userData);

        expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(userData.email);
        expect(mockUserRepository.create).toHaveBeenCalledWith(userData);
        expect(result).toEqual(createdUser);
    });
}); 