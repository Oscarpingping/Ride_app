import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '../types/user';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const UserApi = {
  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        error: 'Network error occurred',
      };
    }
  },

  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        error: 'Network error occurred',
      };
    }
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const response = await fetch('http://localhost:5001/api/users/me', {
        headers: {
          'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`,
        },
      });
      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        error: 'Network error occurred',
      };
    }
  },

  async updateUser(data: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const response = await fetch('http://localhost:5001/api/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        error: 'Network error occurred',
      };
    }
  },
}; 