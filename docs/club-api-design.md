# Club API 设计文档

## 1. 数据模型
```typescript:backend/src/models/Club.ts
import mongoose from 'mongoose';

const clubSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true, 
    minlength: 3, 
    maxlength: 50 
  },
  type: { 
    type: String, 
    required: true, 
    enum: ['biking', 'climbing', 'hiking', 'skiing', 'surfing', 'running', 'camping'] 
  },
  contactEmail: { 
    type: String, 
    required: true, 
    trim: true, 
    lowercase: true 
  },
  location: {
    city: { type: String, required: true },
    province: { type: String, required: true },
    country: { type: String, required: true },
    coordinates: {
      latitude: { type: Number, min: -90, max: 90 },
      longitude: { type: Number, min: -180, max: 180 }
    }
  },
  rules: [{ type: String, maxlength: 100 }],
  tags: [{ type: String, maxlength: 20 }],
  isPrivate: { type: Boolean, default: false },
  founder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  logo: { type: String },
  coverImage: { type: String },
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  joinRequests: {
    pending: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      message: { type: String },
      createdAt: { type: Date, default: Date.now }
    }],
    history: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      status: { type: String },
      message: { type: String },
      response: { type: String },
      handledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now },
      handledAt: { type: Date, default: Date.now }
    }],
    stats: {
      memberCount: { type: Number, default: 0 }
    }
  },
  chatRoom: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatRoom' }
}, { timestamps: true });

// 索引
clubSchema.index({ name: 1 });
clubSchema.index({ type: 1 });
clubSchema.index({ 'location.city': 1 });

export const Club = mongoose.model('Club', clubSchema);
```

## 2. API 路由
```typescript:backend/src/routes/clubRoutes.ts
import express from 'express';
import { 
  createClub, 
  getClubs, 
  getClubById, 
  updateClub, 
  deleteClub, 
  leaveClub, 
  getUserClubs,
  addAdmin,
  requestJoinClub,
  handleJoinRequest
} from '../controllers/clubController';
import { auth } from '../middleware/auth';
import { validateClub } from '../middleware/validateClub';

const router = express.Router();

// 基础路由
router.post('/', auth, validateClub, createClub);
router.get('/', auth, getClubs);
router.get('/:clubId', auth, getClubById);
router.put('/:clubId', auth, validateClub, updateClub);
router.delete('/:clubId', auth, deleteClub);

// 用户相关路由
router.get('/user/clubs', auth, getUserClubs);
router.post('/:clubId/leave', auth, leaveClub);

// 管理员相关路由
router.post('/:clubId/admins', auth, addAdmin);

// 加入申请相关路由
router.post('/:clubId/join-request', auth, requestJoinClub);
router.post('/:clubId/join-request/:requestId', auth, handleJoinRequest);

export default router;
```

## 3. 控制器实现
```typescript:backend/src/controllers/clubController.ts
import { Request, Response } from 'express';
import { Club } from '../models/Club';
import { uploadImage } from '../services/uploadService';
import { ChatRoom } from '../models/ChatRoom';

// 创建俱乐部
export const createClub = async (req: Request, res: Response) => {
  try {
    const club = new Club({
      ...req.body,
      founder: req.user._id,
      members: [req.user._id],
      admins: [req.user._id]
    });
    await club.save();
    res.status(201).json({ success: true, data: club });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

// 添加管理员
export const addAdmin = async (req: Request, res: Response) => {
  try {
    const club = await Club.findById(req.params.clubId);
    if (!club) {
      return res.status(404).json({ success: false, error: 'Club not found' });
    }
    
    if (club.founder.toString() !== req.user._id) {
      return res.status(403).json({ success: false, error: 'Only founder can add admins' });
    }
    
    const { userId } = req.body;
    if (!club.members.includes(userId)) {
      return res.status(400).json({ success: false, error: 'User must be a member first' });
    }
    
    if (club.admins.includes(userId)) {
      return res.status(400).json({ success: false, error: 'User is already an admin' });
    }
    
    club.admins.push(userId);
    await club.save();
    
    res.json({ success: true, data: club });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

// 处理加入申请
export const handleJoinRequest = async (req: Request, res: Response) => {
  try {
    const club = await Club.findById(req.params.clubId);
    if (!club) {
      return res.status(404).json({ success: false, error: 'Club not found' });
    }
    
    const { requestId, action, response } = req.body;
    const request = club.joinRequests.pending.id(requestId);
    
    if (!request) {
      return res.status(404).json({ success: false, error: 'Join request not found' });
    }
    
    if (!club.admins.includes(req.user._id) && club.founder.toString() !== req.user._id) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    
    if (action === 'approve') {
      club.members.push(request.user);
      club.stats.memberCount = club.members.length;
    }
    
    // 移动请求到历史记录
    club.joinRequests.history.push({
      user: request.user,
      status: action,
      message: request.message,
      response,
      handledBy: req.user._id,
      createdAt: request.createdAt,
      handledAt: new Date()
    });
    
    // 从待处理列表中移除
    club.joinRequests.pending.pull(requestId);
    await club.save();
    
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

// 申请加入俱乐部
export const requestJoinClub = async (req: Request, res: Response) => {
  try {
    const club = await Club.findById(req.params.clubId);
    if (!club) {
      return res.status(404).json({ success: false, error: 'Club not found' });
    }
    
    if (club.members.includes(req.user._id)) {
      return res.status(400).json({ success: false, error: 'Already a member' });
    }
    
    const { message } = req.body;
    club.joinRequests.pending.push({
      user: req.user._id,
      message,
      createdAt: new Date()
    });
    
    await club.save();
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

// 更新俱乐部
export const updateClub = async (req: Request, res: Response) => {
  try {
    const club = await Club.findById(req.params.clubId);
    if (!club) {
      return res.status(404).json({ success: false, error: 'Club not found' });
    }
    
    if (!club.admins.includes(req.user._id) && club.founder.toString() !== req.user._id) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    
    Object.assign(club, req.body);
    await club.save();
    
    res.json({ success: true, data: club });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

// 删除俱乐部
export const deleteClub = async (req: Request, res: Response) => {
  try {
    const club = await Club.findById(req.params.clubId);
    if (!club) {
      return res.status(404).json({ success: false, error: 'Club not found' });
    }
    
    if (club.founder.toString() !== req.user._id) {
      return res.status(403).json({ success: false, error: 'Only founder can delete club' });
    }
    
    // 删除关联的聊天室
    if (club.chatRoom) {
      await ChatRoom.findByIdAndDelete(club.chatRoom);
    }
    
    await club.remove();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};

// 离开俱乐部
export const leaveClub = async (req: Request, res: Response) => {
  try {
    const club = await Club.findById(req.params.clubId);
    if (!club) {
      return res.status(404).json({ success: false, error: 'Club not found' });
    }
    
    if (!club.members.includes(req.user._id)) {
      return res.status(400).json({ success: false, error: 'Not a member' });
    }
    
    // 如果是创建者，不允许离开
    if (club.founder.toString() === req.user._id) {
      return res.status(400).json({ success: false, error: 'Founder cannot leave the club' });
    }
    
    // 从成员列表中移除
    club.members = club.members.filter(id => id.toString() !== req.user._id);
    // 如果是管理员，也从管理员列表中移除
    if (club.admins.includes(req.user._id)) {
      club.admins = club.admins.filter(id => id.toString() !== req.user._id);
    }
    
    club.stats.memberCount = club.members.length;
    await club.save();
    
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

// 获取用户俱乐部
export const getUserClubs = async (req: Request, res: Response) => {
  try {
    const clubs = await Club.find({ members: req.user._id })
      .populate('founder', 'name avatar');
    
    res.json({ success: true, data: clubs });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};
```

## 4. 图片上传服务
```typescript:backend/src/services/uploadService.ts
import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadImage = async (file: string) => {
  try {
    const result = await cloudinary.v2.uploader.upload(file, {
      folder: 'clubs',
      transformation: [
        { width: 500, height: 500, crop: 'limit' }
      ]
    });
    return { url: result.secure_url };
  } catch (e) {
    throw new Error('Image upload failed');
  }
};
```

## 5. 错误处理
```typescript:backend/src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};
```

## 6. 认证中间件
```typescript:backend/src/middleware/auth.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error('No token provided');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).json({ success: false, error: 'Authentication failed' });
  }
};
```

## 7. 请求验证中间件
```typescript:backend/src/middleware/validateClub.ts
import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

export const validateClub = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    name: Joi.string().required().min(3).max(50),
    type: Joi.string().required().valid('biking', 'climbing', 'hiking', 'skiing', 'surfing', 'running', 'camping'),
    contactEmail: Joi.string().email().required(),
    location: Joi.object({
      city: Joi.string().required(),
      province: Joi.string().required(),
      country: Joi.string().required(),
      coordinates: Joi.object({
        latitude: Joi.number().min(-90).max(90),
        longitude: Joi.number().min(-180).max(180)
      }).optional()
    }).required(),
    rules: Joi.array().items(Joi.string().max(100)).max(10),
    tags: Joi.array().items(Joi.string().max(20)).max(5),
    isPrivate: Joi.boolean().default(false)
  });

  const { error } = schema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }
  
  next();
};
```

## 8. 安全考虑
- 使用 JWT 进行身份验证
- 敏感操作需要验证用户权限
- 私有俱乐部数据访问控制
- 输入数据 sanitization
- 使用 HTTPS
- 设置 CORS 策略
- 限制请求频率

## 9. 性能优化
- 使用数据库索引
- 实现数据分页
- 缓存常用数据
- 图片压缩处理
- 使用 PM2 进行进程管理
- 实现请求超时处理
- 使用 Redis 缓存会话数据

## 10. 部署建议
- 使用 Docker 容器化
- 配置 Nginx 反向代理
- 使用 CI/CD 流程
- 监控系统状态
- 定期备份数据
- 使用环境变量管理配置 