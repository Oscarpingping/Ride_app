import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/user-unified';
import { ApiResponse } from './types';
import { buildApiUrl, API_ENDPOINTS, HTTP_CONFIG } from '../config/api';

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

// 通用请求函数，包含错误处理和重试机制
const apiRequest = async (
  url: string, 
  options: RequestInit = {},
  retryCount = 0
): Promise<any> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), HTTP_CONFIG.TIMEOUT);
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    console.error('URL:', url);
    console.error('Options:', options);
    console.error('Retry count:', retryCount);
    
    // 如果是网络错误且还有重试次数，则重试
    if (retryCount < HTTP_CONFIG.RETRY_ATTEMPTS && 
        (error instanceof TypeError || error.name === 'AbortError')) {
      console.log('Retrying request...');
      await new Promise(resolve => setTimeout(resolve, HTTP_CONFIG.RETRY_DELAY));
      return apiRequest(url, options, retryCount + 1);
    }
    
    // 返回标准化的错误响应
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
};

// 获取认证头
const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// 用户API接口
export interface UserApiInterface {
  // 登录
  login(data: LoginRequest): Promise<ApiResponse<AuthResponse>>;
  
  // 注册
  register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>>;
  
  // 请求密码重置
  requestPasswordReset(data: { email: string }): Promise<ApiResponse<null>>;
  
  // 重置密码
  resetPassword(data: { token: string; password: string }): Promise<ApiResponse<null>>;
  
  // 获取当前用户信息
  getCurrentUser(): Promise<ApiResponse<User>>;
  
  // 更新用户信息
  updateUser(data: Partial<User>): Promise<ApiResponse<User>>;
}

// 用户API实现
export const UserApi: UserApiInterface = {
  // 登录
  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return apiRequest(buildApiUrl(API_ENDPOINTS.AUTH.LOGIN), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  // 注册
  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    return apiRequest(buildApiUrl(API_ENDPOINTS.AUTH.REGISTER), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  // 请求密码重置
  async requestPasswordReset(data: { email: string }): Promise<ApiResponse<null>> {
    return apiRequest(buildApiUrl(API_ENDPOINTS.AUTH.REQUEST_RESET), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  // 重置密码
  async resetPassword(data: { token: string; password: string }): Promise<ApiResponse<null>> {
    return apiRequest(buildApiUrl(API_ENDPOINTS.AUTH.RESET_PASSWORD), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  // 获取当前用户信息
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return apiRequest(buildApiUrl(API_ENDPOINTS.USERS.ME), {
      headers: await getAuthHeaders(),
    });
  },

  // 更新用户信息
  async updateUser(data: Partial<User>): Promise<ApiResponse<User>> {
    return apiRequest(buildApiUrl(API_ENDPOINTS.USERS.ME), {
      method: 'PATCH',
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });
  },
}; 