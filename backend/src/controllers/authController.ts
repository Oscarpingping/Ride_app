import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { ApiResponse } from '../../../shared/api/types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';

// 用户注册控制器
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // 检查用户是否已存在
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered. Please sign in or use a different email',
      } as ApiResponse);
    }

    // 创建新用户，设置默认值
    const user = new User({
      name,
      email,
      password,
      rating: 0,
      ridesJoined: 0,
      ridesCreated: 0,
      createdRides: [],
      joinedRides: [],
      clubs: [],
      createdClubs: [],
      managedClubs: [],
      canCreateClub: false,
      createdAt: new Date(),
      updatedAt: new Date()
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
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio,
          rating: user.rating,
          ridesJoined: user.ridesJoined,
          ridesCreated: user.ridesCreated,
          createdClubs: user.createdClubs,
          managedClubs: user.managedClubs,
          canCreateClub: user.canCreateClub,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    } as ApiResponse);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed, please try again later',
    } as ApiResponse);
  }
};

// 用户登录控制器
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 查找用户
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      } as ApiResponse);
    }

    // 验证密码
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
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
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio,
          rating: user.rating,
          ridesJoined: user.ridesJoined,
          ridesCreated: user.ridesCreated,
          createdClubs: user.createdClubs,
          managedClubs: user.managedClubs,
          canCreateClub: user.canCreateClub,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    } as ApiResponse);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed, please try again later',
    } as ApiResponse);
  }
};

// Token 刷新控制器
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'No refresh token provided',
      } as ApiResponse);
    }

    // 验证刷新令牌
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: string };
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token',
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
      error: 'Invalid refresh token',
    } as ApiResponse);
  }
};

// 用户登出控制器
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
      error: 'Logout failed, please try again later',
    } as ApiResponse);
  }
}; 