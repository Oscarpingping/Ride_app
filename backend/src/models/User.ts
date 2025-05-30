import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

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
  profilePicture?: string;
  emergencyContact?: {
    name: string;
    phone: string;
  };
  comparePassword(candidatePassword: string): Promise<boolean>;
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

export const User = mongoose.model<IUser>('User', userSchema); 