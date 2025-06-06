/**
 * 统一的用户类型定义
 * 这个文件包含所有用户相关的类型定义，确保前后端一致性
 */

// 用户偏好相关类型定义
export type TerrainType = 'Road' | 'Mountain' | 'Gravel' | 'MTB' | 'Urban' | 'Mixed';
export type PaceLevel = 'Casual' | 'Moderate' | 'Fast';
export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface UserPreferences {
  terrain: TerrainType[];
  pace: PaceLevel[];
  difficulty: DifficultyLevel[];
}

// 用户偏好选项常量
export const TERRAIN_OPTIONS: TerrainType[] = ['Road', 'Mountain', 'Gravel', 'MTB', 'Urban', 'Mixed'];
export const PACE_OPTIONS: PaceLevel[] = ['Casual', 'Moderate', 'Fast'];
export const DIFFICULTY_OPTIONS: DifficultyLevel[] = ['Beginner', 'Intermediate', 'Advanced'];

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
  createdClubs?: string[];      // 用户创建的俱乐部ID列表
  managedClubs?: string[];      // 用户管理的俱乐部列表
  canCreateClub: boolean;       // 用户创建俱乐部的权限
  profilePicture?: string;      // 兼容旧字段名，实际使用avatar
  emergencyContact?: EmergencyContact;
  preferences?: UserPreferences; // 用户骑行偏好设置
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
  createdClubs?: string[];      // 用户创建的俱乐部ID列表
  managedClubs?: string[];      // 用户管理的俱乐部列表
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
  canCreateClub: boolean;       // 用户创建俱乐部的权限
  rating?: number;
  createdClubs?: string[];      // 用户创建的俱乐部列表
  managedClubs?: string[];      // 用户管理的俱乐部列表
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
  preferences?: UserPreferences; // 添加偏好设置更新
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
  const { password, emergencyContact, createdRides, joinedRides, clubs, ...publicUser } = user;
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
    avatar: user.avatar,
    canCreateClub: user.canCreateClub,
    rating: user.rating,
    createdClubs: user.createdClubs,
    managedClubs: user.managedClubs
  };
}