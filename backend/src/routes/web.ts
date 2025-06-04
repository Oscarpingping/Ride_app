import express from 'express';
import { resetPasswordWeb } from '../controllers/authController';
import { SYSTEM_CONFIG } from '../config/system';

const router = express.Router();

// Web端密码重置路由
router.get(SYSTEM_CONFIG.PASSWORD_RESET.SERVICE.BASE_PATH + '/password', resetPasswordWeb);

// 密码重置成功页面
router.get('/reset-success', (_req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Password Reset Successful</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
          .container { max-width: 400px; margin: 50px auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
          .success { color: #28a745; font-size: 48px; margin-bottom: 20px; }
          h2 { color: #333; margin-bottom: 15px; }
          p { color: #666; line-height: 1.5; }
          .btn { background: #007bff; color: white; padding: 12px 24px; border: none; border-radius: 4px; text-decoration: none; display: inline-block; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success">✓</div>
          <h2>Password Reset Successful!</h2>
          <p>Your password has been successfully reset. You can now log in with your new password.</p>
          <a href="http://localhost:12000/authRoot" class="btn">Go to Login</a>
        </div>
      </body>
    </html>
  `);
});

// 密码重置错误页面
router.get('/reset-error', (_req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Password Reset Error</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
          .container { max-width: 400px; margin: 50px auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
          .error { color: #dc3545; font-size: 48px; margin-bottom: 20px; }
          h2 { color: #333; margin-bottom: 15px; }
          p { color: #666; line-height: 1.5; }
          .btn { background: #007bff; color: white; padding: 12px 24px; border: none; border-radius: 4px; text-decoration: none; display: inline-block; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="error">✗</div>
          <h2>Password Reset Failed</h2>
          <p>The password reset link is invalid or has expired. Please request a new password reset.</p>
          <a href="http://localhost:12000/authRoot" class="btn">Request New Reset</a>
        </div>
      </body>
    </html>
  `);
});

export default router; 