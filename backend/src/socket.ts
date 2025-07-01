import { Server as SocketIOServer, Socket } from 'socket.io';
import { Application } from 'express';
import { User } from './models/User';

// 扩展SocketIOServer接口以支持自定义方法
interface ExtendedSocketIOServer extends SocketIOServer {
  getOnlineUsers(): OnlineUser[];
  getOnlineUser(userId: string): OnlineUser | undefined;
  isUserOnline(userId: string): boolean;
}

// 用户在线状态管理
interface OnlineUser {
  userId: string;
  socketId: string;
  name: string;
  avatar?: string;
  joinedRooms: string[];
}

const onlineUsers = new Map<string, OnlineUser>();

export function initSocketIO(server: any, app: Application): ExtendedSocketIOServer {
  const io = new SocketIOServer(server, { 
    cors: { 
      origin: '*',
      methods: ['GET', 'POST']
    } 
  }) as ExtendedSocketIOServer;
  app.set('io', io);

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket.IO] New connection: ${socket.id}`);

    // 用户登录认证
    socket.on('login', async (userId: string) => {
      try {
        if (userId) {
          // 获取用户信息
          const user = await User.findById(userId);
          if (user) {
            // 存储用户信息到socket
            socket.data.userId = userId;
            socket.data.userName = user.name;
            socket.data.userNameSid = user.name_sid;
            socket.data.userAvatar = user.avatar;

            // 加入用户个人房间（用于私聊推送）
            socket.join(userId);
            
            // 更新在线用户列表
            onlineUsers.set(userId, {
              userId,
              socketId: socket.id,
              name: user.name,
              avatar: user.avatar,
              joinedRooms: []
            });

            console.log(`[Socket.IO] User ${user.name} (${userId}) logged in`);
            
            // 通知用户登录成功
            socket.emit('login_success', {
              userId,
              userName: user.name,
              userAvatar: user.avatar
            });
          }
        }
      } catch (error) {
        console.error(`[Socket.IO] Login error:`, error);
        socket.emit('login_error', { error: 'Authentication failed' });
      }
    });

    // 用户进入群聊/聊天室
    socket.on('join_room', async (chatRoomId: string) => {
      try {
        if (chatRoomId && socket.data.userId) {
          socket.join(chatRoomId);
          
          // 更新用户的加入房间记录
          const onlineUser = onlineUsers.get(socket.data.userId);
          if (onlineUser && !onlineUser.joinedRooms.includes(chatRoomId)) {
            onlineUser.joinedRooms.push(chatRoomId);
          }

          console.log(`[Socket.IO] User ${socket.data.userName} joined room ${chatRoomId}`);
          
          // 通知房间其他成员有新用户加入
          socket.to(chatRoomId).emit('user_joined_room', {
            userId: socket.data.userId,
            userName: socket.data.userName,
            userAvatar: socket.data.userAvatar,
            chatRoomId,
            timestamp: new Date()
          });

          // 获取房间在线成员列表
          const roomSockets = await io.in(chatRoomId).fetchSockets();
          const onlineMembers = roomSockets
            .map(s => ({ 
              userId: s.data.userId, 
              userName: s.data.userName, 
              userAvatar: s.data.userAvatar 
            }))
            .filter(member => member.userId);

          // 发送房间在线成员列表给新加入的用户
          socket.emit('room_online_members', {
            chatRoomId,
            members: onlineMembers,
            count: onlineMembers.length
          });
        }
      } catch (error) {
        console.error(`[Socket.IO] Join room error:`, error);
      }
    });

    // 用户离开群聊/聊天室
    socket.on('leave_room', (chatRoomId: string) => {
      try {
        if (chatRoomId && socket.data.userId) {
          socket.leave(chatRoomId);
          
          // 更新用户的离开房间记录
          const onlineUser = onlineUsers.get(socket.data.userId);
          if (onlineUser) {
            onlineUser.joinedRooms = onlineUser.joinedRooms.filter(room => room !== chatRoomId);
          }

          console.log(`[Socket.IO] User ${socket.data.userName} left room ${chatRoomId}`);
          
          // 通知房间其他成员有用户离开
          socket.to(chatRoomId).emit('user_left_room', {
            userId: socket.data.userId,
            userName: socket.data.userName,
            chatRoomId,
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error(`[Socket.IO] Leave room error:`, error);
      }
    });

    // 处理打字状态
    socket.on('typing', (data: { chatRoomId: string; isTyping: boolean }) => {
      try {
        if (data.chatRoomId && socket.data.userId) {
          const eventData = {
            userId: socket.data.userId,
            userName: socket.data.userName,
            chatRoomId: data.chatRoomId,
            isTyping: data.isTyping,
            timestamp: new Date()
          };

          // 通知房间其他成员用户的打字状态
          socket.to(data.chatRoomId).emit('user_typing', eventData);
        }
      } catch (error) {
        console.error(`[Socket.IO] Typing event error:`, error);
      }
    });

    // 处理消息已读状态
    socket.on('message_read', (data: { messageId: string; chatRoomId?: string; senderId?: string }) => {
      try {
        if (socket.data.userId) {
          const eventData = {
            messageId: data.messageId,
            readBy: socket.data.userId,
            readByUserName: socket.data.userName,
            timestamp: new Date()
          };

          // 如果是聊天室消息，通知房间其他成员
          if (data.chatRoomId) {
            socket.to(data.chatRoomId).emit('message_read_status', eventData);
          }
          
          // 如果是私聊消息，通知发送者
          if (data.senderId) {
            socket.to(data.senderId).emit('message_read_status', eventData);
          }
        }
      } catch (error) {
        console.error(`[Socket.IO] Message read event error:`, error);
      }
    });

    // 获取在线用户列表
    socket.on('get_online_users', (chatRoomId: string) => {
      try {
        if (chatRoomId) {
          io.in(chatRoomId).fetchSockets().then(roomSockets => {
            const onlineMembers = roomSockets
              .map(s => ({ 
                userId: s.data.userId, 
                userName: s.data.userName, 
                userAvatar: s.data.userAvatar 
              }))
              .filter(member => member.userId);

            socket.emit('online_users', {
              chatRoomId,
              members: onlineMembers,
              count: onlineMembers.length
            });
          });
        }
      } catch (error) {
        console.error(`[Socket.IO] Get online users error:`, error);
      }
    });

    // 聊天室信息更新事件
    socket.on('chatroom_updated', (data: { chatRoomId: string; updates: any }) => {
      try {
        if (data.chatRoomId) {
          // 通知聊天室所有成员信息已更新
          io.to(data.chatRoomId).emit('chatroom_info_updated', {
            chatRoomId: data.chatRoomId,
            updates: data.updates,
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error(`[Socket.IO] Chatroom update event error:`, error);
      }
    });

    // 处理用户提及通知
    socket.on('user_mentioned', (data: { chatRoomId: string; userId: string; message: string; mentionedBy: string; mentionedByUserName?: string }) => {
      try {
        if (data.userId && socket.data.userId) {
          // 直接通知被提及的用户
          io.to(data.userId).emit('user_mentioned', {
            chatRoomId: data.chatRoomId,
            userId: data.userId,
            message: data.message,
            mentionedBy: socket.data.userId,
            mentionedByUserName: socket.data.userNameSid || socket.data.userName,
            timestamp: new Date()
          });
          
          console.log(`[Socket.IO] User ${socket.data.userNameSid || socket.data.userName} mentioned user ${data.userId} in room ${data.chatRoomId}`);
        }
      } catch (error) {
        console.error(`[Socket.IO] User mention event error:`, error);
      }
    });

    // 断开连接
    socket.on('disconnect', () => {
      try {
        const userId = socket.data.userId;
        if (userId) {
          // 通知用户加入的所有房间，用户已离线
          const onlineUser = onlineUsers.get(userId);
          if (onlineUser) {
            onlineUser.joinedRooms.forEach(roomId => {
              socket.to(roomId).emit('user_offline', {
                userId,
                userName: onlineUser.name,
                chatRoomId: roomId,
                timestamp: new Date()
              });
            });
          }

          // 从在线用户列表中移除
          onlineUsers.delete(userId);
          
          console.log(`[Socket.IO] User ${socket.data.userName} (${userId}) disconnected`);
        }
      } catch (error) {
        console.error(`[Socket.IO] Disconnect error:`, error);
      }
    });

    // 错误处理
    socket.on('error', (error) => {
      console.error(`[Socket.IO] Socket error:`, error);
    });
  });

  // 提供获取在线用户的辅助函数
  io.getOnlineUsers = () => {
    return Array.from(onlineUsers.values());
  };

  io.getOnlineUser = (userId: string) => {
    return onlineUsers.get(userId);
  };

  io.isUserOnline = (userId: string) => {
    return onlineUsers.has(userId);
  };

  return io;
} 