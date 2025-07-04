import { User } from './user-unified';

// 通用类型定义
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}


export interface Participant {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  location: Location;
  startTime: Date;
  endTime: Date;
  creator: User;
  participants: Participant[];
  maxParticipants: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
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