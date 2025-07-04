

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// 使用统一的用户类型定义
import { 
  AuthUser, 
  LoginRequest as UnifiedLoginRequest, 
  RegisterRequest as UnifiedRegisterRequest, 
  UpdateProfileRequest as UnifiedUpdateProfileRequest 
} from '../types/user-unified';

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: AuthUser;
}

export interface LoginRequest extends UnifiedLoginRequest {}
export interface RegisterRequest extends UnifiedRegisterRequest {}
export interface UpdateProfileRequest extends UnifiedUpdateProfileRequest {}



export interface SendMessageRequest {
  conversationId: string;
  content: string;
  type: 'text' | 'emoji' | 'image' | 'video' | 'audio' | 'file' | 'url';
  metadata?: {
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    duration?: number;
    width?: number;
    height?: number;
    title?: string;
    description?: string;
    thumbnail?: string;
  };
}

// 使用 club.ts 中定义的俱乐部相关类型
export { CreateClubRequest, UpdateClubRequest, JoinClubRequest } from '../types/club';




