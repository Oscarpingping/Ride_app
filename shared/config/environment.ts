/**
 * 环境变量配置管理器
 * 统一管理所有环境变量的读取和默认值
 */

// 获取环境变量的辅助函数
const getEnvVar = (key: string, fallback?: string): string => {
  // 在 React Native 中，只有以 EXPO_PUBLIC_ 开头的变量可以在客户端访问
  const value = process.env[key] || process.env[`EXPO_PUBLIC_${key}`] || fallback;
  return value || '';
};

// 检测当前运行环境
const isReactNative = typeof window === 'undefined' || !window.location;
const isDevelopment = __DEV__ || process.env.NODE_ENV === 'development';

// 获取 API 基础 URL
export const getApiBaseUrl = (): string => {
  // 优先级：
  // 1. EXPO_PUBLIC_API_URL (React Native 客户端可访问)
  // 2. API_BASE_URL (服务端和 Web 可访问)
  // 3. 默认值
  
  const apiUrl = process.env.EXPO_PUBLIC_API_URL || 
                 process.env.API_BASE_URL;
  
  if (apiUrl) {
    return apiUrl;
  }

  // 如果没有环境变量，使用默认值
  if (isDevelopment) {
    // 开发环境默认值 - 使用实际 IP 而不是 localhost
    return 'http://192.168.1.50:5001';
  }

  // 生产环境默认值
  return 'https://3.139.190.107:5001';
};

// 获取其他环境变量
export const getMapboxToken = (): string => {
  return getEnvVar('MAPBOX_ACCESS_TOKEN', '');
};

export const getGoogleMapsApiKey = (): string => {
  return getEnvVar('GOOGLE_MAPS_API_KEY', '');
};

export const getNginxUrl = (): string => {
  return getEnvVar('NGINX_URL', isDevelopment ? 'http://192.168.1.50' : 'http://3.139.190.107');
};

// 获取地图服务 URL
export const getGeocodingUrl = (): string => {
  return getEnvVar('GEOCODING_URL', 'https://nominatim.openstreetmap.org');
};

// 获取默认头像 URL
export const getDefaultAvatarUrl = (): string => {
  return getEnvVar('DEFAULT_AVATAR_URL', 'https://i.pravatar.cc/150?u=default');
};

// 获取占位符图片 URL
export const getPlaceholderImageUrl = (): string => {
  return getEnvVar('PLACEHOLDER_IMAGE_URL', 'https://via.placeholder.com');
};

// 导出环境配置对象
export const ENV_CONFIG = {
  API_BASE_URL: getApiBaseUrl(),
  MAPBOX_ACCESS_TOKEN: getMapboxToken(),
  GOOGLE_MAPS_API_KEY: getGoogleMapsApiKey(),
  NGINX_URL: getNginxUrl(),
  GEOCODING_URL: getGeocodingUrl(),
  DEFAULT_AVATAR_URL: getDefaultAvatarUrl(),
  PLACEHOLDER_IMAGE_URL: getPlaceholderImageUrl(),
  IS_DEVELOPMENT: isDevelopment,
  IS_REACT_NATIVE: isReactNative,
} as const;

// 调试信息（仅在开发环境）
if (isDevelopment && typeof console !== 'undefined') {
  console.log('🔧 Environment Config:', {
    API_BASE_URL: ENV_CONFIG.API_BASE_URL,
    IS_DEVELOPMENT: ENV_CONFIG.IS_DEVELOPMENT,
    IS_REACT_NATIVE: ENV_CONFIG.IS_REACT_NATIVE,
    // 不打印敏感信息如 API keys
  });
}

export default ENV_CONFIG;