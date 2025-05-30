import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// 导入统一的类型定义
import { User, ClubReference, EmergencyContact } from '../../../shared/types/user-unified';

// 后端用户接口，继承统一定义并添加Document和方法
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  bio?: string;
  rating?: number;
  ridesJoined?: number;
  ridesCreated?: number;
  createdRides?: mongoose.Types.ObjectId[];
  joinedRides?: mongoose.Types.ObjectId[];
  clubs?: {
    club: mongoose.Types.ObjectId;
    joinedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
  profilePicture?: string; // 兼容字段，实际使用avatar
  emergencyContact?: EmergencyContact;
  comparePassword(candidatePassword: string): Promise<boolean>;
  toJSON(): User; // 转换为前端类型的方法
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    avatar: {
      type: String,
    },
    bio: {
      type: String,
    },
    rating: {
      type: Number,
      default: 0
    },
    ridesJoined: {
      type: Number,
      default: 0
    },
    ridesCreated: {
      type: Number,
      default: 0
    },
    createdRides: [{
      type: Schema.Types.ObjectId,
      ref: 'Ride'
    }],
    joinedRides: [{
      type: Schema.Types.ObjectId,
      ref: 'Ride'
    }],
    clubs: [{
      club: {
        type: Schema.Types.ObjectId,
        ref: 'Club',
        required: true
      },
      joinedAt: {
        type: Date,
        default: Date.now
      }
    }],
    profilePicture: String,
    emergencyContact: {
      name: String,
      phone: String
    }
  },
  {
    timestamps: true,
  }
);

// 密码加密中间件
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// 密码比较方法
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// 转换为前端类型的方法
userSchema.methods.toJSON = function (): User {
  const userObject = this.toObject();
  
  // 移除敏感信息
  delete userObject.password;
  
  // 确保使用avatar字段（如果profilePicture存在但avatar不存在）
  if (userObject.profilePicture && !userObject.avatar) {
    userObject.avatar = userObject.profilePicture;
  }
  
  // 转换ObjectId为字符串
  if (userObject.createdRides) {
    userObject.createdRides = userObject.createdRides.map((id: mongoose.Types.ObjectId) => id.toString());
  }
  if (userObject.joinedRides) {
    userObject.joinedRides = userObject.joinedRides.map((id: mongoose.Types.ObjectId) => id.toString());
  }
  if (userObject.clubs) {
    userObject.clubs = userObject.clubs.map((clubRef: any) => ({
      club: clubRef.club.toString(),
      joinedAt: clubRef.joinedAt
    }));
  }
  
  return userObject as User;
};

export const User = mongoose.model<IUser>('User', userSchema); 