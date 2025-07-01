import { Router } from 'express';
import { messageController } from '../controllers/messageController';
import { chatController } from '../controllers/chatController';
import { auth } from '../middleware/auth';

const router = Router();

// 所有路由都需要认证
router.use(auth);

// 处理打字状态
router.post('/typing', messageController.handleTypingStatus);

// 获取聊天室在线成员
router.get('/chatroom/:chatRoomId/online-members', chatController.getOnlineMembers);

export default router; 