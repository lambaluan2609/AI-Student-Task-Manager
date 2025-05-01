import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser, logoutUser, getCurrentUser, updateUserProfile, mockUser } from '../../services/supabase';
import { describe, beforeEach, jest, expect, it } from '@jest/globals';

describe('Supabase Authentication Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('loginUser', () => {
    it('should login successfully with correct credentials', async () => {
      const result = await loginUser('qe170169', '12345678');
      
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('user', expect.any(String));
      expect(result).toEqual({ user: mockUser, error: null });
    });

    it('should return error with incorrect credentials', async () => {
      const result = await loginUser('wronguser', 'wrongpass');
      
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
      expect(result).toEqual({ user: null, error: 'Invalid credentials' });
    });
  });

  describe('logoutUser', () => {
    it('should remove user from storage on logout', async () => {
      await logoutUser();
      
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('user');
    });
  });

  describe('getCurrentUser', () => {
    it('should return user when user exists in storage', async () => {
      // Mock AsyncStorage.getItem to return a user
      jest.spyOn(AsyncStorage, 'getItem').mockResolvedValue(JSON.stringify(mockUser));
      
      const result = await getCurrentUser();
      
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('user');
      expect(result).toEqual({ user: mockUser, error: null });
    });

    it('should return null when no user exists in storage', async () => {
      // Mock AsyncStorage.getItem to return null
      AsyncStorage.getItem = jest.fn().mockResolvedValue(null);
      
      const result = await getCurrentUser();
      
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('user');
      expect(result).toEqual({ user: null, error: null });
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile data', async () => {
      // Setup: Store a mock user
      AsyncStorage.getItem = jest.fn().mockResolvedValue(JSON.stringify(mockUser));
      
      const newData = { full_name: 'Updated Name', avatar_url: 'new-avatar.jpg' };
      const result = await updateUserProfile(newData);
      
      // Check that user was retrieved and then stored with updates
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('user');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('user', expect.any(String));
      
      // Check the result
      expect(result.error).toBeNull();
      expect(result.user).toEqual({
        ...mockUser,
        user_metadata: {
          ...mockUser.user_metadata,
          ...newData
        }
      });
    });

    it('should return error when no user exists', async () => {
      // Setup: No user in storage
      AsyncStorage.getItem = jest.fn().mockResolvedValue(null);
      
      const result = await updateUserProfile({ full_name: 'New Name' });
      
      expect(result).toEqual({ user: null, error: 'User not found' });
    });
  });
}); 