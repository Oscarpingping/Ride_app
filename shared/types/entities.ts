export interface User {
  _id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
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
  sender: User;
  content: string;
  type: 'text' | 'image' | 'location';
  metadata?: Record<string, any>;
  isRead: boolean;
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