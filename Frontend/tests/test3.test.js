import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Header from '../../app/components/Header';

// Mock the LinearGradient component
jest.mock('expo-linear-gradient', () => {
  return {
    LinearGradient: ({ children }) => <>{children}</>,
  };
});

// Mock the router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: jest.fn(),
    push: jest.fn(),
  }),
}));

describe('Header Component', () => {
  it('renders correctly with default props', () => {
    const { getByText, getAllByRole } = render(<Header />);
    
    // Check if the title is rendered
    expect(getByText('Bazaar')).toBeTruthy();
    
    // Check if icons are rendered (3 buttons)
    const buttons = getAllByRole('button');
    expect(buttons.length).toBe(3);
  });

  it('renders with custom title', () => {
    const { getByText } = render(<Header title="Custom Title" />);
    expect(getByText('Custom Title')).toBeTruthy();
  });

  it('renders back button when showBackButton is true', () => {
    const mockOnBackPress = jest.fn();
    const { getByTestId } = render(
      <Header showBackButton={true} onBackPress={mockOnBackPress} />
    );
    
    const backButton = getByTestId('back-button');
    expect(backButton).toBeTruthy();
    
    fireEvent.press(backButton);
    expect(mockOnBackPress).toHaveBeenCalledTimes(1);
  });

  it('renders custom right component when provided', () => {
    const CustomComponent = () => <div data-testid="custom-component">Custom</div>;
    const { getByTestId } = render(
      <Header customRightComponent={<CustomComponent />} />
    );
    
    expect(getByTestId('custom-component')).toBeTruthy();
  });
});import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { UserProvider, UserContext } from '../../app/context/userContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('UserContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('provides initial null state for user and token', () => {
    const TestComponent = () => {
      const context = React.useContext(UserContext);
      return (
        <>
          <div data-testid="user">{context.user ? 'user exists' : 'no user'}</div>
          <div data-testid="token">{context.token ? 'token exists' : 'no token'}</div>
        </>
      );
    };

    const { getByTestId } = render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    expect(getByTestId('user').textContent).toBe('no user');
    expect(getByTestId('token').textContent).toBe('no token');
  });

  it('loads user data from AsyncStorage on mount', async () => {
    const mockUser = { _id: 'user1', name: 'Test User' };
    const mockToken = 'test-token';
    
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'user') return Promise.resolve(JSON.stringify(mockUser));
      if (key === 'token') return Promise.resolve(mockToken);
      return Promise.resolve(null);
    });

    const TestComponent = () => {
      const context = React.useContext(UserContext);
      return (
        <>
          <div data-testid="user">{context.user ? 'user exists' : 'no user'}</div>
          <div data-testid="token">{context.token ? 'token exists' : 'no token'}</div>
        </>
      );
    };

    const { getByTestId } = render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    await waitFor(() => {
      expect(getByTestId('user').textContent).toBe('user exists');
      expect(getByTestId('token').textContent).toBe('token exists');
    });

    expect(AsyncStorage.getItem).toHaveBeenCalledWith('user');
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('token');
  });

  it('provides login function that updates context and AsyncStorage', async () => {
    const mockUser = { _id: 'user1', name: 'Test User' };
    const mockToken = 'test-token';

    const TestComponent = () => {
      const context = React.useContext(UserContext);
      
      React.useEffect(() => {
        context.login(mockUser, mockToken);
      }, []);
      
      return (
        <>
          <div data-testid="user">{context.user ? 'user exists' : 'no user'}</div>
          <div data-testid="token">{context.token ? 'token exists' : 'no token'}</div>
        </>
      );
    };

    const { getByTestId } = render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    await waitFor(() => {
      expect(getByTestId('user').textContent).toBe('user exists');
      expect(getByTestId('token').textContent).toBe('token exists');
    });

    expect(AsyncStorage.setItem).toHaveBeenCalledWith('token', mockToken);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
  });

  it('provides logout function that clears context and AsyncStorage', async () => {
    const TestComponent = () => {
      const context = React.useContext(UserContext);
      
      React.useEffect(() => {
        context.logout();
      }, []);
      
      return (
        <>
          <div data-testid="user">{context.user ? 'user exists' : 'no user'}</div>
          <div data-testid="token">{context.token ? 'token exists' : 'no token'}</div>
        </>
      );
    };

    const { getByTestId } = render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    await waitFor(() => {
      expect(getByTestId('user').textContent).toBe('no user');
      expect(getByTestId('token').textContent).toBe('no token');
    });

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('token');
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('user');
  });
});