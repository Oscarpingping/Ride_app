import { Request, Response } from 'express';
import { Message } from '../models/Message';
import { ChatRoom } from '../models/ChatRoom';
import { AuthRequest } from '../types/auth';
import { ApiResponse } from '../../../shared/api/types';
import { User } from '../models/User';

export const messageController = {
  // 获取用户的所有消息
  async getUserMessages(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          error: 'Not authenticated' 
        } as ApiResponse);
      }

      const messages = await Message.find({
        $or: [
          { senderId: req.user._id },
          { receiverId: req.user._id }
        ]
      })
      .populate('senderId', 'name email')
      .populate('receiverId', 'name email')
      .sort({ timestamp: -1 });

      return res.json({
        success: true,
        data: messages
      } as ApiResponse);
    } catch (error: any) {
      return res.status(500).json({ 
        success: false,
        error: error.message 
      } as ApiResponse);
    }
  },

  // 获取特定骑行活动的消息
  async getRideMessages(req: Request, res: Response): Promise<Response> {
    try {
      const messages = await Message.find({ rideId: req.params.rideId })
        .populate('senderId', 'name email')
        .populate('receiverId', 'name email')
        .sort({ timestamp: -1 });

      return res.json({
        success: true,
        data: messages
      } as ApiResponse);
    } catch (error: any) {
      return res.status(500).json({ 
        success: false,
        error: error.message 
      } as ApiResponse);
    }
  },

  // 发送消息
  async sendMessage(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          error: 'Not authenticated' 
        } as ApiResponse);
      }

      const messageData = {
        ...req.body,
        senderId: req.user._id,
        timestamp: new Date()
      };

      const message = new Message(messageData);
      await message.save();

      const populatedMessage = await Message.findById(message._id)
        .populate('senderId', 'name email')
        .populate('receiverId', 'name email');

      return res.status(201).json({
        success: true,
        data: populatedMessage
      } as ApiResponse);
    } catch (error: any) {
      return res.status(400).json({ 
        success: false,
        error: error.message 
      } as ApiResponse);
    }
  },

  // 删除消息
  async deleteMessage(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          error: 'Not authenticated' 
        } as ApiResponse);
      }

      const message = await Message.findById(req.params.id);

      if (!message) {
        return res.status(404).json({ 
          success: false,
          error: 'Message not found' 
        } as ApiResponse);
      }

      // 检查是否是发送者
      if (message.senderId.toString() !== req.user._id) {
        return res.status(403).json({ 
          success: false,
          error: 'Not authorized' 
        } as ApiResponse);
      }

      await message.deleteOne();
      return res.json({ 
        success: true,
        message: 'Message deleted successfully' 
      } as ApiResponse);
    } catch (error: any) {
      return res.status(500).json({ 
        success: false,
        error: error.message 
      } as ApiResponse);
    }
  },

  // 获取聊天线程
  async getChatThreads(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          error: 'Not authenticated' 
        } as ApiResponse);
      }

      const messages = await Message.find({
        $or: [
          { senderId: req.user._id },
          { receiverId: req.user._id }
        ]
      })
      .populate('senderId', 'name email')
      .populate('receiverId', 'name email')
      .sort({ timestamp: -1 });

      // 组织聊天线程
      const threads = messages.reduce((acc: any[], message) => {
        if (!req.user) {
          return acc;
        }

        const otherUserId = message.senderId._id.toString() === req.user._id
          ? message.receiverId._id.toString()
          : message.senderId._id.toString();

        const existingThread = acc.find(thread => thread.userId === otherUserId);
        if (existingThread) {
          existingThread.messages.push(message);
        } else {
          const user = {
            user: message.senderId._id.toString() === req.user._id
              ? message.receiverId
              : message.senderId
          };
          acc.push({
            userId: otherUserId,
            ...user,
            messages: [message]
          });
        }
        return acc;
      }, []);

      return res.json({
        success: true,
        data: threads
      } as ApiResponse);
    } catch (error: any) {
      return res.status(500).json({ 
        success: false,
        error: error.message 
      } as ApiResponse);
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

      const messages = await Message.find({ chatroomId: chatRoomId })
        .populate('senderId', 'name name_sid avatar')
        .sort({ timestamp: -1 })
        .limit(Number(limit))
        .skip(Number(offset));

      return res.json({
        success: true,
        data: messages
      } as ApiResponse);
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message
      } as ApiResponse);
    }
  },

  // 发送消息到聊天室
  async sendChatRoomMessage(req: AuthRequest, res: Response): Promise<Response> {
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

      // 获取用户信息以获取name_sid
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        } as ApiResponse);
      }

      const message = new Message({
        senderId: req.user._id,
        chatroomId: chatRoomId,
        content,
        type,
        timestamp: new Date(),
        receiverType: 'club', // 聊天室消息的接收者类型
        senderNameSid: user.name_sid,
        receiverNameSid: chatRoom.name
      });

      await message.save();

      // 更新聊天室的最后消息信息
      chatRoom.lastMessageId = message._id;
      chatRoom.lastMessageTime = message.timestamp;
      await chatRoom.save();

      const populatedMessage = await Message.findById(message._id)
        .populate('senderId', 'name name_sid avatar');

      return res.status(201).json({
        success: true,
        data: populatedMessage
      } as ApiResponse);
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message
      } as ApiResponse);
    }
  },

  // 编辑消息
  async editMessage(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated'
        } as ApiResponse);
      }

      const { id } = req.params;
      const { content } = req.body;

      if (!content) {
        return res.status(400).json({
          success: false,
          error: 'Message content is required'
        } as ApiResponse);
      }

      const message = await Message.findById(id);
      if (!message) {
        return res.status(404).json({
          success: false,
          error: 'Message not found'
        } as ApiResponse);
      }

      // 获取用户信息以获取name_sid
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        } as ApiResponse);
      }

      // 检查编辑权限
      if (!message.canEdit(user.name_sid)) {
        return res.status(403).json({
          success: false,
          error: 'Cannot edit this message'
        } as ApiResponse);
      }

      // 保存编辑历史
      if (!message.editHistory) {
        message.editHistory = [];
      }
      message.editHistory.push({
        content: message.content,
        editedAt: new Date(),
        editedBy: user.name_sid
      });

      // 更新消息内容
      message.content = content;
      message.isEdited = true;
      await message.save();

      const updatedMessage = await Message.findById(id)
        .populate('senderId', 'name name_sid avatar');

      return res.json({
        success: true,
        data: updatedMessage
      } as ApiResponse);
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message
      } as ApiResponse);
    }
  }
}; 