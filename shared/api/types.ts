import { User as UserEntity, Chat as ChatEntity, ChatMessage as ChatMessageEntity, Club as ClubEntity, Ride as RideEntity } from '../types/entities';

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

export interface CreateRideRequest {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  meetingPoint: {
    latitude: number;
    longitude: number;
    address: string;
  };
  route: {
    type: 'road' | 'mountain' | 'gravel';
    distance: number;
    elevation: number;
  };
  difficulty: 'easy' | 'medium' | 'hard';
  pace: number;
  maxParticipants: number;
  isPrivate: boolean;
}

export interface UpdateRideRequest extends Partial<CreateRideRequest> {}

export interface SendMessageRequest {
  conversationId: string;
  content: string;
  type: 'text' | 'image' | 'location';
  metadata?: Record<string, any>;
}

export interface CreateClubRequest {
  name: string;
  description: string;
  avatar?: string;
  isPrivate: boolean;
}

export interface UpdateClubRequest extends Partial<CreateClubRequest> {
  id: string;
}

export interface User extends UserEntity {}
export interface Chat extends ChatEntity {}
export interface ChatMessage extends ChatMessageEntity {}
export interface Club extends ClubEntity {}
export interface Ride extends RideEntity {}

export interface CreateGroupRequest {
  name: string;
  description: string;
  avatar?: string;
  isPrivate: boolean;
}

export interface UpdateGroupRequest extends Partial<CreateGroupRequest> {}
