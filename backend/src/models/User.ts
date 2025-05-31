import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { CLUB_CREATION_PERMISSION } from '../config/constants';

// 导入统一的类型定义
import { User as UserType, ClubReference, EmergencyContact } from '../../../shared/types/user-unified';

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
  clubs?: mongoose.Types.ObjectId[];
  createdClubs?: mongoose.Types.ObjectId[];
  managedClubs?: mongoose.Types.ObjectId[];
  canCreateClub: boolean;
  createdAt: Date;
  updatedAt: Date;
  profilePicture?: string;
  emergencyContact?: EmergencyContact;
  // 密码重置相关字段
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  toJSON(): UserType;
  updateClubCreationPermission(): Promise<void>;
  toPublicJSON(): UserType;
  toAuthJSON(): UserType;
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
      type: Schema.Types.ObjectId,
      ref: 'Club'
    }],
    createdClubs: [{
      type: Schema.Types.ObjectId,
      ref: 'Club'
    }],
    managedClubs: [{
      type: Schema.Types.ObjectId,
      ref: 'Club'
    }],
    canCreateClub: {
      type: Boolean,
      default: false
    },
    profilePicture: String,
    emergencyContact: {
      name: String,
      phone: String
    },
    // 密码重置相关字段
    resetPasswordToken: {
      type: String,
      default: null
    },
    resetPasswordExpires: {
      type: Date,
      default: null
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

// 评分更新中间件 - 当评分更新时自动更新俱乐部创建权限
userSchema.pre('save', async function (next) {
  if (this.isModified('rating')) {
    await this.updateClubCreationPermission();
  }
  next();
});

// 密码比较方法
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// 更新俱乐部创建权限的方法
userSchema.methods.updateClubCreationPermission = async function(): Promise<void> {
  const rating = this.rating || 0;
  const ridesJoined = this.ridesJoined || 0;
  const ridesCreated = this.ridesCreated || 0;
  const clubsCount = this.clubs?.length || 0;
  const registrationAge = (Date.now() - this.createdAt.getTime()) / 
    CLUB_CREATION_PERMISSION.REGISTRATION_AGE_UNIT.MILLISECONDS_PER_MONTH;

  // 使用配置的权重计算综合评分
  const score = (
    rating * CLUB_CREATION_PERMISSION.WEIGHTS.RATING +
    ridesJoined * CLUB_CREATION_PERMISSION.WEIGHTS.RIDES_JOINED +
    ridesCreated * CLUB_CREATION_PERMISSION.WEIGHTS.RIDES_CREATED +
    clubsCount * CLUB_CREATION_PERMISSION.WEIGHTS.CLUBS_COUNT +
    registrationAge * CLUB_CREATION_PERMISSION.WEIGHTS.REGISTRATION_AGE
  );

  // 使用配置的阈值更新权限
  this.canCreateClub = score >= CLUB_CREATION_PERMISSION.THRESHOLD;
  
  // 如果权限发生变化，保存用户
  if (this.isModified('canCreateClub')) {
    await this.save();
  }
};

// 转换为前端类型的方法
userSchema.methods.toJSON = function (): UserType {
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
  if (userObject.createdClubs) {  // 新增：转换创建的俱乐部ID
    userObject.createdClubs = userObject.createdClubs.map((id: mongoose.Types.ObjectId) => id.toString());
  }
  
  return userObject as UserType;
};

// 转换为公开用户对象
userSchema.methods.toPublicJSON = function(): UserType {
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
  if (userObject.createdClubs) {  // 新增：转换创建的俱乐部ID
    userObject.createdClubs = userObject.createdClubs.map((id: mongoose.Types.ObjectId) => id.toString());
  }
  
  return userObject as UserType;
};

// 转换为认证用户对象
userSchema.methods.toAuthJSON = function(): UserType {
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
  if (userObject.createdClubs) {  // 新增：转换创建的俱乐部ID
    userObject.createdClubs = userObject.createdClubs.map((id: mongoose.Types.ObjectId) => id.toString());
  }
  
  return userObject as UserType;
};

export const User = mongoose.model<IUser>('User', userSchema); 