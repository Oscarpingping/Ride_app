import mongoose, { Document, Schema } from 'mongoose';

export interface IClub extends Document {
  name: string;                    // 俱乐部名称
  description: string;             // 俱乐部描述
  logo?: string;                   // 俱乐部logo
  coverImage?: string;             // 俱乐部封面图片
  type: string;                    // 俱乐部类型（biking/climbing/hiking等）
  founder: mongoose.Types.ObjectId; // 创始人
  admins: mongoose.Types.ObjectId[]; // 管理员列表
  members: mongoose.Types.ObjectId[]; // 成员列表
  location: {                      // 位置信息
    city: string;
    province: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    }
  };
  stats: {                         // 俱乐部统计
    memberCount: number;
    activityCount: number;         // 活动数量
  };
  rules: string[];                // 俱乐部规则
  tags: string[];                 // 标签
  isPrivate: boolean;             // 是否私有俱乐部
  joinRequests: {                 // 当前待处理的加入请求
    pending: [{
      user: mongoose.Types.ObjectId;
      message?: string;           // 申请留言
      createdAt: Date;
    }];
    history: [{
      user: mongoose.Types.ObjectId;
      status: 'approved' | 'rejected';
      message?: string;           // 申请留言
      response?: string;          // 处理回复
      handledBy: mongoose.Types.ObjectId;  // 处理人
      createdAt: Date;
      handledAt: Date;
    }];
  };
  cardData: any;                  // 俱乐部数据卡片，根据type不同而不同
  createdAt: Date;
  updatedAt: Date;
}

const clubSchema = new Schema<IClub>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    description: {
      type: String,
      required: true
    },
    logo: {
      type: String
    },
    coverImage: {
      type: String
    },
    type: {
      type: String,
      required: true,
      enum: ['biking', 'climbing', 'hiking', 'skiing', 'surfing', 'running', 'camping']
    },
    founder: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    admins: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    members: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    location: {
      city: {
        type: String,
        required: true
      },
      province: {
        type: String,
        required: true
      },
      country: {
        type: String,
        required: true
      },
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    stats: {
      memberCount: {
        type: Number,
        default: 0
      },
      activityCount: {
        type: Number,
        default: 0
      }
    },
    rules: [{
      type: String
    }],
    tags: [{
      type: String
    }],
    isPrivate: {
      type: Boolean,
      default: false
    },
    joinRequests: {
      pending: [{
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        message: {
          type: String
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }],
      history: [{
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        status: {
          type: String,
          enum: ['approved', 'rejected'],
          required: true
        },
        message: {
          type: String
        },
        response: {
          type: String
        },
        handledBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        createdAt: {
          type: Date,
          required: true
        },
        handledAt: {
          type: Date,
          required: true
        }
      }]
    },
    cardData: {
      type: Schema.Types.Mixed,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// 创建索引
clubSchema.index({ name: 1 });
clubSchema.index({ type: 1 });
clubSchema.index({ 'location.city': 1, 'location.province': 1, 'location.country': 1 });
clubSchema.index({ tags: 1 });
// 为加入请求创建索引
clubSchema.index({ 'joinRequests.pending.user': 1 });
clubSchema.index({ 'joinRequests.history.user': 1 });

export const Club = mongoose.model<IClub>('Club', clubSchema); 