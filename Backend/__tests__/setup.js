const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

// Increase Jest timeout globally
jest.setTimeout(120000); // 2 minutes to allow for MongoDB download/startup

// Connect to the in-memory database before tests run
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create({
        binary: {
            version: '6.0.9' // Specify a specific version to avoid compatibility issues
        }
    });
    const uri = mongoServer.getUri();

    await mongoose.connect(uri);
    console.log('Connected to in-memory MongoDB server');
});

// Clear all data after each test
afterEach(async () => {
    if (mongoose.connection.readyState !== 0) {
        const collections = mongoose.connection.collections;

        for (const key in collections) {
            const collection = collections[key];
            await collection.deleteMany({});
        }
    }
});

// Close the connection and stop the server after all tests
afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    if (mongoServer) {
        await mongoServer.stop();
    }
    console.log('Disconnected from in-memory MongoDB server');
});

// Mock environment variables
process.env.JWT_SECRET = 'test-secret-key'; 