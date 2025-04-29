module.exports = {
    testEnvironment: 'node',
    collectCoverage: true,
    coverageReporters: ['json', 'lcov', 'text', 'clover', 'html'],
    collectCoverageFrom: [
      'controllers/**/*.js',
      'models/**/*.js',
      'routes/**/*.js',
      '!**/node_modules/**',
    ],
  };