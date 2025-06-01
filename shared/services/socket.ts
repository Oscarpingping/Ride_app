import { io, Socket } from 'socket.io-client';
import { Message, DirectChat } from '../types/socket';
import { API_BASE_URL, SOCKET_EVENTS } from '../config';

export class SocketService {
  private static instance: SocketService;
  private socket: Socket;
  private messageQueue: Map<string, Message>;
  // private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private currentUserId?: string;
  private onlineUsers: Set<string> = new Set();

  private constructor() {
    this.socket = io(API_BASE_URL, {
      transports: ['websocket'],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
    });

    this.messageQueue = new Map();
    this.setupListeners();
  }

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  private setupListeners() {
    this.socket.on(SOCKET_EVENTS.CONNECT, () => {
      console.log('Connected to socket server');
      // this.reconnectAttempts = 0;
      this.syncMessageQueue();
    });

    this.socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      console.log('Disconnected from socket server');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    this.socket.on('user_online', (userId: string) => {
      this.onlineUsers.add(userId);
      this.emit('user_status_change', { userId, status: 'online' });
    });

    this.socket.on('user_offline', (userId: string) => {
      this.onlineUsers.delete(userId);
      this.emit('user_status_change', { userId, status: 'offline' });
    });
  }

  public connect(token: string, userId: string) {
    this.currentUserId = userId;
    this.socket.auth = { token };
    this.socket.connect();
  }

  public disconnect() {
    this.socket.disconnect();
    this.currentUserId = undefined;
  }

  public sendDirectMessage(receiverId: string, content: string) {
    if (!this.currentUserId) return;

    const message: Omit<Message, 'id' | 'timestamp'> = {
      type: 'DIRECT',
      senderId: this.currentUserId,
      receiverId,
      content,
      status: 'SENDING',
      metadata: {
        isDirect: true
      }
    };

    this.socket.emit('direct_message', message);
  }

  public markMessageAsRead(messageId: string) {
    this.socket.emit('mark_read', { messageId });
  }

  public markChatAsRead(chatId: string) {
    this.socket.emit('mark_chat_read', { chatId });
  }

  public blockUser(userId: string) {
    this.socket.emit('block_user', { userId });
  }

  public unblockUser(userId: string) {
    this.socket.emit('unblock_user', { userId });
  }

  public muteChat(chatId: string) {
    this.socket.emit('mute_chat', { chatId });
  }

  public unmuteChat(chatId: string) {
    this.socket.emit('unmute_chat', { chatId });
  }

  public isUserOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }

  // 事件监听器
  public onDirectMessage(callback: (message: Message) => void) {
    this.socket.on('direct_message', callback);
  }

  public onUserStatusChange(callback: (data: { userId: string; status: 'online' | 'offline' }) => void) {
    this.socket.on('user_status_change', callback);
  }

  public onMessageRead(callback: (data: { messageId: string; userId: string }) => void) {
    this.socket.on('message_read', callback);
  }

  public onChatUpdated(callback: (chat: DirectChat) => void) {
    this.socket.on('chat_updated', callback);
  }

  private emit(event: string, data: any) {
    this.socket.emit(event, data);
  }

  // private generateMessageId(): string {
  //   return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  // }

  private async syncMessageQueue() {
    for (const [, message] of this.messageQueue) {
      if (message.status === 'SENDING') {
        this.socket.emit('message', message);
      }
    }
  }
} 