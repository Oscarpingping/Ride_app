// 使用统一的Socket用户类型定义
import { SocketUser, UserStatus } from './user-unified';

export interface User extends SocketUser {}

// 为了向后兼容，保留旧的状态类型
export type UserStatusLegacy = 'online' | 'offline' | 'away';

// 重新导出统一的类型
export { SocketUser, UserStatus };

export interface Message {
  id: string;
  type: 'DIRECT' | 'GROUP';
  senderId: string;
  receiverId?: string;  // 直接消息的接收者ID
  content: string;
  timestamp: Date;
  roomId?: string;
  status: 'SENDING' | 'SENT' | 'DELIVERED' | 'READ';
  metadata?: {
    rideId?: string;
    activityId?: string;
    isDirect?: boolean;
  };
}

export interface ChatRoom {
  id: string;
  type: 'PRIVATE' | 'GROUP';
  name?: string;
  participants: string[];
  lastMessage?: Message;
  createdAt: Date;
  updatedAt: Date;
}

export interface DirectChat {
  id: string;
  participants: [string, string];  // 两个用户ID的元组
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: Date;
  isBlocked: boolean;
  isMuted: boolean;
}

export interface SocketEvent {
  type: 'MESSAGE' | 'TYPING' | 'READ' | 'ONLINE' | 'OFFLINE';
  data: any;
} 