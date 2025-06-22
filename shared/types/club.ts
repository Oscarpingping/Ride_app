import { ChatMessage } from './entities';

export type ClubType = 'biking' | 'climbing' | 'hiking' | 'skiing' | 'surfing' | 'running' | 'camping';

export interface ClubLocation {
  city: string;
  country: string;
}

export interface ClubStats {
  memberCount: number;
  activityCount?: number;
}

export interface JoinRequest {
  user: {
    userId: string;
    name_sid: string;
    avatar?: string;
  };
  message?: string;
  createdAt: string;
}

export interface JoinRequestHistory extends JoinRequest {
  status: 'approved' | 'rejected';
  response?: string;
  handledBy: {
    userId: string;
    name_sid: string;
    avatar?: string;
  };
  handledAt: string;
}

export interface ChatRoom {
  _id: string;
  club: string;
  name: string;
  type: 'club' | 'group' | 'activity' | 'other';
  members: string[];
  messages: ChatMessage[];
  lastMessage: {
    sender: string;
    content: string;
    type: string;
    timestamp: string;
  };
  maxMembers: number;
  autoDeleteDuration: number;
  createdAt: string;
  updatedAt: string;
}

export interface Club {
  _id: string;
  clubId: string;                // 俱乐部唯一标识符
  name: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  type: ClubType;
  founder: {
    _id: string;
    name: string;
    name_sid: string;
    avatar?: string;
  };
  admins: Array<{
    _id: string;
    name: string;
    name_sid: string;
    avatar?: string;
  }>;
  members: Array<{
    _id: string;
    name: string;
    name_sid: string;
    avatar?: string;
  }>;
  location?: ClubLocation;
  stats: ClubStats;
  rules?: string[];
  tags?: string[];
  isPrivate: boolean;
  joinRequests?: {
    pending: JoinRequest[];
    history: JoinRequestHistory[];
  };
  cardData?: string;
  chatRoom?: ChatRoom;
  contactEmail: string;
  createdAt: string;
  updatedAt: string;
}

// API 请求和响应类型
export interface CreateClubRequest {
  name: string;
  description?: string;
  type: ClubType;
  location?: ClubLocation;
  isPrivate: boolean;
  tags?: string[];
  rules?: string[];
  contactEmail: string;
  logo?: File;
  coverImage?: File;
  createChatRoom?: boolean; // 是否创建聊天室
}

export interface UpdateClubRequest {
  name: string;
  description: string;
  type: ClubType;
  location: ClubLocation;
  isPrivate: boolean;
  tags?: string[];
  rules?: string[];
  contactEmail: string;
  logo?: File;
  coverImage?: File;
}

export interface JoinClubRequest {
  message?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export type ClubResponse = ApiResponse<Club>;
export type ClubListResponse = ApiResponse<Club[]>;
export type ClubMemberResponse = ApiResponse<Array<{
  userId: string;
  name_sid: string;
  avatar?: string;
}>>;
export type ClubAdminResponse = ApiResponse<Array<{
  userId: string;
  name_sid: string;
  avatar?: string;
}>>; 