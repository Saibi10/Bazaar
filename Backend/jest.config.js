module.exports = {
    testEnvironment: 'node',
    coveragePathIgnorePatterns: ['/node_modules/', '/coverage/'],
    testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
    verbose: true,
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70
        }
    },
    testTimeout: 300000, // 5 minutes timeout
    setupFilesAfterEnv: ['./__tests__/setup.js'],
    collectCoverageFrom: [
        '**/*.js',
        '!**/node_modules/**',
        '!**/coverage/**',
        '!**/jest.config.js',
        '!**/server.js'
    ]
}; 