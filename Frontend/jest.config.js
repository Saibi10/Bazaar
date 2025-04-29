module.exports = {
    preset: 'jest-expo',
    transformIgnorePatterns: [
      'node_modules/(?!(react-native|@react-native|expo|@expo|expo-router|@expo-google-fonts|react-native-safe-area-context)/)',
    ],
    setupFiles: ['./jest.setup.js'],
    collectCoverage: true,
    collectCoverageFrom: [
      'app/**/*.{js,jsx,ts,tsx}',
      'components/**/*.{js,jsx,ts,tsx}',
      '!**/node_modules/**',
    ],
    coverageReporters: ['json', 'lcov', 'text', 'clover', 'html'],
  };