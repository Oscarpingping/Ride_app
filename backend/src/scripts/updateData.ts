import mongoose from 'mongoose';
import { User } from '../models/User';
import { Club } from '../models/Club';
import { Ride } from '../models/Ride';
import dotenv from 'dotenv';

dotenv.config();

// 连接数据库
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/wildpals';
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// 更新用户数据示例
const updateUserData = async () => {
  try {
    // 更新特定用户的名称
    const updatedUser = await User.findOneAndUpdate(
      { email: 'user@example.com' },
      { 
        $set: { 
          name: '新用户名',
          bio: '新的个人简介'
        }
      },
      { new: true }
    );
    console.log('Updated user:', updatedUser);

    // 批量更新所有用户的评分
    const result = await User.updateMany(
      { rating: { $lt: 50 } },
      { $set: { rating: 50 } }
    );
    console.log('Updated users count:', result.modifiedCount);

  } catch (error) {
    console.error('Error updating user data:', error);
  }
};

// 更新俱乐部数据示例
const updateClubData = async () => {
  try {
    // 更新特定俱乐部的描述
    const updatedClub = await Club.findOneAndUpdate(
      { clubId: 'biking-club-abc' },
      { 
        $set: { 
          description: '新的俱乐部描述',
          isPrivate: false
        }
      },
      { new: true }
    );
    console.log('Updated club:', updatedClub);

    // 向俱乐部添加新成员
    const club = await Club.findOne({ clubId: 'biking-club-abc' });
    if (club) {
      club.members.push(new mongoose.Types.ObjectId('用户ID'));
      club.stats.memberCount = club.members.length;
      await club.save();
      console.log('Added member to club');
    }

  } catch (error) {
    console.error('Error updating club data:', error);
  }
};

// 更新活动数据示例
const updateRideData = async () => {
  try {
    // 更新活动的最大参与人数
    const updatedRide = await Ride.findOneAndUpdate(
      { _id: '活动ID' },
      { 
        $set: { 
          maxParticipants: 20,
          difficulty: 'medium'
        }
      },
      { new: true }
    );
    console.log('Updated ride:', updatedRide);

  } catch (error) {
    console.error('Error updating ride data:', error);
  }
};

// 复杂查询和更新示例
const complexUpdate = async () => {
  try {
    // 查找并更新所有评分低于50且创建活动数量为0的用户
    const result = await User.updateMany(
      { 
        rating: { $lt: 50 },
        ridesCreated: { $size: 0 }
      },
      { 
        $set: { 
          rating: 50,
          canCreateClub: true
        }
      }
    );
    console.log('Complex update result:', result);

  } catch (error) {
    console.error('Error in complex update:', error);
  }
};

// 主函数
const main = async () => {
  await connectDB();
  
  console.log('开始更新数据...');
  
  await updateUserData();
  await updateClubData();
  await updateRideData();
  await complexUpdate();
  
  console.log('数据更新完成');
  
  await mongoose.disconnect();
  console.log('数据库连接已关闭');
};

// 运行脚本
if (require.main === module) {
  main().catch(console.error);
}

export {
  updateUserData,
  updateClubData,
  updateRideData,
  complexUpdate
}; 