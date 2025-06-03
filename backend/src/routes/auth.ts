import express from 'express';
import { register, login, refreshToken, logout, requestPasswordReset, resetPassword } from '../controllers/authController';

const router = express.Router();

// 认证路由
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

// 密码重置路由
router.post('/request-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

// 测试路由
router.get('/test', (req, res) => {
  console.log(`[${new Date().toISOString()}] 🧪 认证测试请求:
    Headers: ${JSON.stringify(req.headers, null, 2)}
    URL: ${req.originalUrl}
    Method: ${req.method}
  `);
  res.json({
    message: 'Auth route is working',
    timestamp: new Date().toISOString()
  });
});

export default router; 