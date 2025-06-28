import express from 'express';
import { chatController } from '../controllers/chatController';
import { auth } from '../middleware/auth';

const router = express.Router();

// 所有路由都需要认证
router.use(auth);

// 获取用户参与的所有聊天室
router.get('/', chatController.getUserChatRooms);

// 获取指定chatroom的最新数据
router.get('/:id', chatController.getChatRoom);

// 创建聊天室
router.post('/', chatController.createChatRoom);

// 更新聊天室信息
router.put('/:id', chatController.updateChatRoom);

// 删除聊天室
router.delete('/:id', chatController.deleteChatRoom);

// 添加成员到聊天室
router.post('/:chatRoomId/members', chatController.addMember);

// 从聊天室移除成员
router.delete('/:chatRoomId/members', chatController.removeMember);

// 获取聊天室消息
router.get('/:chatRoomId/messages', chatController.getChatRoomMessages);

// 发送消息到聊天室
router.post('/:chatRoomId/messages', chatController.sendMessage);

export default router; 