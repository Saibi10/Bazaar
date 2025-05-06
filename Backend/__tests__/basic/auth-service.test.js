// Simulated Authentication Service
class AuthService {
    constructor(userRepository, tokenService) {
        this.userRepository = userRepository;
        this.tokenService = tokenService;
    }

    async login(email, password) {
        if (!email || !password) {
            throw new Error('Email and password are required');
        }

        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error('Invalid email or password');
        }

        const isPasswordValid = await this.userRepository.comparePassword(user.id, password);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }

        const token = this.tokenService.generateToken(user.id);
        return { user, token };
    }

    async register(userData) {
        if (!userData.email || !userData.password || !userData.username || !userData.name) {
            throw new Error('All fields are required (name, username, email, password)');
        }

        // Check if user already exists
        const existingUser = await this.userRepository.findByEmail(userData.email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        // Check username uniqueness
        const userWithUsername = await this.userRepository.findByUsername(userData.username);
        if (userWithUsername) {
            throw new Error('Username already taken');
        }

        // Create user
        const user = await this.userRepository.create(userData);
        const token = this.tokenService.generateToken(user.id);

        return { user, token };
    }

    async verifyToken(token) {
        if (!token) {
            throw new Error('Token is required');
        }

        try {
            const decoded = this.tokenService.verifyToken(token);
            const user = await this.userRepository.findById(decoded.userId);

            if (!user) {
                throw new Error('User not found');
            }

            return { userId: user.id };
        } catch (error) {
            throw new Error('Invalid token');
        }
    }
}

describe('Auth Service Tests', () => {
    // Mock repositories and services
    let mockUserRepository;
    let mockTokenService;
    let authService;

    beforeEach(() => {
        // Create fresh mocks for each test
        mockUserRepository = {
            findByEmail: jest.fn(),
            findByUsername: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            comparePassword: jest.fn()
        };

        mockTokenService = {
            generateToken: jest.fn(),
            verifyToken: jest.fn()
        };

        authService = new AuthService(mockUserRepository, mockTokenService);
    });

    test('login validates required fields', async () => {
        await expect(authService.login('', 'password')).rejects.toThrow('Email and password are required');
        await expect(authService.login('email@example.com', '')).rejects.toThrow('Email and password are required');
    });

    test('login validates user existence', async () => {
        mockUserRepository.findByEmail.mockResolvedValue(null);

        await expect(authService.login('nonexistent@example.com', 'password123')).rejects.toThrow('Invalid email or password');
    });

    test('login validates password', async () => {
        const mockUser = { id: '123', email: 'test@example.com' };
        mockUserRepository.findByEmail.mockResolvedValue(mockUser);
        mockUserRepository.comparePassword.mockResolvedValue(false);

        await expect(authService.login('test@example.com', 'wrongpassword')).rejects.toThrow('Invalid email or password');
    });

    test('login returns user and token on success', async () => {
        const mockUser = { id: '123', email: 'test@example.com' };
        const mockToken = 'valid.jwt.token';

        mockUserRepository.findByEmail.mockResolvedValue(mockUser);
        mockUserRepository.comparePassword.mockResolvedValue(true);
        mockTokenService.generateToken.mockReturnValue(mockToken);

        const result = await authService.login('test@example.com', 'correctpassword');

        expect(result.user).toEqual(mockUser);
        expect(result.token).toBe(mockToken);
        expect(mockTokenService.generateToken).toHaveBeenCalledWith(mockUser.id);
    });

    test('register validates required fields', async () => {
        await expect(authService.register({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123'
            // Missing name
        })).rejects.toThrow('All fields are required');
    });

    test('register checks for existing email', async () => {
        const userData = {
            name: 'Test User',
            username: 'testuser',
            email: 'existing@example.com',
            password: 'password123'
        };

        mockUserRepository.findByEmail.mockResolvedValue({ id: '123', email: userData.email });

        await expect(authService.register(userData)).rejects.toThrow('User with this email already exists');
    });

    test('register checks for existing username', async () => {
        const userData = {
            name: 'Test User',
            username: 'existinguser',
            email: 'new@example.com',
            password: 'password123'
        };

        mockUserRepository.findByEmail.mockResolvedValue(null);
        mockUserRepository.findByUsername.mockResolvedValue({ id: '123', username: userData.username });

        await expect(authService.register(userData)).rejects.toThrow('Username already taken');
    });
}); 