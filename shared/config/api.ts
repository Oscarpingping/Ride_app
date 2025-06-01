/**
 * API配置文件
 * 统一管理所有API端点和配置
 */

// 获取API基础URL
export const getApiBaseUrl = (): string => {
  // 在React Native环境中
  if (typeof window === 'undefined') {
    // 开发环境
    if (__DEV__) {
      return 'http://localhost:5001';
    }
    // 生产环境
    return 'https://your-production-api.com';
  }
  
  // 在Web环境中
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:5001';
  }
  
  return 'https://your-production-api.com';
};

// API端点配置
export const API_ENDPOINTS = {
  // 认证相关
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REFRESH_TOKEN: '/api/auth/refresh-token',
    LOGOUT: '/api/auth/logout',
    REQUEST_RESET: '/api/auth/request-reset',
    RESET_PASSWORD: '/api/auth/reset-password',
  },
  
  // 用户相关
  USERS: {
    ME: '/api/users/me',
    PROFILE: '/api/users/profile',
  },
  
  // 活动相关
  RIDES: {
    BASE: '/api/rides',
    CREATE: '/api/rides',
    JOIN: (id: string) => `/api/rides/${id}/join`,
    LEAVE: (id: string) => `/api/rides/${id}/leave`,
  },
  
  // 俱乐部相关
  CLUBS: {
    BASE: '/api/clubs',
    CREATE: '/api/clubs',
    JOIN: (id: string) => `/api/clubs/${id}/join`,
    LEAVE: (id: string) => `/api/clubs/${id}/leave`,
    USER_CLUBS: '/api/clubs/user',
  },
  
  // 联系人相关
  CONTACTS: {
    BASE: '/api/contacts',
    ADD: '/api/contacts',
    REMOVE: (id: string) => `/api/contacts/${id}`,
  },
  
  // 消息相关
  MESSAGES: {
    BASE: '/api/messages',
    CONVERSATIONS: '/api/messages/conversations',
    SEND: '/api/messages/send',
  },
};

// HTTP请求配置
export const HTTP_CONFIG = {
  TIMEOUT: 10000, // 10秒超时
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1秒重试延迟
};

// 构建完整的API URL
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${endpoint}`;
};