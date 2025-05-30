import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { ApiResponse } from '../../../shared/api/types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // 检查用户是否已存在
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: '该邮箱已被注册',
      } as ApiResponse);
    }

    // 创建新用户
    const user = new User({
      name,
      email,
      password,
    });

    await user.save();

    // 生成 token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ userId: user._id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      data: {
        token,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '注册失败，请稍后重试',
    } as ApiResponse);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 查找用户
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: '邮箱或密码错误',
      } as ApiResponse);
    }

    // 验证密码
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: '邮箱或密码错误',
      } as ApiResponse);
    }

    // 生成 token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ userId: user._id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      data: {
        token,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '登录失败，请稍后重试',
    } as ApiResponse);
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: '未提供刷新令牌',
      } as ApiResponse);
    }

    // 验证刷新令牌
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: string };
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: '无效的刷新令牌',
      } as ApiResponse);
    }

    // 生成新的访问令牌
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

    res.json({
      success: true,
      data: {
        token,
      },
    } as ApiResponse);
  } catch (error) {
    res.status(401).json({
      success: false,
      error: '无效的刷新令牌',
    } as ApiResponse);
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    // 在实际应用中，你可能需要将令牌加入黑名单
    res.json({
      success: true,
      data: null,
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '登出失败，请稍后重试',
    } as ApiResponse);
  }
}; 