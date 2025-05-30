const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

export const ENDPOINTS = {
  // 用户认证
  AUTH: {
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    REFRESH_TOKEN: `${API_BASE_URL}/auth/refresh-token`,
    VERIFY: `${API_BASE_URL}/auth/verify`,
  },
  
  // 用户相关
  USERS: {
    PROFILE: `${API_BASE_URL}/users/profile`,
    UPDATE_PROFILE: `${API_BASE_URL}/users/profile`,
    UPLOAD_AVATAR: `${API_BASE_URL}/users/avatar`,
  },
  
  // 骑行活动相关
  RIDES: {
    LIST: `${API_BASE_URL}/rides`,
    CREATE: `${API_BASE_URL}/rides`,
    DETAIL: (id: string) => `${API_BASE_URL}/rides/${id}`,
    UPDATE: (id: string) => `${API_BASE_URL}/rides/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/rides/${id}`,
    JOIN: (id: string) => `${API_BASE_URL}/rides/${id}/join`,
    LEAVE: (id: string) => `${API_BASE_URL}/rides/${id}/leave`,
    PARTICIPANTS: (id: string) => `${API_BASE_URL}/rides/${id}/participants`,
  },
  
  // 消息相关
  MESSAGES: {
    CHATS: `${API_BASE_URL}/messages/chats`,
    CHAT: (id: string) => `${API_BASE_URL}/messages/chats/${id}`,
    MESSAGES: (chatId: string) => `${API_BASE_URL}/messages/chats/${chatId}/messages`,
    SEND: (chatId: string) => `${API_BASE_URL}/messages/chats/${chatId}/messages`,
    MARK_READ: (chatId: string) => `${API_BASE_URL}/messages/chats/${chatId}/read`,
  },
  
  // 俱乐部相关
  CLUBS: {
    LIST: `${API_BASE_URL}/clubs`,
    CREATE: `${API_BASE_URL}/clubs`,
    DETAIL: (id: string) => `${API_BASE_URL}/clubs/${id}`,
    UPDATE: (id: string) => `${API_BASE_URL}/clubs/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/clubs/${id}`,
    JOIN: (id: string) => `${API_BASE_URL}/clubs/${id}/join`,
    LEAVE: (id: string) => `${API_BASE_URL}/clubs/${id}/leave`,
    MEMBERS: (id: string) => `${API_BASE_URL}/clubs/${id}/members`,
  },
};
