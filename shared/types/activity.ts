import { Location, User, Participant } from './common';

// 活动状态
export enum ActivityStatus {
  Upcoming = 'upcoming',
  Ongoing = 'ongoing',
  Completed = 'completed',
  Cancelled = 'cancelled'
}

// 活动类型
export enum ActivityType {
  Biking = 'biking',
  Climbing = 'climbing',
  Hiking = 'hiking',
  Skiing = 'skiing',
  Surfing = 'surfing',
  Running = 'running',
  Camping = 'camping'
}

// 基础活动接口
export interface BaseActivity {
  id: string;
  title: string;
  description: string;
  type: ActivityType;
  status: ActivityStatus;
  date: string;
  creatorId: string;
  creator: User;
  participants: Participant[];
  location: Location;
  clubId?: string;  // 关联的俱乐部ID
  cardData: any;    // 具体活动类型的数据卡片
  createdAt: Date;
  updatedAt: Date;
}

// 活动创建参数
export interface CreateActivityParams {
  title: string;
  description: string;
  type: ActivityType;
  date: string;
  location: Location;
  clubId?: string;
  cardData: any;  // 具体活动类型的数据卡片
}

// 活动更新参数
export interface UpdateActivityParams {
  title?: string;
  description?: string;
  date?: string;
  location?: Location;
  status?: ActivityStatus;
  cardData?: any;
} 