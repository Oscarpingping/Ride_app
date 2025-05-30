// 通用类型定义
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

// 使用统一的用户类型定义
import { UserSummary } from './user-unified';

// 为了向后兼容，保留User接口但使用统一的定义
export interface User {
  id: string; // 注意：这里保持id而不是_id，为了兼容现有代码
  name: string;
  email: string;
  avatar?: string;
  rating?: number;
}

// 推荐使用的新类型
export { UserSummary };

export interface Participant {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface BaseActivity {
  id: string;
  title: string;
  description: string;
  date: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  creatorId: string;
  creator: User;
  participants: Participant[];
  location: Location;
  createdAt: Date;
  updatedAt: Date;
}

// 通用枚举类型
export enum TerrainType {
  Road = 'Road',
  Mountain = 'Mountain',
  Gravel = 'Gravel',
  Urban = 'Urban'
}

export enum PaceLevel {
  Casual = 'Casual',
  Moderate = 'Moderate',
  Fast = 'Fast'
}

export enum DifficultyLevel {
  Beginner = 'Beginner',
  Intermediate = 'Intermediate',
  Advanced = 'Advanced',
  Expert = 'Expert'
}

export enum GenderPreference {
  All = 'All',
  Male = 'Male',
  Female = 'Female'
} 