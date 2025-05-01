import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../../services/AuthContext';
import * as supabaseService from '../../services/supabase';

// Mock the supabase service
jest.mock('../../services/supabase', () => ({
  getCurrentUser: jest.fn(),
  loginUser: jest.fn(),
  logoutUser: jest.fn(),
  updateUserProfile: jest.fn(),
  mockUser: {
    id: 'mockUserId',
    email: 'test@example.com',
    user_metadata: {
      full_name: 'Test User',
      avatar_url: null,
    },
  },
}));

// Create a test component that uses the auth context
const TestComponent = () => {
  const { user, isLoading, login, logout, updateProfile } = useAuth();
  
  return (
    <>
      <div data-testid="loading">{isLoading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="user">{user ? JSON.stringify(user) : 'No User'}</div>
      <button data-testid="login-btn" onPress={() => login('test', 'password')}>Login</button>
      <button data-testid="logout-btn" onPress={() => logout()}>Logout</button>
      <button data-testid="update-btn" onPress={() => updateProfile({ full_name: 'New Name' })}>Update</button>
    </>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock getCurrentUser to return no user by default
    (supabaseService.getCurrentUser as jest.Mock).mockResolvedValue({ 
      user: null, 
      error: null 
    });
  });
  
  it('should load user on mount', async () => {
    let rendered;
    
    await act(async () => {
      rendered = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });
    
    const { getByTestId } = rendered;
    
    // Should call getCurrentUser
    expect(supabaseService.getCurrentUser).toHaveBeenCalled();
    
    // Should show "Not Loading" after initial load
    await waitFor(() => {
      expect(getByTestId('loading').children[0]).toBe('Not Loading');
    });
    
    // Should show "No User" because we mocked no user
    expect(getByTestId('user').children[0]).toBe('No User');
  });
  
  it('should load user from storage if available', async () => {
    // Mock getCurrentUser to return a user
    (supabaseService.getCurrentUser as jest.Mock).mockResolvedValue({
      user: supabaseService.mockUser,
      error: null
    });
    
    let rendered;
    
    await act(async () => {
      rendered = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });
    
    const { getByTestId } = rendered;
    
    // Should call getCurrentUser
    expect(supabaseService.getCurrentUser).toHaveBeenCalled();
    
    // Should show user data
    await waitFor(() => {
      const userElement = getByTestId('user');
      expect(userElement.children[0]).toContain('mockUserId');
    });
  });
  
  it('should login user correctly', async () => {
    // Mock loginUser to return a user
    (supabaseService.loginUser as jest.Mock).mockResolvedValue({
      user: supabaseService.mockUser,
      error: null
    });
    
    let rendered;
    
    await act(async () => {
      rendered = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });
    
    const { getByTestId } = rendered;
    
    // Press login button
    await act(async () => {
      getByTestId('login-btn').props.onPress();
    });
    
    // Should call loginUser
    expect(supabaseService.loginUser).toHaveBeenCalledWith('test', 'password');
    
    // Should update the user
    await waitFor(() => {
      const userElement = getByTestId('user');
      expect(userElement.children[0]).toContain('mockUserId');
    });
  });
  
  it('should logout user correctly', async () => {
    // Set initial state to logged in
    (supabaseService.getCurrentUser as jest.Mock).mockResolvedValue({
      user: supabaseService.mockUser,
      error: null
    });
    
    let rendered;
    
    await act(async () => {
      rendered = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });
    
    const { getByTestId } = rendered;
    
    // Ensure user is loaded first
    await waitFor(() => {
      const userElement = getByTestId('user');
      expect(userElement.children[0]).toContain('mockUserId');
    });
    
    // Press logout button
    await act(async () => {
      getByTestId('logout-btn').props.onPress();
    });
    
    // Should call logoutUser
    expect(supabaseService.logoutUser).toHaveBeenCalled();
    
    // Should update the user to null
    await waitFor(() => {
      const userElement = getByTestId('user');
      expect(userElement.children[0]).toBe('No User');
    });
  });
  
  it('should update user profile correctly', async () => {
    // Set initial state to logged in
    (supabaseService.getCurrentUser as jest.Mock).mockResolvedValue({
      user: supabaseService.mockUser,
      error: null
    });
    
    // Mock updateUserProfile
    const updatedUser = {
      ...supabaseService.mockUser,
      user_metadata: {
        ...supabaseService.mockUser.user_metadata,
        full_name: 'New Name'
      }
    };
    
    (supabaseService.updateUserProfile as jest.Mock).mockResolvedValue({
      user: updatedUser,
      error: null
    });
    
    let rendered;
    
    await act(async () => {
      rendered = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });
    
    const { getByTestId } = rendered;
    
    // Ensure user is loaded first
    await waitFor(() => {
      const userElement = getByTestId('user');
      expect(userElement.children[0]).toContain('mockUserId');
    });
    
    // Press update button
    await act(async () => {
      getByTestId('update-btn').props.onPress();
    });
    
    // Should call updateUserProfile
    expect(supabaseService.updateUserProfile).toHaveBeenCalledWith({ full_name: 'New Name' });
    
    // Should update the user
    await waitFor(() => {
      const userElement = getByTestId('user');
      expect(userElement.children[0]).toContain('New Name');
    });
  });
}); 