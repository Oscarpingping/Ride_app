import express from 'express';
import { userController } from '../controllers/userController';
import { auth } from '../middleware/auth';

const router = express.Router();

// 公开路由
router.post('/register', userController.register);
router.post('/login', userController.login);

// 需要认证的路由
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);

// 获取当前登录用户信息
router.get('/me', auth, async (req, res) => {
  if (!req.user || !req.user.userId) {
    return res.status(401).json({ message: '未认证用户' });
  }
  try {
    const userId = req.user.userId;
    const user = await require('../models/User').User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: '获取用户信息失败' });
  }
});

// 用户登出（JWT场景，前端只需删除token，后端返回成功即可）
router.post('/logout', auth, (req, res) => {
  res.json({ message: '登出成功' });
});

export default router; 