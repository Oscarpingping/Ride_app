import { getApiBaseUrl, buildApiUrl, API_ENDPOINTS } from '../../shared/config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 设置认证token
export const setAuthToken = async (authToken: string | null) => {
  if (authToken) {
    await AsyncStorage.setItem('token', authToken);
  } else {
    await AsyncStorage.removeItem('token');
  }
};

// 获取认证token
export const getAuthToken = async () => {
  return await AsyncStorage.getItem('token');
};

// 记录请求日志
const logRequest = (method: string, url: string, data?: any) => {
  console.log(`[${new Date().toISOString()}] 📤 发送请求:
    Method: ${method}
    URL: ${url}
    Data: ${JSON.stringify(data, null, 2)}
  `);
};

// 修改 request 函数
const request = async <T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any
): Promise<T> => {
  const url = buildApiUrl(endpoint);
  
  // 记录请求日志
  logRequest(method, url, data);

  try {
    const headers: Record<string, string> = {};
    
    // 只有在不是 FormData 时才设置 Content-Type
    if (!(data instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    
    // 添加认证头
    const token = await getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method,
      headers,
      body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined),
    });

    // 记录响应日志
    console.log(`[${new Date().toISOString()}] 📥 收到响应:
      Status: ${response.status}
      URL: ${url}
    `);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error: unknown) {
    console.error(`[${new Date().toISOString()}] ❌ 请求失败:
      URL: ${url}
      Error: ${error instanceof Error ? error.message : 'Unknown error'}
    `);
    throw error;
  }
};

// 认证相关API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    request(API_ENDPOINTS.AUTH.LOGIN, 'POST', credentials),
  
  register: (userData: { email: string; password: string; name: string }) =>
    request(API_ENDPOINTS.AUTH.REGISTER, 'POST', userData),
  
  refreshToken: () =>
    request(API_ENDPOINTS.AUTH.REFRESH_TOKEN, 'POST'),
  
  logout: () =>
    request(API_ENDPOINTS.AUTH.LOGOUT, 'POST'),
  
  requestPasswordReset: (email: string) =>
    request(API_ENDPOINTS.AUTH.REQUEST_RESET, 'POST', { email }),
  
  resetPassword: (token: string, newPassword: string) =>
    request(API_ENDPOINTS.AUTH.RESET_PASSWORD, 'POST', { token, newPassword }),
};

// 用户相关API
export const userAPI = {
  getMe: () => request(API_ENDPOINTS.USERS.ME),
  getProfile: () => request(API_ENDPOINTS.USERS.PROFILE),
};

// 活动相关API
export const rideAPI = {
  getRides: () => request(API_ENDPOINTS.RIDES.BASE),
  createRide: (rideData: any) => request(API_ENDPOINTS.RIDES.CREATE, 'POST', rideData),
  joinRide: (id: string) => request(API_ENDPOINTS.RIDES.JOIN(id), 'POST'),
  leaveRide: (id: string) => request(API_ENDPOINTS.RIDES.LEAVE(id), 'DELETE'),
};

// 俱乐部相关API
export const clubApi = {
  getClubs: () => request(API_ENDPOINTS.CLUBS.BASE),
  createClub: (clubData: any) => request(API_ENDPOINTS.CLUBS.CREATE, 'POST', clubData),
  joinClub: (id: string) => request(API_ENDPOINTS.CLUBS.JOIN(id), 'POST'),
  leaveClub: (id: string) => request(API_ENDPOINTS.CLUBS.LEAVE(id), 'DELETE'),
  getUserClubs: () => request(API_ENDPOINTS.CLUBS.USER_CLUBS),
};

// 联系人相关API
export const contactAPI = {
  getContacts: () => request(API_ENDPOINTS.CONTACTS.BASE),
  addContact: (contactData: any) => request(API_ENDPOINTS.CONTACTS.ADD, 'POST', contactData),
  removeContact: (id: string) => request(API_ENDPOINTS.CONTACTS.REMOVE(id), 'DELETE'),
};

// 消息相关API
export const messageAPI = {
  getMessages: () => request(API_ENDPOINTS.MESSAGES.BASE),
  getConversations: () => request(API_ENDPOINTS.MESSAGES.CONVERSATIONS),
  sendMessage: (messageData: any) => request(API_ENDPOINTS.MESSAGES.SEND, 'POST', messageData),
};

// 导出默认的request函数供其他地方使用
export { request }; 