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

export interface ChatMessage {
  sender: string;                 // 发送者的 name_sid
  type: 'text' | 'emoji' | 'image' | 'video' | 'file' | 'location';
  content: string;                // 消息内容
  metadata?: {                    // 媒体文件的元数据
    fileName?: string;            // 文件名
    fileSize?: number;            // 文件大小
    mimeType?: string;            // 文件类型
    duration?: number;            // 视频时长
    thumbnail?: string;           // 缩略图URL
    location?: {                  // 位置信息
      latitude: number;
      longitude: number;
      address?: string;
    };
  };
  createdAt: string;             // 发送时间
  updatedAt: string;             // 最后编辑时间
  isEdited: boolean;             // 是否被编辑过
  isDeleted: boolean;            // 是否被删除
}

export interface ChatRoom {
  _id: string;
  club: string;                  // 俱乐部ID
  messages: ChatMessage[];
  lastMessage: {
    sender: string;
    content: string;
    type: string;
    timestamp: string;
  };
  createdAt: string;
  updatedAt: string;
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
  chatRoom?: ChatRoom;           // 聊天室信息
  recentActivities: Array<{
    _id: string;
    title: string;
    date: string;
  }>;
  createdAt: string;
  updatedAt: string;
} 