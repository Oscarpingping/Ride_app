import { User } from './user';

export type ClubType = 'biking' | 'climbing' | 'hiking' | 'skiing' | 'surfing' | 'running' | 'camping';

export interface ClubLocation {
  city: string;
  province: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface ClubStats {
  memberCount: number;
  activityCount: number;
}

export interface JoinRequest {
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  message?: string;
  createdAt: string;
}

export interface JoinRequestHistory extends JoinRequest {
  status: 'approved' | 'rejected';
  response?: string;
  handledBy: {
    _id: string;
    name: string;
    avatar?: string;
  };
  handledAt: string;
}

export interface Club {
  _id: string;
  name: string;
  description: string;
  logo?: string;
  coverImage?: string;
  type: ClubType;
  founder: {
    _id: string;
    name: string;
    avatar?: string;
  };
  admins: Array<{
    _id: string;
    name: string;
    avatar?: string;
  }>;
  members: Array<{
    _id: string;
    name: string;
    avatar?: string;
  }>;
  location: ClubLocation;
  stats: ClubStats;
  rules: string[];
  tags: string[];
  isPrivate: boolean;
  joinRequests: {
    pending: JoinRequest[];
    history: JoinRequestHistory[];
  };
  recentActivities: Array<{
    _id: string;
    title: string;
    date: string;
  }>;
  createdAt: string;
  updatedAt: string;
} 