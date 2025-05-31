import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import rideRoutes from './routes/rides';
import webRoutes from './routes/web';
import { SYSTEM_CONFIG } from './config/system';

// 加载环境变量
dotenv.config();

const app = express();

// 连接数据库
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ride_app')
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);
app.use('/', webRoutes);

// 错误处理中间件
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
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