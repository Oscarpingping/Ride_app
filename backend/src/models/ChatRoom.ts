import mongoose, { Document, Schema } from 'mongoose';

export interface IChatRoom extends Document {
  club: mongoose.Types.ObjectId;    // 关联的俱乐部
  messages: Array<{
    sender: string;                 // 发送者的 name_sid
    type: 'text' | 'emoji' | 'image' | 'video' | 'file' | 'location';
    content: string;                // 消息内容
    metadata?: {                    // 媒体文件的元数据
      fileName?: string;            // 文件名
      fileSize?: number;            // 文件大小
      mimeType?: string;            // 文件类型
      duration?: number;            // 视频时长
      thumbnail?: string;           // 缩略图URL
      location?: {                  // 位置信息
        latitude: number;
        longitude: number;
        address?: string;
        name?: string;              // 位置名称
        source: 'google' | 'komoot' | 'ridewithgps' | 'custom';  // 位置来源
        externalId?: string;        // 外部应用中的ID
        externalUrl?: string;       // 外部应用中的URL
        routeData?: {               // 路线数据
          distance?: number;        // 距离（米）
          elevation?: number;       // 海拔（米）
          duration?: number;        // 预计时间（秒）
          type?: string;            // 路线类型
          points?: Array<{          // 路线点
            lat: number;
            lng: number;
            ele?: number;           // 海拔
          }>;
        };
      };
    };
    createdAt: Date;               // 发送时间
    updatedAt: Date;               // 最后编辑时间
    isEdited: boolean;             // 是否被编辑过
    isDeleted: boolean;            // 是否被删除
    editHistory?: Array<{          // 编辑历史
      content: string;             // 修改前的内容
      editedAt: Date;              // 修改时间
    }>;
    deletedBy?: string[];          // 谁删除了这条消息
    deleteReason?: string;         // 删除原因
  }>;
  lastMessage: {                    // 最后一条消息
    sender: string;                 // 发送者
    content: string;                // 内容预览
    type: string;                   // 消息类型
    timestamp: Date;                // 发送时间
  };
  createdAt: Date;
  updatedAt: Date;
}

const chatRoomSchema = new Schema<IChatRoom>(
  {
    club: {
      type: Schema.Types.ObjectId,
      ref: 'Club',
      required: true,
      unique: true
    },
    messages: [{
      sender: {
        type: String,
        required: true,
        index: true
      },
      type: {
        type: String,
        enum: ['text', 'emoji', 'image', 'video', 'file', 'location'],
        required: true
      },
      content: {
        type: String,
        required: true
      },
      metadata: {
        fileName: String,
        fileSize: Number,
        mimeType: String,
        duration: Number,
        thumbnail: String,
        location: {
          latitude: Number,
          longitude: Number,
          address: String,
          name: String,
          source: String,
          externalId: String,
          externalUrl: String,
          routeData: {
            distance: Number,
            elevation: Number,
            duration: Number,
            type: String,
            points: [{
              lat: Number,
              lng: Number,
              ele: Number
            }]
          }
        }
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      updatedAt: {
        type: Date,
        default: Date.now
      },
      isEdited: {
        type: Boolean,
        default: false
      },
      isDeleted: {
        type: Boolean,
        default: false
      },
      editHistory: [{
        content: String,
        editedAt: Date
      }],
      deletedBy: [String],
      deleteReason: String
    }],
    lastMessage: {
      sender: String,
      content: String,
      type: String,
      timestamp: Date
    }
  },
  {
    timestamps: true
  }
);

// 创建索引
chatRoomSchema.index({ club: 1 });
chatRoomSchema.index({ 'messages.sender': 1 });
chatRoomSchema.index({ 'messages.createdAt': -1 });

// 更新最后一条消息
chatRoomSchema.pre('save', function(next) {
  if (this.messages.length > 0) {
    const lastMsg = this.messages[this.messages.length - 1];
    this.lastMessage = {
      sender: lastMsg.sender,
      content: lastMsg.content,
      type: lastMsg.type,
      timestamp: lastMsg.createdAt
    };
  }
  next();
});

export const ChatRoom = mongoose.model<IChatRoom>('ChatRoom', chatRoomSchema); 