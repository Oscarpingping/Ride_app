/**
 * API配置文件
 * 统一管理所有API端点和配置
 */

// 获取API基础URL
export const getApiBaseUrl = (): string => {
  // 优先使用环境变量中的配置
  const envApiUrl = process.env.API_BASE_URL || process.env.EXPO_PUBLIC_API_URL;
  if (envApiUrl) {
    console.log('[API] Using environment variable URL:', envApiUrl);
    return envApiUrl;
  }

  // 在React Native环境中
  if (typeof window === 'undefined' || !window.location) {
    // 开发环境
    if (__DEV__) {
      const devUrl = 'http://192.168.1.50:5001';
      console.log('[API] Using development URL for React Native:', devUrl);
      return devUrl;
    }
    // 生产环境
    const prodUrl = 'http://3.139.190.107:5001';
    console.log('[API] Using production URL for React Native:', prodUrl);
    return prodUrl;
  }
  
  // 在Web环境中
  if (process.env.NODE_ENV === 'development') {
    const webDevUrl = 'http://192.168.1.50:5001';
    console.log('[API] Using development URL for Web:', webDevUrl);
    return webDevUrl;
  }
  
  // Web环境生产环境 - 使用环境变量中的配置
  const webProdUrl = process.env.EXPO_PUBLIC_API_URL || '';
  console.log('[API] Using production URL for Web:', webProdUrl);
  return webProdUrl;
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
  
  // 聊天室相关
  CHATROOMS: {
    BASE: '/api/chatrooms',
    ONE: (id: string) => `/api/chatrooms/${id}`,
  },
};

// HTTP请求配置
export const HTTP_CONFIG = {
  TIMEOUT: 10000, // 10秒超时
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1秒重试延迟
  LOG_REQUESTS: false, // 关闭请求日志
};

// 构建完整的API URL
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();
  const fullUrl = `${baseUrl}${endpoint}`;
  
  // 添加请求日志
  if (HTTP_CONFIG.LOG_REQUESTS) {
    // console.log('🔍 API Request Details:', {
    //   baseUrl: getApiBaseUrl(),
    //   endpoint,
    //   environment: __DEV__ ? 'development' : 'production',
    //   fullUrl,
    //   platform: typeof window === 'undefined' ? 'react-native' : 'web'
    // });
  }
  
  return fullUrl;
};