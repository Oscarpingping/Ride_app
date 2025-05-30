import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';

// 扩展 Request 类型
interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const userController = {
  // 注册新用户
  async register(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;

      // 检查用户是否已存在
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // 创建新用户
      const user = new User({
        name,
        email,
        password
      });

      await user.save();

      // 生成 JWT
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  // 用户登录
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // 查找用户
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // 验证密码
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // 生成 JWT
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  // 获取用户信息
  async getProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const user = await User.findById(req.user.userId).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  // 更新用户信息
  async updateProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const updates = req.body;
      delete updates.password; // 不允许通过此接口更新密码

      const user = await User.findByIdAndUpdate(
        req.user.userId,
        updates,
        { new: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}; 