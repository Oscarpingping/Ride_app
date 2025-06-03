import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/User';
import { ApiResponse } from '../../../shared/api/types';
import { SYSTEM_CONFIG } from '../config/system';
import { sendEmail } from '../utils/email';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';

// 用户注册控制器
export const register = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name, email, password } = req.body;
    console.log(`[${new Date().toISOString()}] 新用户注册请求: ${email}`);

    // 检查用户是否已存在
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`[${new Date().toISOString()}] 注册失败: 邮箱 ${email} 已被注册`);
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

    console.log(`[${new Date().toISOString()}] 用户注册成功: ${email}`);
    return res.status(201).json({
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
    console.error(`[${new Date().toISOString()}] 注册失败:`, error);
    return res.status(500).json({
      success: false,
      error: 'Registration failed, please try again later',
    } as ApiResponse);
  }
};

// 用户登录控制器
export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    // 记录请求头信息
    console.log(`[${new Date().toISOString()}] 🔍 登录请求详情:
      Headers: ${JSON.stringify(req.headers, null, 2)}
      Body: ${JSON.stringify(req.body, null, 2)}
      URL: ${req.originalUrl}
      Method: ${req.method}
    `);

    const { email, password } = req.body;
    console.log(`[${new Date().toISOString()}] 用户登录请求: ${email}`);

    // 查找用户
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`[${new Date().toISOString()}] 登录失败: 用户 ${email} 不存在`);
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      } as ApiResponse);
    }

    // 验证密码
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log(`[${new Date().toISOString()}] 登录失败: 密码不匹配 ${email}`);
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      } as ApiResponse);
    }

    // 生成 token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ userId: user._id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

    console.log(`[${new Date().toISOString()}] 用户登录成功: ${email}`);
    return res.status(200).json({
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
    // 详细记录错误信息
    console.error(`[${new Date().toISOString()}] 登录失败:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      requestBody: req.body,
      headers: req.headers
    });
    return res.status(500).json({
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

    return res.json({
      success: true,
      data: {
        token,
      },
    } as ApiResponse);
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid refresh token',
    } as ApiResponse);
  }
};

// 用户登出控制器
export const logout = async (_req: Request, res: Response): Promise<Response> => {
  try {
    console.log(`[${new Date().toISOString()}] 用户登出成功`);
    return res.status(200).json({
      success: true,
      data: null,
    } as ApiResponse);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] 登出失败:`, error);
    return res.status(500).json({
      success: false,
      error: 'Logout failed, please try again later',
    } as ApiResponse);
  }
};

// 请求密码重置
export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // 查找用户
    const user = await User.findOne({ email });
    if (!user) {
      // 为了安全，即使用户不存在也返回成功
      return res.json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link',
      } as ApiResponse);
    }

    // 生成重置令牌
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + SYSTEM_CONFIG.PASSWORD_RESET.EXPIRY_HOURS * 3600000);

    // 保存重置令牌到用户记录
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await user.save();

    // 构建重置链接
    const resetUrl = `${SYSTEM_CONFIG.PASSWORD_RESET.BASE_URL}?token=${resetToken}`;

    // 发送重置邮件到用户注册邮箱
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      text: `You are receiving this because you (or someone else) has requested the reset of the password for your account.\n\n
        Please click on the following link, or paste this into your browser to complete the process:\n\n
        ${resetUrl}\n\n
        If you did not request this, please ignore this email and your password will remain unchanged.\n`,
      html: `
        <p>You are receiving this because you (or someone else) has requested the reset of the password for your account.</p>
        <p>Please click on the following link to complete the process:</p>
        <p><a href="${resetUrl}">Reset Password</a></p>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      `
    });

    return res.json({
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link',
    } as ApiResponse);
  } catch (error) {
    console.error('Password reset request error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process password reset request',
    } as ApiResponse);
  }
};

// 重置密码
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    // 查找具有有效重置令牌的用户
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Password reset token is invalid or has expired',
      } as ApiResponse);
    }

    // 更新密码
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // 发送确认邮件
    await sendEmail({
      to: user.email,
      subject: 'Your Password Has Been Changed',
      text: `This is a confirmation that the password for your account ${user.email} has just been changed.\n`,
      html: `<p>This is a confirmation that the password for your account ${user.email} has just been changed.</p>`
    });

    return res.json({
      success: true,
      message: 'Password has been reset successfully',
    } as ApiResponse);
  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to reset password',
    } as ApiResponse);
  }
};

// Web端密码重置处理
export const resetPasswordWeb = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).send('Invalid reset link');
    }

    // 验证token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).send('Password reset token is invalid or has expired');
    }

    // 返回重置密码页面
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Reset Password</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .container { max-width: 400px; margin: 0 auto; }
            .form-group { margin-bottom: 15px; }
            input { width: 100%; padding: 8px; margin-top: 5px; }
            button { background: #007bff; color: white; padding: 10px 20px; border: none; cursor: pointer; }
            .error { color: red; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Reset Your Password</h2>
            <form id="resetForm">
              <div class="form-group">
                <label>New Password:</label>
                <input type="password" id="password" required minlength="6">
              </div>
              <div class="form-group">
                <label>Confirm Password:</label>
                <input type="password" id="confirmPassword" required minlength="6">
              </div>
              <div class="error" id="error"></div>
              <button type="submit">Reset Password</button>
            </form>
          </div>
          <script>
            document.getElementById('resetForm').addEventListener('submit', async (e) => {
              e.preventDefault();
              const password = document.getElementById('password').value;
              const confirmPassword = document.getElementById('confirmPassword').value;
              const error = document.getElementById('error');
              
              if (password !== confirmPassword) {
                error.textContent = 'Passwords do not match';
                return;
              }
              
              try {
                const response = await fetch('/api/auth/reset-password', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ token: '${token}', password })
                });
                
                const result = await response.json();
                if (result.success) {
                  window.location.href = '/reset-success';
                } else {
                  error.textContent = result.error || 'Failed to reset password';
                }
              } catch (err) {
                error.textContent = 'An error occurred. Please try again.';
              }
            });
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Password reset web error:', error);
    return res.status(500).send('An error occurred');
  }
}; 