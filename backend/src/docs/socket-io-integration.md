# Socket.IO 集成文档

## 概述

本项目已集成Socket.IO以支持实时通信功能，包括聊天室消息推送、在线状态管理、打字状态同步等。

## 功能特性

### 1. 实时消息推送
- 聊天室消息实时推送给所有在线成员
- 私聊消息实时推送给接收者
- 消息编辑和删除的实时同步

### 2. 在线状态管理
- 用户登录/登出状态跟踪
- 聊天室在线成员列表
- 用户加入/离开聊天室通知

### 3. 交互状态同步
- 打字状态实时显示
- 消息已读状态同步
- 系统通知推送

## 技术架构

### 后端架构

#### Socket.IO 服务器配置
```typescript
// backend/src/socket.ts
export function initSocketIO(server: any, app: Application): ExtendedSocketIOServer
```

#### 控制器集成
- `chatController.ts`: 聊天室相关功能
- `messageController.ts`: 消息相关功能

#### 路由配置
- `/api/socket/typing`: 处理打字状态
- `/api/socket/chatroom/:chatRoomId/online-members`: 获取在线成员

### 前端集成

#### Socket.IO 客户端连接
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5001');

// 用户登录
socket.emit('login', userId);

// 加入聊天室
socket.emit('join_room', chatRoomId);

// 离开聊天室
socket.emit('leave_room', chatRoomId);
```

## API 端点

### Socket.IO 事件

#### 客户端发送事件
- `login(userId)`: 用户登录
- `join_room(chatRoomId)`: 加入聊天室
- `leave_room(chatRoomId)`: 离开聊天室
- `typing({chatRoomId, isTyping})`: 发送打字状态
- `message_read({messageId, chatRoomId, senderId})`: 标记消息已读
- `get_online_users(chatRoomId)`: 获取在线用户列表

#### 服务器推送事件
- `login_success`: 登录成功
- `login_error`: 登录失败
- `user_joined_room`: 用户加入聊天室
- `user_left_room`: 用户离开聊天室
- `user_offline`: 用户离线
- `user_typing`: 用户打字状态
- `message_event`: 消息相关事件
- `chatroom_event`: 聊天室相关事件
- `room_online_members`: 房间在线成员列表
- `online_users_list`: 在线用户列表
- `message_read_status`: 消息已读状态

### HTTP API 端点

#### 打字状态处理
```
POST /api/socket/typing
Authorization: Bearer <token>
Content-Type: application/json

{
  "chatRoomId": "chatroom_id",
  "isTyping": true
}
```

#### 获取在线成员
```
GET /api/socket/chatroom/:chatRoomId/online-members
Authorization: Bearer <token>
```

## 使用示例

### 1. 聊天室消息发送
```typescript
// 后端：chatController.sendMessage
const message = new Message({
  senderId: req.user._id,
  chatRoomId,
  content,
  type,
  timestamp: new Date()
});

await message.save();

// 通过socket.io实时推送
const io = getIO(req);
const event: ChatRoomEvent = {
  type: 'message',
  data: { message: populatedMessage, chatRoomId },
  timestamp: new Date()
};

io.to(chatRoomId).emit('chatroom_event', event);
```

### 2. 消息编辑实时同步
```typescript
// 后端：messageController.editMessage
await message.save();

// 实时通知相关用户
const io = getIO(req);
const event: MessageEvent = {
  type: 'message_edited',
  data: { message: updatedMessage, chatRoomId: message.chatroomId },
  timestamp: new Date()
};

io.to(message.chatroomId.toString()).emit('message_event', event);
```

### 3. 在线状态管理
```typescript
// 用户加入聊天室
socket.on('join_room', async (chatRoomId: string) => {
  socket.join(chatRoomId);
  
  // 通知其他成员
  socket.to(chatRoomId).emit('user_joined_room', {
    userId: socket.data.userId,
    userName: socket.data.userName,
    chatRoomId
  });
});
```

## 安全考虑

### 1. 身份验证
- 所有socket连接都需要通过`login`事件进行身份验证
- HTTP API端点使用JWT token认证

### 2. 权限控制
- 只有聊天室成员才能发送消息
- 只有消息发送者才能编辑/删除消息
- 用户只能访问自己参与的聊天室

### 3. 数据验证
- 所有输入数据都进行验证
- 防止XSS和注入攻击

## 性能优化

### 1. 房间管理
- 使用Socket.IO的房间功能进行消息隔离
- 用户只接收相关聊天室的消息

### 2. 在线状态缓存
- 使用内存Map缓存在线用户状态
- 避免频繁的数据库查询

### 3. 事件节流
- 打字状态事件进行节流处理
- 避免过多的事件推送

## 错误处理

### 1. 连接错误
```typescript
socket.on('error', (error) => {
  console.error('Socket error:', error);
});
```

### 2. 重连机制
```javascript
// 前端自动重连
const socket = io('http://localhost:5001', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});
```

### 3. 离线处理
```typescript
socket.on('disconnect', () => {
  // 清理用户状态
  // 通知其他用户离线
});
```

## 部署注意事项

### 1. 环境变量
```bash
JWT_SECRET=your_jwt_secret
API_PORT=5001
```

### 2. CORS配置
```typescript
const io = new SocketIOServer(server, { 
  cors: { 
    origin: '*',
    methods: ['GET', 'POST']
  } 
});
```

### 3. 生产环境
- 使用Redis适配器支持多实例部署
- 配置适当的CORS策略
- 启用HTTPS

## 测试

### 1. 单元测试
```bash
npm test socket.test.ts
```

### 2. 集成测试
```bash
npm test socket.integration.test.ts
```

### 3. 性能测试
```bash
npm test socket.performance.test.ts
```

## 故障排除

### 常见问题

1. **连接失败**
   - 检查服务器端口配置
   - 确认CORS设置
   - 验证网络连接

2. **消息不推送**
   - 检查用户是否已加入聊天室
   - 确认socket连接状态
   - 验证事件名称

3. **在线状态不准确**
   - 检查用户登录状态
   - 确认断开连接处理
   - 验证房间管理逻辑

### 调试工具

1. **Socket.IO 调试**
```bash
DEBUG=socket.io:* npm start
```

2. **日志查看**
```bash
tail -f logs/socket.log
```

3. **在线状态监控**
```typescript
// 获取在线用户列表
const onlineUsers = io.getOnlineUsers();
console.log('Online users:', onlineUsers);
``` 