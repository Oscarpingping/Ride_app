export const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
export const SOCKET_PATH = '/socket.io';

export const MESSAGE_TYPES = {
  PRIVATE: 'PRIVATE',
  GROUP: 'GROUP',
} as const;

export const MESSAGE_STATUS = {
  SENDING: 'SENDING',
  SENT: 'SENT',
  DELIVERED: 'DELIVERED',
  READ: 'READ',
} as const;

export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  MESSAGE: 'message',
  TYPING: 'typing',
  READ: 'read',
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
} as const; 