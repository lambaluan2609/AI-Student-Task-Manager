import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../../screens/LoginScreen';
import { toast } from 'sonner-native';

// Mock dependencies
jest.mock('../../services/AuthContext', () => ({
  useAuth: () => ({
    login: jest.fn().mockImplementation((email, password) => {
      if (email === 'qe170169' && password === '12345678') {
        return Promise.resolve({ error: null });
      } else {
        return Promise.resolve({ error: 'Invalid credentials' });
      }
    }),
    isLoading: false,
  }),
}));

jest.mock('sonner-native', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);
    
    // Check that basic elements are rendered
    expect(getByText('Student Planner')).toBeTruthy();
    expect(getByText('Log in to access your account')).toBeTruthy();
    expect(getByPlaceholderText('Enter your username')).toBeTruthy();
    expect(getByPlaceholderText('Enter your password')).toBeTruthy();
  });

  it('shows validation error when form is incomplete', async () => {
    const { getByText } = render(<LoginScreen />);
    
    // Try to login without entering credentials
    fireEvent.press(getByText('Login'));
    
    // Should show error
    expect(toast.error).toHaveBeenCalledWith('Please fill all fields');
  });

  it('calls login with credentials and shows success toast on successful login', async () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);
    
    // Enter valid credentials
    fireEvent.changeText(getByPlaceholderText('Enter your username'), 'qe170169');
    fireEvent.changeText(getByPlaceholderText('Enter your password'), '12345678');
    
    // Submit form
    fireEvent.press(getByText('Login'));
    
    // Wait for login to complete
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Login successful!');
    });
  });

  it('shows error toast on failed login', async () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);
    
    // Enter invalid credentials
    fireEvent.changeText(getByPlaceholderText('Enter your username'), 'wrong');
    fireEvent.changeText(getByPlaceholderText('Enter your password'), 'wrong');
    
    // Submit form
    fireEvent.press(getByText('Login'));
    
    // Wait for login to complete
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid credentials');
    });
  });
}); 