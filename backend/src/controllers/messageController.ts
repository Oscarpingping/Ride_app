import { Request, Response } from 'express';
import { Message } from '../models/Message';
import { AuthRequest } from '../types/auth';
import { ApiResponse } from '../../../shared/api/types';

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
  }
}; 