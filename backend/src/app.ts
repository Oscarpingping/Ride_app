import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import 'dotenv/config';
import authRoutes from './routes/auth';
import rideRoutes from './routes/rides';
import userRoutes from './routes/userRoutes';
import clubRoutes from './routes/clubRoutes';
import messageRoutes from './routes/messageRoutes';
import webRoutes from './routes/web';
import { SYSTEM_CONFIG } from './config/system';
import { requestLogger } from './middleware/requestLogger';

const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(requestLogger);

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

// 连接数据库
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ride_app')
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/messages', messageRoutes);
app.use('/', webRoutes);

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
app.listen(PORT, () => {
  console.log(`API Server is running on port ${PORT}`);
});

export default app; 