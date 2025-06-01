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
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ 
        success: false,
        error: '未认证用户' 
      });
    }
    
    const { User } = require('../models/User');
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: '用户不存在' 
      });
    }
    
    res.json({
      success: true,
      data: user.toJSON()
    });
  } catch (err) {
    console.error('Get current user error:', err);
    res.status(500).json({ 
      success: false,
      error: '获取用户信息失败' 
    });
  }
});

// 更新当前用户信息
router.patch('/me', auth, async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ 
        success: false,
        error: '未认证用户' 
      });
    }
    
    const { User } = require('../models/User');
    const updates = req.body;
    
    // 不允许通过此接口更新密码和敏感字段
    delete updates.password;
    delete updates.email;
    delete updates._id;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: '用户不存在' 
      });
    }
    
    res.json({
      success: true,
      data: user.toJSON()
    });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ 
      success: false,
      error: '更新用户信息失败' 
    });
  }
});

// 用户登出（JWT场景，前端只需删除token，后端返回成功即可）
router.post('/logout', auth, (req, res) => {
  res.json({ 
    success: true,
    message: '登出成功' 
  });
});

export default router; 