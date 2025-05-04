// login testing
import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import LoginScreen from '../login'; // Adjust path as needed
import { UserContext } from '../context/userContext';

// 1. Mock all dependencies
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

const mockLogin = jest.fn();
jest.mock('../context/userContext', () => ({
  UserContext: {
    Provider: ({ children }) => children,
    Consumer: ({ children }) => children({ login: mockLogin }),
  },
}));

global.fetch = jest.fn();

// 2. Set up test environment
beforeAll(() => {
  process.env.EXPO_PUBLIC_APIBASE_URL = 'http://test-api.com';
});

// 3. Test cases
describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form', () => {
    const { getByText, getByPlaceholderText } = render(
      <UserContext.Provider value={{ login: mockLogin }}>
        <LoginScreen />
      </UserContext.Provider>
    );

    expect(getByText('Welcome to Bazaar')).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
  });

  test('shows error when submitting empty form', async () => {
    const { getByText } = render(
      <UserContext.Provider value={{ login: mockLogin }}>
        <LoginScreen />
      </UserContext.Provider>
    );

    await act(async () => {
      fireEvent.press(getByText('Login'));
    });

    expect(getByText('Please enter both email and password')).toBeTruthy();
  });

  test('successful login', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ user: { id: 1 }, token: 'abc123' }),
    });

    const { getByText, getByPlaceholderText } = render(
      <UserContext.Provider value={{ login: mockLogin }}>
        <LoginScreen />
      </UserContext.Provider>
    );

    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
      fireEvent.press(getByText('Login'));
    });

    expect(fetch).toHaveBeenCalledWith(
      'http://test-api.com/users/login',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      })
    );
    expect(mockLogin).toHaveBeenCalled();
  });
});