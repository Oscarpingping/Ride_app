import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/user-unified';
import { ApiResponse } from './types';

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
  token: string;
  refreshToken: string;
  user: User;
}

// 用户API接口
export interface UserApi {
  // 登录
  login(data: { email: string; password: string }): Promise<ApiResponse<AuthResponse>>;
  
  // 注册
  register(data: { email: string; password: string; name: string }): Promise<ApiResponse<AuthResponse>>;
  
  // 请求密码重置
  requestPasswordReset(data: { email: string }): Promise<ApiResponse<null>>;
  
  // 重置密码
  resetPassword(data: { token: string; password: string }): Promise<ApiResponse<null>>;
}

// 用户API实现
export const UserApi: UserApi = {
  // 登录
  async login(data) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // 注册
  async register(data) {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // 请求密码重置
  async requestPasswordReset(data) {
    const response = await fetch('/api/auth/request-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // 重置密码
  async resetPassword(data) {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
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