import { getApiBaseUrl, buildApiUrl, API_ENDPOINTS } from '../../shared/config/api';

// 存储认证token
let token: string | null = null;

// 设置认证token
export const setAuthToken = (authToken: string | null) => {
  token = authToken;
};

// 获取认证token
export const getAuthToken = () => token;

// 添加请求日志函数
const logRequest = (method: string, url: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`\n[${timestamp}] 📤 发送请求:
    Method: ${method}
    URL: ${url}
    ${data ? `Data: ${JSON.stringify(data, null, 2)}` : ''}
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
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: data ? JSON.stringify(data) : undefined,
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
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ 请求失败:
      URL: ${url}
      Error: ${error.message}
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
export const clubAPI = {
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