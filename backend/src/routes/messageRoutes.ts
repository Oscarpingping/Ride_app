import express from 'express';
import { messageController } from '../controllers/messageController';
import { auth } from '../middleware/auth';

const router = express.Router();

// 所有路由都需要认证
router.use(auth);

// 获取用户的所有消息
router.get('/', messageController.getUserMessages);

// 发送消息
router.post('/send', messageController.sendMessage);

// 删除消息
router.delete('/:id', messageController.deleteMessage);

// 获取聊天线程
router.get('/threads', messageController.getChatThreads);

// 获取聊天室消息
router.get('/chatroom/:chatRoomId', messageController.getChatRoomMessages);

// 发送消息到聊天室
router.post('/chatroom/:chatRoomId', messageController.sendChatRoomMessage);

// 编辑消息
router.put('/:id', messageController.editMessage);

export default router; 