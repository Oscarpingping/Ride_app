import express from 'express';
import path from 'path';

import cors from 'cors';
import 'dotenv/config';
import authRoutes from './routes/auth';
import rideRoutes from './routes/rides';
import userRoutes from './routes/userRoutes';
import clubRoutes from './routes/clubRoutes';
import messageRoutes from './routes/messageRoutes';
import webRoutes from './routes/web';
import { SYSTEM_CONFIG } from './config/system';

const app = express();

// 中间件
app.use(cors({
  origin: '*',  // 开发阶段允许所有来源
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));  // 增加请求体大小限制
//app.use(requestLogger);

// 健康检查路由
app.get('/health', (req, res) => {
  console.log(`[${new Date().toISOString()}] 🏥 健康检查请求:
    IP: ${req.ip}
    Headers: ${JSON.stringify(req.headers, null, 2)}
  `);
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    port: SYSTEM_CONFIG.SERVER.API_PORT
  });
});

// 连接数据库（使用内存数据库进行测试）
import connectDB from './config/database';
connectDB();

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/messages', messageRoutes);
app.use('/', webRoutes);

// 添加静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  maxAge: '1y', // 设置缓存时间为1年
  etag: true, // 启用ETag
  lastModified: true // 启用Last-Modified
}));

// 错误处理中间件
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: '服务器内部错误',
  });
});

// 使用系统配置中的API端口
const PORT = SYSTEM_CONFIG.SERVER.API_PORT;
//app.listen(PORT, () => {
app.listen(5001, '0.0.0.0', () => {
  console.log(`API Server is running on port ${PORT}`);
});

export default app; 