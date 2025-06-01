import { Request, Response } from 'express';
import { Message } from '../models/Message';
import { AuthRequest } from '../types/auth';

export const messageController = {
  // 获取用户的所有消息
  async getUserMessages(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
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

      return res.json(messages);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  },

  // 获取特定骑行活动的消息
  async getRideMessages(req: Request, res: Response) {
    try {
      const messages = await Message.find({ rideId: req.params.rideId })
        .populate('senderId', 'name email')
        .populate('receiverId', 'name email')
        .sort({ timestamp: -1 });

      return res.json(messages);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  },

  // 发送消息
  async sendMessage(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
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

      return res.status(201).json(populatedMessage);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  },

  // 删除消息
  async deleteMessage(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const message = await Message.findById(req.params.id);

      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }

      // 检查是否是发送者
      if (message.senderId.toString() !== req.user._id) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      await message.deleteOne();
      return res.json({ message: 'Message deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  },

  // 获取聊天线程
  async getChatThreads(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
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

      return res.json(threads);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}; 