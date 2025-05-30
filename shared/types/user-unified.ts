/**
 * 统一的用户类型定义
 * 这个文件包含所有用户相关的类型定义，确保前后端一致性
 */

// 基础用户信息（最小集合）
export interface BaseUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 完整用户信息（包含所有字段）
export interface User extends BaseUser {
  bio?: string;
  rating?: number;
  ridesJoined?: number;
  ridesCreated?: number;
  createdRides?: string[];
  joinedRides?: string[];
  clubs?: ClubReference[];
  profilePicture?: string; // 兼容旧字段名，实际使用avatar
  emergencyContact?: EmergencyContact;
  // 密码字段仅在后端使用，前端不包含
  password?: never;
}

// 用户简要信息（用于列表显示）
export interface UserSummary {
  _id: string;
  name: string;
  avatar?: string;
  rating?: number;
}

// 用户公开信息（用于其他用户查看）
export interface UserPublic extends BaseUser {
  bio?: string;
  rating?: number;
  ridesJoined?: number;
  ridesCreated?: number;
  // 不包含敏感信息如email等
}

// Socket连接用户信息
export interface SocketUser {
  _id: string;
  name: string;
  avatar?: string;
  status?: UserStatus;
  lastSeen?: Date;
}

// 俱乐部引用
export interface ClubReference {
  club: string;
  joinedAt: Date;
}

// 紧急联系人
export interface EmergencyContact {
  name: string;
  phone: string;
}

// 用户状态枚举
export enum UserStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  AWAY = 'away'
}

// 用户状态管理
export interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// 认证相关类型
export interface AuthUser {
  _id: string;
  email: string;
  name: string;
  avatar?: string;
}

// API请求类型
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface UpdateProfileRequest {
  name?: string;
  avatar?: string;
  bio?: string;
  emergencyContact?: EmergencyContact;
}

// 好友相关类型
export interface Friend {
  _id: string;
  userId: string;
  friendId: string;
  friend: UserSummary;
  description?: string; // 用户为好友添加的描述
  createdAt: Date;
  updatedAt: Date;
}

export interface FriendRequest {
  _id: string;
  fromUserId: string;
  toUserId: string;
  fromUser: UserSummary;
  toUser: UserSummary;
  status: FriendRequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum FriendRequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected'
}

// 类型守卫函数
export function isUser(obj: any): obj is User {
  return obj && typeof obj._id === 'string' && typeof obj.name === 'string' && typeof obj.email === 'string';
}

export function isUserSummary(obj: any): obj is UserSummary {
  return obj && typeof obj._id === 'string' && typeof obj.name === 'string';
}

// 类型转换工具函数
export function toUserSummary(user: User | BaseUser): UserSummary {
  return {
    _id: user._id,
    name: user.name,
    avatar: user.avatar,
    rating: 'rating' in user ? user.rating : undefined
  };
}

export function toUserPublic(user: User): UserPublic {
  const { email, password, emergencyContact, createdRides, joinedRides, clubs, ...publicUser } = user;
  return publicUser;
}

export function toSocketUser(user: User | BaseUser, status: UserStatus = UserStatus.ONLINE): SocketUser {
  return {
    _id: user._id,
    name: user.name,
    avatar: user.avatar,
    status,
    lastSeen: new Date()
  };
}

export function toAuthUser(user: User): AuthUser {
  return {
    _id: user._id,
    email: user.email,
    name: user.name,
    avatar: user.avatar
  };
}