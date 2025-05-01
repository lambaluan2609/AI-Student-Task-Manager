import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';

// For demo purposes, using a temporary project
// In a real app, these would be stored in environment variables
const supabaseUrl = 'https://temporary-supabase-demo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mockKeyForDemo';

// Custom storage implementation using AsyncStorage
const asyncStorageCustom = {
  getItem: (key: string) => AsyncStorage.getItem(key),
  setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
  removeItem: (key: string) => AsyncStorage.removeItem(key),
};

// Initialize the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: asyncStorageCustom,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Set up AppState listener to refresh auth token when app comes to foreground
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.refreshSession();
  }
});

// Mock user for demo purposes (will be used until proper backend is set up)
export const mockUser = {
  id: 'mockUserId',
  email: 'qe170169@example.com',
  user_metadata: {
    full_name: 'Demo User',
    avatar_url: null,
  },
};

// Auth functions
export const loginUser = async (email: string, password: string) => {
  // For demo, hardcode the test account
  if (email === 'qe170169' && password === '12345678') {
    // Store mock user in AsyncStorage 
    await AsyncStorage.setItem('user', JSON.stringify(mockUser));
    return { user: mockUser, error: null };
  }
  
  return { user: null, error: 'Invalid credentials' };
};

export const logoutUser = async () => {
  await AsyncStorage.removeItem('user');
  return { error: null };
};

export const getCurrentUser = async () => {
  const userString = await AsyncStorage.getItem('user');
  if (userString) {
    return { user: JSON.parse(userString), error: null };
  }
  return { user: null, error: null };
};

export const updateUserProfile = async (userData: {
  full_name?: string;
  avatar_url?: string;
}) => {
  // Get current user data
  const { user, error } = await getCurrentUser();
  if (error || !user) return { user: null, error: 'User not found' };
  
  // Update user data
  const updatedUser = {
    ...user,
    user_metadata: {
      ...user.user_metadata,
      ...userData,
    },
  };
  
  // Save updated user
  await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
  
  return { user: updatedUser, error: null };
}; 