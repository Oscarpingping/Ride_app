import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 扩展 Request 类型
declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        email: string;
      };
    }
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: '请先登录',
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: '用户不存在',
      });
    }

    req.user = {
      _id: user._id.toString(),
      email: user.email,
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: '认证失败，请重新登录',
    });
  }
}; 