import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    // 使用内存数据库进行测试
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/wildpals-test';
    const conn = await mongoose.connect(mongoUri, {
      // 添加连接选项
      serverSelectionTimeoutMS: 5000, // 5秒超时
      socketTimeoutMS: 45000, // 45秒socket超时
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    console.log('尝试使用内存数据库...');
    try {
      // 如果MongoDB连接失败，使用内存数据库
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = new MongoMemoryServer();
      await mongod.start();
      const uri = mongod.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`内存MongoDB Connected: ${conn.connection.host}`);
    } catch (memError) {
      console.error('内存数据库也连接失败:', memError);
      // 不退出进程，继续运行
    }
  }
};

export default connectDB; 