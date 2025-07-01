// 使用统一的用户类型定义
import { BaseUser } from './user-unified';

export interface User extends BaseUser {
  bio?: string;
}

export interface Chat {
  _id: string;
  name: string;
  avatar?: string;
  type: 'private' | 'group';
  participants: User[];
  lastMessage?: ChatMessage;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  _id: string;
  chatId: string;
  senderId: User;
  content: string;                 // 消息内容：文本或URL
  type: 'text' | 'emoji' | 'image' | 'video' | 'audio' | 'file' | 'url';
  metadata?: {
    fileName?: string;            // 文件名
    fileSize?: number;            // 文件大小
    mimeType?: string;            // 文件类型
    duration?: number;            // 视频时长
    width?: number;               // 图片/视频宽度
    height?: number;              // 图片/视频高度
    title?: string;               // URL标题
    description?: string;         // URL描述
    thumbnail?: string;           // 缩略图URL
  };
  isRead: boolean;
  isEdited: boolean;             // 是否被编辑过
  isDeleted: boolean;            // 是否被删除
  editHistory?: Array<{          // 编辑历史
    content: string;             // 修改前的内容
    editedAt: Date;              // 修改时间
    editedBy: string;            // 修改者
  }>;
  deletedBy?: string[];          // 谁删除了这条消息
  deleteReason?: string;         // 删除原因
  reactions?: Array<{            // 消息反应
    user: string;                // 用户ID
    emoji: string;               // 表情
    createdAt: Date;             // 添加时间
  }>;
  mentions?: string[];           // 提及的用户
  readBy: Array<{               // 已读信息
    user: string;               // 用户ID
    readAt: Date;               // 阅读时间
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Ride {
  _id: string;
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
  currentParticipants: number;
  isPrivate: boolean;
  organizer: User;
  participants: User[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Club {
  _id: string;
  name: string;
  description: string;
  avatar?: string;
  isPrivate: boolean;
  memberCount: number;
  createdAt: Date;
  updatedAt: Date;
  owner: User;
  members: User[];
}

// 前端工具函数：创建消息的metadata
export const createMessageMetadata = (
  type: 'text' | 'emoji' | 'image' | 'video' | 'audio' | 'file' | 'url',
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
  }
) => {
  switch (type) {
    case 'text':
    case 'emoji':
      return undefined; // 文本和表情不需要metadata
    
    case 'image':
    case 'video':
    case 'audio':
    case 'file':
    case 'url':
      return metadata;
    
    default:
      return metadata;
  }
};

// 前端工具函数：获取消息的显示文本
export const getMessageDisplayText = (content: string, type: string, metadata?: any): string => {
  switch (type) {
    case 'text':
    case 'emoji':
      return content;
    
    case 'image':
    case 'video':
    case 'audio':
      return metadata?.fileName || content.split('/').pop() || 'Media';
    
    case 'file':
      return metadata?.fileName || content.split('/').pop() || 'File';
    
    case 'url':
      return metadata?.title || content;
    
    default:
      return content;
  }
}; 