import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserApi } from '../../shared/api/user';
import type { User, UserState } from '../../shared/types/user-unified';
import type { LoginRequest, RegisterRequest } from '../../shared/api/user';

interface AuthContextType extends UserState {
  login: (data: LoginRequest) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<UserState>({
    currentUser: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const response = await UserApi.getCurrentUser();
        if (response.success && response.data) {
          setState({
            currentUser: response.data,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          await AsyncStorage.removeItem('token');
          setState({
            currentUser: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      } else {
        setState({
          currentUser: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      setState({
        currentUser: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Failed to check authentication status',
      });
    }
  };

  const login = async (data: LoginRequest): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('AuthContext: Starting login process');
      setState(prev => ({ ...prev, isLoading: true, error: null, currentUser: prev.currentUser ?? null }));
      
      const response = await UserApi.login(data);
      console.log('AuthContext: UserApi.login response:', {
        success: response.success,
        error: response.error,
        hasData: !!response.data
      });

      if (response.success && response.data?.user) {
        console.log('AuthContext: Login successful, saving token');
        await AsyncStorage.setItem('token', response.data.token);
        const user = response.data.user ?? null;
        setState({
          currentUser: user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        console.log('AuthContext: State updated successfully');
        return { success: true };
      } else {
        console.log('AuthContext: Login failed with response:', response);
        const errorMsg = response.error || '登录失败，请检查邮箱和密码';
        setState({
          currentUser: null,
          isAuthenticated: false,
          isLoading: false,
          error: errorMsg,
        });
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      console.error('AuthContext: Login exception:', error);
      const errorMsg = '登录过程中发生错误，请稍后重试';
      setState({
        currentUser: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMsg,
      });
      return { success: false, error: errorMsg };
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null, currentUser: prev.currentUser ?? null }));
      const response = await UserApi.register(data);
      if (response.success && response.data) {
        await AsyncStorage.setItem('token', response.data.token);
        setState({
          currentUser: response.data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.error || 'Registration failed',
          currentUser: prev.currentUser ?? null,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'An error occurred during registration',
        currentUser: prev.currentUser ?? null,
      }));
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      setState({
        currentUser: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to logout',
        currentUser: prev.currentUser ?? null,
      }));
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null, currentUser: prev.currentUser ?? null }));
      const response = await UserApi.updateUser(data);
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          currentUser: response.data,
          isLoading: false,
          error: null,
        }));
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.error || 'Failed to update profile',
          currentUser: prev.currentUser ?? null,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'An error occurred while updating profile',
        currentUser: prev.currentUser ?? null,
      }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 