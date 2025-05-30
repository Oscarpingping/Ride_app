export interface User {
  id: string;
  username: string;
  avatar?: string;
  status?: 'online' | 'offline' | 'away';
  lastSeen?: Date;
}

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