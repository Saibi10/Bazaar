// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  }));
  
  // Mock expo modules
  jest.mock('expo-linear-gradient', () => ({
    LinearGradient: 'LinearGradient',
  }));
  
  jest.mock('expo-router', () => ({
    useRouter: () => ({
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
    }),
    useLocalSearchParams: () => ({}),
  }));
  
  // Add other mocks as needed