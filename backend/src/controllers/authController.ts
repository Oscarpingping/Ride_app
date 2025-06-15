import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/User';
import { ApiResponse } from '../../../shared/api/types';
import { SYSTEM_CONFIG } from '../config/system';
import { sendEmail } from '../utils/email';
import { getResetPasswordEmailContent, getPasswordChangedEmailContent } from '../utils/email/templates/reset-password';
import { getResetPasswordFormHtml } from '../utils/views/reset-password/reset-form';
import { getResetPasswordSuccessHtml } from '../utils/views/reset-password/success';
import { getResetPasswordErrorHtml } from '../utils/views/reset-password/error';
import { PASSWORD_RULES } from '../config/passwordValidation';
import { generateHandle } from '../utils/name_handle';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';

// 用户注册控制器
export const register = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password, name } = req.body;
    console.log(`📝 注册请求: ${email}`);

    // 检查邮箱是否已存在
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`❌ 用户已存在: ${email}`);
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      } as ApiResponse);
    }

    // 生成 name_sid
    const name_sid = await generateHandle(name);

    // 验证密码复杂度
    if (!PASSWORD_RULES.validate(password)) {
      return res.status(400).json({
        success: false,
        error: PASSWORD_RULES.ERROR_MESSAGE,
      } as ApiResponse);
    }

    // 创建新用户
    const user = new User({
      email,
      password,
      name,
      name_sid
    });

    await user.save();

    // 生成 JWT token
    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
      },
    } as ApiResponse);
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to register user',
    } as ApiResponse);
  }
};

// 用户登录控制器
export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    // 注释掉调试日志
    /*console.log(`[${new Date().toISOString()}] 🔍 登录请求详情:
      Headers: ${JSON.stringify(req.headers, null, 2)}
      Body: ${JSON.stringify(req.body, null, 2)}
      URL: ${req.originalUrl}
      Method: ${req.method}
    `);*/

    const { email, password } = req.body;
    //console.log(`[${new Date().toISOString()}] 用户登录请求: ${email}`);

    // 查找用户
    const user = await User.findOne({ email });
    if (!user) {
      //console.log(`[${new Date().toISOString()}] 登录失败: 用户 ${email} 不存在`);
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      } as ApiResponse);
    }

    // 验证密码
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      //console.log(`[${new Date().toISOString()}] 登录失败: 密码不匹配 ${email}`);
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      } as ApiResponse);
    }

    // 生成 token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ userId: user._id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

    //console.log(`[${new Date().toISOString()}] 用户登录成功: ${email}`);
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
    // 注释掉详细错误日志
    /*console.error(`[${new Date().toISOString()}] 登录失败:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      requestBody: req.body,
      headers: req.headers
    });*/
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
    console.log(`🔐 密码重置请求: ${email}`);

    // 从数据库查找用户
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`❌ 用户不存在: ${email}`);
      // 直接返回成功，但不执行任何操作
      return res.json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link',
      } as ApiResponse);
    }

    console.log(`✅ 找到用户: ${email}`);

    // 生成重置令牌
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + SYSTEM_CONFIG.PASSWORD_RESET.EXPIRY_HOURS * 3600000);

    console.log(`🔑 生成重置令牌: ${resetToken}`);

    // 保存重置令牌到数据库
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await user.save();

    // 构建重置链接
    const resetUrl = `${SYSTEM_CONFIG.PASSWORD_RESET.BASE_URL}?token=${resetToken}`;

    // 打印重置链接信息
    console.log('\n=== Password Reset Link Information ===');
    console.log(`🔗 Reset URL: ${resetUrl}`);
    console.log(`🔑 Reset Token: ${resetToken}`);
    console.log(`⏰ Valid Until: ${resetExpires.toLocaleString()}`);
    console.log(`📧 Sent To: ${user.email}`);
    console.log('=====================================\n');

    // 发送重置邮件到用户注册邮箱
    const emailContent = getResetPasswordEmailContent({ resetUrl });
    await sendEmail({
      to: user.email,
      ...emailContent
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
    console.log(`🔐 密码重置请求，令牌: ${token}`);

    // 从数据库查找用户
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      console.log(`❌ 无效或过期的重置令牌: ${token}`);
      return res.status(400).json({
        success: false,
        error: 'Password reset token is invalid or has expired',
      } as ApiResponse);
    }

    console.log(`🔄 更新密码: ${user.email}`);

    // 验证密码复杂度
    if (!PASSWORD_RULES.validate(password)) {
      return res.status(400).json({
        success: false,
        error: PASSWORD_RULES.ERROR_MESSAGE,
      } as ApiResponse);
    }

    // 更新密码
    user.password = password; // 让 User 模型的中间件处理加密
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save(); // 这会触发 pre('save') 中间件

    // 发送确认邮件
    const emailContent = getPasswordChangedEmailContent(user.email);
    await sendEmail({
      to: user.email,
      ...emailContent
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
    console.log(`🌐 Web密码重置页面请求，令牌: ${token}`);
    
    if (!token) {
      return res.status(400).send('Invalid reset link');
    }

    // 从数据库查找用户
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      console.log(`❌ Web页面：无效或过期的重置令牌: ${token}`);
      return res.status(400).send(getResetPasswordErrorHtml());
    }

    // 返回重置密码页面
    return res.send(getResetPasswordFormHtml(token as string));
  } catch (error) {
    console.error('Password reset web error:', error);
    return res.status(500).send(getResetPasswordErrorHtml());
  }
};

// 密码重置成功页面
export const resetPasswordSuccess = async (_req: Request, res: Response) => {
  return res.send(getResetPasswordSuccessHtml());
};

// 密码重置失败页面
export const resetPasswordError = async (_req: Request, res: Response) => {
  return res.send(getResetPasswordErrorHtml());
}; 