import { Request } from 'express';

// 统一的认证请求接口
export interface AuthRequest extends Request {
  user?: {
    _id: string;
    email: string;
    userId?: string; // 兼容旧代码
  };
}