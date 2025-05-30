import express, { Router, RequestHandler } from 'express';
import { rideController, AuthRequest } from '../controllers/rideController';
import { auth } from '../middleware/auth';

const router = Router();

// 所有路由都需要认证
router.use(auth);

// 获取所有骑行活动
router.get('/', rideController.getAllRides as RequestHandler);

// 创建骑行活动
router.post('/', rideController.createRide as RequestHandler);

// 获取单个骑行活动
router.get('/:id', rideController.getRide as RequestHandler);

// 更新骑行活动
router.put('/:id', rideController.updateRide as RequestHandler);

// 删除骑行活动
router.delete('/:id', rideController.deleteRide as RequestHandler);

// 加入骑行活动
router.post('/:id/join', rideController.joinRide as RequestHandler);

// 退出骑行活动
router.post('/:id/leave', rideController.leaveRide as RequestHandler);

// 获取当前用户发起的活动
router.get('/created', async (req, res) => {
  console.log('req.user in /created:', req.user);
  if (!req.user || !req.user.userId) {
    return res.status(401).json({ message: '未认证用户' });
  }
  try {
    const userId = req.user.userId;
    const rides = await require('../models/Ride').Ride.find({ organizer: userId });
    res.json(Array.isArray(rides) ? rides : []);
  } catch (err) {
    res.status(500).json({ message: '获取发起活动失败' });
  }
});

// 获取当前用户参与的活动
router.get('/participated', async (req, res) => {
  console.log('req.user in /participated:', req.user);
  if (!req.user || !req.user.userId) {
    return res.status(401).json({ message: '未认证用户' });
  }
  try {
    const userId = req.user.userId;
    const rides = await require('../models/Ride').Ride.find({ participants: userId });
    res.json(Array.isArray(rides) ? rides : []);
  } catch (err) {
    res.status(500).json({ message: '获取参与活动失败' });
  }
});

export default router; 