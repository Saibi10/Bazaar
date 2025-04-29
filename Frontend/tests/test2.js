import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import OrdersScreen from '../../app/orders';
import { UserContext } from '../../app/context/userContext';
import axios from 'axios';

// Mock dependencies
jest.mock('axios');
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('../../app/components/Header', () => {
  return {
    __esModule: true,
    default: ({ title }) => <div data-testid="header">{title}</div>,
  };
});

// Mock order data
const mockOrders = [
  {
    _id: 'order1',
    items: [{ product: { _id: 'prod1', name: 'Test Product', price: 99.99 }, quantity: 2 }],
    totalAmount: 199.98,
    status: 'IN PROGRESS',
    orderDate: '2023-05-15T10:30:00Z',
    paymentStatus: 'PENDING',
    shippingAddress: {
      _id: 'addr1',
      addressLine1: '123 Test St',
      city: 'Test City',
      state: 'Test State',
      postalCode: '12345',
      country: 'Test Country',
    },
  },
];

describe('OrdersScreen', () => {
  const mockUser = { _id: 'user1', name: 'Test User' };
  const mockToken = 'test-token';
  const mockContextValue = {
    user: mockUser,
    token: mockToken,
    logout: jest.fn(),
    refreshUser: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockResolvedValue({ data: mockOrders });
  });

  it('renders loading state initially', () => {
    const { getByTestId } = render(
      <UserContext.Provider value={mockContextValue}>
        <OrdersScreen />
      </UserContext.Provider>
    );
    
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('renders orders when data is loaded', async () => {
    const { getByText, queryByTestId } = render(
      <UserContext.Provider value={mockContextValue}>
        <OrdersScreen />
      </UserContext.Provider>
    );
    
    await waitFor(() => {
      expect(queryByTestId('loading-indicator')).toBeNull();
      expect(getByText('Order #ORDER1')).toBeTruthy();
    });
    
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/orders/user1'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      })
    );
  });

  it('handles tab switching', async () => {
    const { getByText } = render(
      <UserContext.Provider value={mockContextValue}>
        <OrdersScreen />
      </UserContext.Provider>
    );
    
    await waitFor(() => {
      expect(getByText('Processing')).toBeTruthy();
    });
    
    // Click on the "Delivered" tab
    fireEvent.press(getByText('Delivered'));
    
    // Should call API with new filter
    expect(axios.get).toHaveBeenCalledTimes(2);
  });

  it('shows empty state when no orders', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    
    const { getByText, queryByText } = render(
      <UserContext.Provider value={mockContextValue}>
        <OrdersScreen />
      </UserContext.Provider>
    );
    
    await waitFor(() => {
      expect(getByText('No processing orders')).toBeTruthy();
      expect(queryByText('Order #ORDER1')).toBeNull();
    });
  });

  it('handles error state', async () => {
    axios.get.mockRejectedValueOnce(new Error('Network error'));
    
    const { getByText } = render(
      <UserContext.Provider value={mockContextValue}>
        <OrdersScreen />
      </UserContext.Provider>
    );
    
    await waitFor(() => {
      expect(getByText('Failed to fetch orders')).toBeTruthy();
      expect(getByText('Retry')).toBeTruthy();
    });
  });
});