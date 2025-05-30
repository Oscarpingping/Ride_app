import express from 'express';
import { messageController } from '../controllers/messageController';
import { auth } from '../middleware/auth';

const router = express.Router();

// 所有路由都需要认证
router.use(auth);

// 获取用户的所有消息
router.get('/', messageController.getUserMessages);

// 获取特定骑行活动的消息
router.get('/ride/:rideId', messageController.getRideMessages);

// 发送消息
router.post('/', messageController.sendMessage);

// 删除消息
router.delete('/:id', messageController.deleteMessage);

// 获取聊天线程
router.get('/threads', messageController.getChatThreads);

export default router; 