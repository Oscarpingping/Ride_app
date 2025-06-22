import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AuthRequest } from '../types/auth';
import multer from 'multer';
import { uploadImage } from '../services/uploadService';
import { ApiResponse } from '../../../shared/api/types';

// 统一的错误处理函数
const handleError = (error: any, res: Response, operation: string): Response => {
  console.error(`[${new Date().toISOString()}] ${operation} failed:`, {
    error: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined
  });

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: error.message
    } as ApiResponse);
  }

  return res.status(500).json({
    success: false,
    error: `${operation} failed, please try again later`
  } as ApiResponse);
};

export const userController = {
  // 注册新用户
  async register(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;

      // 检查用户是否已存在
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ 
          success: false,
          error: 'User already exists' 
        } as ApiResponse);
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

      // 返回完整的用户信息，包括 canCreateClub 字段
      const userResponse = user.toJSON();

      return res.status(201).json({
        success: true,
        data: {
          token,
          user: userResponse
        }
      } as ApiResponse);
    } catch (error: any) {
      return handleError(error, res, 'Register user');
    }
  },

  // 用户登录
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // 查找用户
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ 
          success: false,
          error: 'Invalid credentials' 
        } as ApiResponse);
      }

      // 验证密码
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ 
          success: false,
          error: 'Invalid credentials' 
        } as ApiResponse);
      }

      // 生成 JWT
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      // 返回完整的用户信息，包括 canCreateClub 字段
      const userResponse = user.toJSON();

      return res.json({
        success: true,
        data: {
          token,
          user: userResponse
        }
      } as ApiResponse);
    } catch (error: any) {
      return handleError(error, res, 'Login user');
    }
  },

  // 获取用户信息
  async getProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          error: 'Not authenticated' 
        } as ApiResponse);
      }

      const user = await User.findById(req.user._id).select('-password');
      if (!user) {
        return res.status(404).json({ 
          success: false,
          error: 'User not found' 
        } as ApiResponse);
      }
      return res.json({
        success: true,
        data: user
      } as ApiResponse);
    } catch (error: any) {
      return handleError(error, res, 'Get user profile');
    }
  },

  // 更新用户信息
  async updateProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          error: 'Not authenticated' 
        } as ApiResponse);
      }

      const updates = req.body;
      delete updates.password; // 不允许通过此接口更新密码

      const user = await User.findByIdAndUpdate(
        req.user._id,
        updates,
        { new: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({ 
          success: false,
          error: 'User not found' 
        } as ApiResponse);
      }

      return res.json({
        success: true,
        data: user
      } as ApiResponse);
    } catch (error: any) {
      return handleError(error, res, 'Update user profile');
    }
  },
};

// 支持 name_sid 模糊搜索
export const searchUsers = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    if (!search || typeof search !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing search query' 
      } as ApiResponse);
    }
    const users = await User.find({
      name_sid: { $regex: search, $options: 'i' }
    }).select('_id name_sid avatar').limit(20);
    return res.json({ 
      success: true, 
      data: users 
    } as ApiResponse);
  } catch (error: any) {
    return handleError(error, res, 'Search users');
  }
};

// 头像上传配置
export const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG and GIF images are allowed'));
    }
  }
});

// 文件上传错误处理中间件
export const multerErrorHandler = (
  err: any,
  _req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false, 
        error: 'File size exceeds 2MB limit' 
      } as ApiResponse);
    }
    return res.status(400).json({ 
      success: false, 
      error: err.message 
    } as ApiResponse);
  }
  
  if (err.message === 'Only JPEG, PNG and GIF images are allowed') {
    return res.status(400).json({ 
      success: false, 
      error: err.message 
    } as ApiResponse);
  }
  
  next(err);
};

export const uploadAvatar = [
  avatarUpload.single('avatar'),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({ 
          success: false, 
          error: 'Not authenticated' 
        } as ApiResponse);
      }
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          error: 'No file uploaded' 
        } as ApiResponse);
      }
      // 直接调用 uploadImage，指定 members 目录和 400x400 cover
      const avatarUrl = await uploadImage(req.file, {
        subDir: 'members',
        width: 400,
        height: 400,
        fit: 'cover'
      });
      
      // 更新用户头像并返回完整的用户信息
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id, 
        { avatar: avatarUrl },
        { new: true }
      ).select('-password');
      
      if (!updatedUser) {
        return res.status(404).json({ 
          success: false, 
          error: 'User not found' 
        } as ApiResponse);
      }
      
      return res.json({ 
        success: true, 
        data: updatedUser.toJSON()
      } as ApiResponse);
    } catch (error: any) {
      return handleError(error, res, 'Upload avatar');
    }
  }
]; 