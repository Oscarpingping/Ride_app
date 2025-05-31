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

export default router; 