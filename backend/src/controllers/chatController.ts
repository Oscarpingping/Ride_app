import { Request, Response } from 'express';
import { ChatRoom } from '../models/ChatRoom';
import { Club } from '../models/Club';
import { Message } from '../models/Message';
import { AuthRequest } from '../types/auth';
import { ApiResponse } from '../../../shared/api/types';
import mongoose from 'mongoose';
import { Server as SocketIOServer } from 'socket.io';

// 获取socket.io实例的辅助函数
const getIO = (req: Request): SocketIOServer => {
  return req.app.get('io');
};

// 错误处理函数
const handleError = (error: any, res: Response, operation: string): Response => {
  console.error(`[ChatController] Error in ${operation}:`, error);
  return res.status(500).json({
    success: false,
    error: error.message || 'Internal server error'
  } as ApiResponse);
};

// Socket.io事件类型定义
interface ChatRoomEvent {
  type: 'message' | 'member_joined' | 'member_left' | 'message_edited' | 'message_deleted' | 'typing' | 'stop_typing';
  data: any;
  timestamp: Date;
}

export const chatController = {
  // 获取指定chatroom的最新数据
  async getChatRoom(req: Request, res: Response): Promise<Response> {
    try {
      const chatRoom = await ChatRoom.findById(req.params.id)
        .populate('members', 'name avatar')
        .populate('club', 'name logo')
        .populate('lastMessageId');

      if (!chatRoom) {
        return res.status(404).json({
          success: false,
          error: 'ChatRoom not found'
        } as ApiResponse);
      }

      return res.json({
        success: true,
        data: chatRoom
      } as ApiResponse);
    } catch (error: any) {
      return handleError(error, res, 'Get chatroom');
    }
  },

  // 获取用户参与的所有聊天室
  async getUserChatRooms(req: Request, res: Response): Promise<Response> {
    try {
      const { userId } = req.query;
      console.log(`[ChatController] Fetching chatrooms for userId: ${userId}`);
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'userId is required'
        } as ApiResponse);
      }

      const chatRooms = await ChatRoom.find({ members: userId })
        .populate('members', 'name avatar')
        .populate('club', 'name logo')
        .populate('lastMessageId')
        .sort({ lastMessageTime: -1 });

      console.log(`[ChatController] Found ${chatRooms.length} chatrooms.`);
      
      return res.json({
        success: true,
        data: chatRooms
      } as ApiResponse);
    } catch (error: any) {
      return handleError(error, res, 'Get user chatrooms');
    }
  },

  // 创建聊天室（从clubController迁移）
  async createChatRoom(req: Request, res: Response): Promise<Response> {
    try {
      const { name, type, clubId, members, maxMembers = 100, logo } = req.body;

      if (!name || !type || !members || !Array.isArray(members)) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: name, type, members'
        } as ApiResponse);
      }

      const chatRoom = new ChatRoom({
        name,
        type,
        club: clubId || null,
        members,
        maxMembers,
        logo: logo || null
      });

      await chatRoom.save();

      // 如果是俱乐部聊天室，更新俱乐部的chatRoom引用
      if (clubId) {
        await Club.findByIdAndUpdate(clubId, { chatRoom: chatRoom._id });
      }

      const populatedChatRoom = await ChatRoom.findById(chatRoom._id)
        .populate('members', 'name avatar')
        .populate('club', 'name logo');

      // 通知所有成员新的聊天室已创建
      const io = getIO(req);
      members.forEach(memberId => {
        io.to(memberId.toString()).emit('chatroom_created', {
          chatRoom: populatedChatRoom
        });
      });

      return res.status(201).json({
        success: true,
        data: populatedChatRoom
      } as ApiResponse);
    } catch (error: any) {
      return handleError(error, res, 'Create chatroom');
    }
  },

  // 删除聊天室（从clubController迁移）
  async deleteChatRoom(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const session = await mongoose.startSession();
      
      session.startTransaction();

      try {
        const chatRoom = await ChatRoom.findById(id).session(session);
        
        if (!chatRoom) {
          await session.abortTransaction();
          return res.status(404).json({
            success: false,
            error: 'ChatRoom not found'
          } as ApiResponse);
        }

        // 通知所有成员聊天室将被删除
        const io = getIO(req);
        chatRoom.members.forEach(memberId => {
          io.to(memberId.toString()).emit('chatroom_deleted', {
            chatRoomId: id
          });
        });

        // 如果是俱乐部聊天室，清除俱乐部的chatRoom引用
        if (chatRoom.club) {
          await Club.findByIdAndUpdate(chatRoom.club, { 
            $unset: { chatRoom: 1 } 
          }, { session });
        }

        // 删除聊天室
        await ChatRoom.findByIdAndDelete(id, { session });
        
        await session.commitTransaction();
        
        return res.json({
          success: true,
          message: 'ChatRoom deleted successfully'
        } as ApiResponse);
      } catch (error: any) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    } catch (error: any) {
      return handleError(error, res, 'Delete chatroom');
    }
  },

  // 添加成员到聊天室
  async addMember(req: Request, res: Response): Promise<Response> {
    try {
      const { chatRoomId } = req.params;
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'userId is required'
        } as ApiResponse);
      }

      const chatRoom = await ChatRoom.findById(chatRoomId);
      if (!chatRoom) {
        return res.status(404).json({
          success: false,
          error: 'ChatRoom not found'
        } as ApiResponse);
      }

      // 检查用户是否已经是成员
      if (chatRoom.members.includes(userId)) {
        return res.status(400).json({
          success: false,
          error: 'User is already a member'
        } as ApiResponse);
      }

      // 检查是否超过最大成员数
      if (chatRoom.members.length >= chatRoom.maxMembers) {
        return res.status(400).json({
          success: false,
          error: 'ChatRoom is full'
        } as ApiResponse);
      }

      chatRoom.members.push(userId);
      await chatRoom.save();

      const updatedChatRoom = await ChatRoom.findById(chatRoomId)
        .populate('members', 'name avatar')
        .populate('club', 'name logo');

      // 通知聊天室所有成员有新成员加入
      const io = getIO(req);
      const event: ChatRoomEvent = {
        type: 'member_joined',
        data: {
          chatRoomId,
          userId,
          chatRoom: updatedChatRoom
        },
        timestamp: new Date()
      };
      
      io.to(chatRoomId).emit('chatroom_event', event);
      
      // 通知新成员已成功加入
      io.to(userId.toString()).emit('member_added', {
        chatRoom: updatedChatRoom
      });

      return res.json({
        success: true,
        data: updatedChatRoom
      } as ApiResponse);
    } catch (error: any) {
      return handleError(error, res, 'Add member to chatroom');
    }
  },

  // 从聊天室移除成员
  async removeMember(req: Request, res: Response): Promise<Response> {
    try {
      const { chatRoomId } = req.params;
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'userId is required'
        } as ApiResponse);
      }

      const chatRoom = await ChatRoom.findById(chatRoomId);
      if (!chatRoom) {
        return res.status(404).json({
          success: false,
          error: 'ChatRoom not found'
        } as ApiResponse);
      }

      // 检查用户是否是成员
      if (!chatRoom.members.includes(userId)) {
        return res.status(400).json({
          success: false,
          error: 'User is not a member'
        } as ApiResponse);
      }

      chatRoom.members = chatRoom.members.filter(id => id.toString() !== userId);
      await chatRoom.save();

      const updatedChatRoom = await ChatRoom.findById(chatRoomId)
        .populate('members', 'name avatar')
        .populate('club', 'name logo');

      // 通知聊天室所有成员有成员离开
      const io = getIO(req);
      const event: ChatRoomEvent = {
        type: 'member_left',
        data: {
          chatRoomId,
          userId,
          chatRoom: updatedChatRoom
        },
        timestamp: new Date()
      };
      
      io.to(chatRoomId).emit('chatroom_event', event);
      
      // 通知被移除的成员
      io.to(userId.toString()).emit('member_removed', {
        chatRoomId,
        chatRoom: updatedChatRoom
      });

      return res.json({
        success: true,
        data: updatedChatRoom
      } as ApiResponse);
    } catch (error: any) {
      return handleError(error, res, 'Remove member from chatroom');
    }
  },

  // 获取聊天室消息
  async getChatRoomMessages(req: Request, res: Response): Promise<Response> {
    try {
      const { chatRoomId } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      const chatRoom = await ChatRoom.findById(chatRoomId);
      if (!chatRoom) {
        return res.status(404).json({
          success: false,
          error: 'ChatRoom not found'
        } as ApiResponse);
      }

      const messages = await Message.find({ chatRoomId })
        .populate('senderId', 'name avatar')
        .sort({ timestamp: -1 })
        .limit(Number(limit))
        .skip(Number(offset));

      return res.json({
        success: true,
        data: messages
      } as ApiResponse);
    } catch (error: any) {
      return handleError(error, res, 'Get chatroom messages');
    }
  },

  // 发送消息到聊天室（集成socket.io实时推送）
  async sendMessage(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated'
        } as ApiResponse);
      }

      const { chatRoomId } = req.params;
      const { content, type = 'text' } = req.body;

      if (!content) {
        return res.status(400).json({
          success: false,
          error: 'Message content is required'
        } as ApiResponse);
      }

      const chatRoom = await ChatRoom.findById(chatRoomId);
      if (!chatRoom) {
        return res.status(404).json({
          success: false,
          error: 'ChatRoom not found'
        } as ApiResponse);
      }

      // 检查用户是否是聊天室成员
      if (!req.user || !chatRoom.members.some(memberId => memberId.toString() === (req.user as any)._id.toString())) {
        return res.status(403).json({
          success: false,
          error: 'Not a member of this chatroom'
        } as ApiResponse);
      }

      const message = new Message({
        senderId: req.user._id,
        chatRoomId,
        content,
        type,
        timestamp: new Date()
      });

      await message.save();

      // 更新聊天室的最后消息信息
      chatRoom.lastMessageId = message._id;
      chatRoom.lastMessageTime = message.timestamp;
      await chatRoom.save();

      const populatedMessage = await Message.findById(message._id)
        .populate('senderId', 'name avatar');

      // 通过socket.io实时推送给聊天室所有成员
      const io = getIO(req);
      const event: ChatRoomEvent = {
        type: 'message',
        data: {
          message: populatedMessage,
          chatRoomId
        },
        timestamp: new Date()
      };
      
      io.to(chatRoomId).emit('chatroom_event', event);

      return res.status(201).json({
        success: true,
        data: populatedMessage
      } as ApiResponse);
    } catch (error: any) {
      return handleError(error, res, 'Send message');
    }
  },

  // 更新聊天室信息
  async updateChatRoom(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { name, logo, maxMembers, autoDeleteDuration } = req.body;

      const chatRoom = await ChatRoom.findById(id);
      if (!chatRoom) {
        return res.status(404).json({
          success: false,
          error: 'ChatRoom not found'
        } as ApiResponse);
      }

      // 更新允许的字段
      if (name) chatRoom.name = name;
      if (logo) chatRoom.logo = logo;
      if (maxMembers) chatRoom.maxMembers = maxMembers;
      if (autoDeleteDuration !== undefined) chatRoom.autoDeleteDuration = autoDeleteDuration;

      await chatRoom.save();

      const updatedChatRoom = await ChatRoom.findById(id)
        .populate('members', 'name avatar')
        .populate('club', 'name logo');

      // 通知所有成员聊天室信息已更新
      const io = getIO(req);
      chatRoom.members.forEach(memberId => {
        io.to(memberId.toString()).emit('chatroom_updated', {
          chatRoom: updatedChatRoom
        });
      });

      return res.json({
        success: true,
        data: updatedChatRoom
      } as ApiResponse);
    } catch (error: any) {
      return handleError(error, res, 'Update chatroom');
    }
  },

  // 获取聊天室在线成员
  async getOnlineMembers(req: Request, res: Response): Promise<Response> {
    try {
      const { chatRoomId } = req.params;
      const io = getIO(req);
      
      // 获取聊天室中所有连接的socket
      const roomSockets = await io.in(chatRoomId).fetchSockets();
      const onlineUserIds = roomSockets.map(socket => socket.data.userId).filter(Boolean);

      return res.json({
        success: true,
        data: {
          chatRoomId,
          onlineMembers: onlineUserIds,
          count: onlineUserIds.length
        }
      } as ApiResponse);
    } catch (error: any) {
      return handleError(error, res, 'Get online members');
    }
  }
}; 