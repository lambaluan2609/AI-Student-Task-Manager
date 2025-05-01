import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, loginUser, logoutUser, updateUserProfile } from './supabase';

type User = {
  id: string;
  email: string;
  user_metadata: {
    full_name: string;
    avatar_url: string | null;
  };
} | null;

type AuthContextType = {
  user: User;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  updateProfile: (data: { full_name?: string; avatar_url?: string }) => Promise<{ error: string | null }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on app start
    const loadUser = async () => {
      setIsLoading(true);
      const { user, error } = await getCurrentUser();
      if (user && !error) {
        setUser(user);
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const { user, error } = await loginUser(email, password);
    if (user && !error) {
      setUser(user);
    }
    setIsLoading(false);
    return { error: error };
  };

  const logout = async () => {
    setIsLoading(true);
    await logoutUser();
    setUser(null);
    setIsLoading(false);
  };

  const updateProfile = async (data: { full_name?: string; avatar_url?: string }) => {
    setIsLoading(true);
    const { user: updatedUser, error } = await updateUserProfile(data);
    if (updatedUser && !error) {
      setUser(updatedUser);
    }
    setIsLoading(false);
    return { error: error };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 