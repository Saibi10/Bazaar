import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Header from '../../components/Header';

describe('Header Component', () => {
  test('renders correctly with default props', () => {
    const { getByText } = render(<Header />);
    
    // Check if the default title is rendered
    expect(getByText('Bazaar')).toBeTruthy();
  });

  test('renders with custom title', () => {
    const { getByText } = render(<Header title="Custom Title" />);
    
    // Check if the custom title is rendered
    expect(getByText('Custom Title')).toBeTruthy();
  });

  test('shows back button when showBackButton is true', () => {
    const mockOnBackPress = jest.fn();
    const { getByTestId } = render(
      <Header showBackButton={true} onBackPress={mockOnBackPress} />
    );
    
    // Check if back button is rendered
    const backButton = getByTestId('back-button');
    expect(backButton).toBeTruthy();
    
    // Test the onPress handler
    fireEvent.press(backButton);
    expect(mockOnBackPress).toHaveBeenCalledTimes(1);
  });

  test('does not show back button when showBackButton is false', () => {
    const { queryByTestId } = render(<Header showBackButton={false} />);
    
    // Check that back button is not rendered
    expect(queryByTestId('back-button')).toBeNull();
  });

  test('renders custom right component when provided', () => {
    const CustomComponent = () => <Text testID="custom-component">Custom</Text>;
    const { getByTestId } = render(
      <Header customRightComponent={<CustomComponent />} />
    );
    
    // Check if custom component is rendered
    expect(getByTestId('custom-component')).toBeTruthy();
    
    // Check that default icons are not rendered
    expect(queryByTestId('header-icons')).toBeNull();
  });
});