import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // console.log('\n=== AUTH MIDDLEWARE DEBUG ===');
    // console.log('Time:', new Date().toISOString());
    // console.log('Headers:', JSON.stringify(req.headers, null, 2));
    // console.log('URL:', req.originalUrl);
    // console.log('Method:', req.method);

    const token = req.header('Authorization')?.replace('Bearer ', '');
    // console.log('🔑 Token:', token?.substring(0, 20) + '...');

    if (!token) {
      throw new Error('No token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    // console.log('📝 Decoded token:', decoded);

    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // console.log('✅ User authenticated:', user._id);
    req.user = { userId: user._id };
    next();
  } catch (error) {
    // console.error(`[${new Date().toISOString()}] Auth middleware error:`, error);
    res.status(401).json({
      success: false,
      error: 'Authentication failed'
    });
  }
}; 