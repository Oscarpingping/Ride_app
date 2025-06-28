import mongoose, { Schema, Document, Model } from 'mongoose';


// 生成俱乐部ID的辅助函数
function generateClubId(name: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 5);
  const namePart = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 3);
  return `${namePart}${timestamp}${random}`;
}

export interface IClub extends Document {
  clubId: string;                  // 俱乐部唯一标识符
  name: string;                    // 俱乐部名称
  description?: string;             // 俱乐部描述
  logo?: string;                  // 图片URL
  coverImage?: string;            // 图片URL
  type: string;                    // 俱乐部类型（biking/climbing/hiking等）
  founder: mongoose.Types.ObjectId; // 创始人
  admins: mongoose.Types.ObjectId[]; // 管理员列表
  members: mongoose.Types.ObjectId[]; // 成员列表
  location?: {                      // 位置信息
    city: string;
    country: string;
  };
  stats: {                         // 俱乐部统计
    memberCount: number;
    activityCount?: number;         // 活动数量
  };
  rules?: string[];                // 俱乐部规则
  tags?: string[];                 // 标签
  isPrivate: boolean;             // 是否私有俱乐部
  joinRequests: {                 // 当前待处理的加入请求
    pending: Array<{
      user: mongoose.Types.ObjectId;
      message?: string;           // 申请留言
      createdAt: Date;
      messageId?: mongoose.Types.ObjectId;
    }>;
    history: Array<{
      user: mongoose.Types.ObjectId;
      status: 'approved' | 'rejected';
      message?: string;           // 申请留言
      response?: string;          // 处理回复
      handledBy: mongoose.Types.ObjectId;  // 处理人
      createdAt: Date;
      handledAt: Date;
      messageId?: mongoose.Types.ObjectId;
    }>;
  };
  cardData?: string;                  // 俱乐部数据卡片，根据type不同而不同
  chatRoom?: mongoose.Types.ObjectId; // 聊天室引用
  createdAt: Date;
  updatedAt: Date;
  contactEmail: string;            // 联系邮箱
}

const clubSchema = new Schema<IClub>(
  {
    clubId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 50
    },
    description: {
      type: String
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
        type: String
      },
      country: {
        type: String
      }
    },
    stats: {
      memberCount: {
        type: Number,
        default: 0,
        required: true
      },
      activityCount: {
        type: Number,
        default: 0
      }
    },
    rules: [{
      type: String,
      maxlength: 100
    }],
    tags: [{
      type: String,
      maxlength: 20
    }],
    isPrivate: {
      type: Boolean,
      default: false,
      required: true
    },
    joinRequests: {
      type: {
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
            default: Date.now,
            required: true
          },
          messageId: {
            type: Schema.Types.ObjectId,
            ref: 'Message',
            default: null
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
            default: Date.now,
            required: true
          },
          handledAt: {
            type: Date,
            default: Date.now,
            required: true
          },
          messageId: {
            type: Schema.Types.ObjectId,
            ref: 'Message',
            default: null
          }
        }]
      },
      required: true,
      default: { pending: [], history: [] }
    },
    cardData: {
      type: Schema.Types.Mixed
    },
    chatRoom: {
      type: Schema.Types.ObjectId,
      ref: 'ChatRoom'
    },
    contactEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    }
  },
  {
    timestamps: true
  }
);

// 创建索引
clubSchema.index({ clubId: 1 }, { unique: true });
clubSchema.index({ name: 'text', description: 'text' });
clubSchema.index({ 'location.city': 1 });
clubSchema.index({ type: 1 });
clubSchema.index({ tags: 1 });
clubSchema.index({ 'joinRequests.pending.user': 1 });
clubSchema.index({ 'joinRequests.history.user': 1 });

// 添加中间件
clubSchema.pre('save', async function(next) {
  if (this.isNew) {
    // 生成唯一的clubId
    let isUnique = false;
    let clubId = '';
    
    while (!isUnique) {
      clubId = generateClubId(this.name);
      const Model = this.constructor as Model<IClub>;
      const existingClub = await Model.findOne({ clubId });
      if (!existingClub) {
        isUnique = true;
      }
    }
    this.clubId = clubId;

    // 确保创建者在admins列表中
    if (!this.admins.includes(this.founder)) {
      this.admins.push(this.founder);
    }
    // 确保创建者在members列表中
    if (!this.members.includes(this.founder)) {
      this.members.push(this.founder);
    }
    // 更新成员数量
    if (!this.stats) {
      this.stats = { memberCount: 0, activityCount: 0 };
    }
    this.stats.memberCount = this.members.length;
    
    // 确保 joinRequests 已初始化
    if (!this.joinRequests) {
      this.joinRequests = { pending: [], history: [] };
    }
  }
  next();
});

// 在 clubSchema 定义后添加自动同步钩子
clubSchema.post('save', async function(doc, next) {
  if (doc.chatRoom) {
    const ChatRoom = mongoose.model('ChatRoom');
    await ChatRoom.findByIdAndUpdate(
      doc.chatRoom,
      {
        name: doc.name,
        logo: doc.logo,
        members: doc.members
      }
    );
  }
  next();
});

export const Club = mongoose.model<IClub>('Club', clubSchema); 