import mongoose, { Document, Schema } from 'mongoose';

// 消息编辑和删除的时间限制（5分钟）
//const MESSAGE_EDIT_WINDOW = 5 * 60 * 1000; // 5分钟，单位：毫秒

export interface IChatRoom extends Document {
  name: string;                    // 聊天室名称 (对于club类型，这是club名称的副本)
  logo?: string;                   // 聊天室logo (对于club类型，这是club logo的副本)
  type: 'club' | 'group' | 'activity' | 'other'; // 聊天室类型
  club?: mongoose.Types.ObjectId;    // 关联的俱乐部（可选）
  members: mongoose.Types.ObjectId[]; // 聊天室成员
  lastMessageId?: mongoose.Types.ObjectId; // 最新消息id，便于快速显示
  lastMessageTime?: Date;          // 最新消息时间
  maxMembers: number;
  autoDeleteDuration: number;
  pinnedMessages?: mongoose.Types.ObjectId[]; // 置顶消息id数组
  createdAt: Date;
  updatedAt: Date;
}

const chatRoomSchema = new Schema<IChatRoom>(
  {
    name: {
      type: String,
      required: true,
      default: 'New Chatroom'
    },
    logo: {
      type: String,
      default: '/Users/taoliu/Wildpals/assets/images/logo.png'
    },
    type: {
      type: String,
      enum: ['club', 'group', 'activity', 'other'],
      required: true
    },
    club: {
      type: Schema.Types.ObjectId,
      ref: 'Club',
      required: false
    },
    members: {
      type: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
      default: []
    },
    lastMessageId: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
      default: null
      },
    lastMessageTime: {
        type: Date,
        default: Date.now
    },
    maxMembers: {
      type: Number,
      default: 100
    },
    autoDeleteDuration: {
      type: Number,
      default: 0 // 0表示不自动删除
    },
    pinnedMessages: {
      type: [{
        type: Schema.Types.ObjectId,
        ref: 'Message'
      }],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// 创建索引
chatRoomSchema.index({ club: 1 });

export const ChatRoom = mongoose.model<IChatRoom>('ChatRoom', chatRoomSchema);

// 工具函数：创建消息的metadata
export const createMessageMetadata = (
  type: 'text' | 'emoji' | 'image' | 'video' | 'audio' | 'file' | 'url',
  metadata?: {
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    duration?: number;
    width?: number;
    height?: number;
    title?: string;
    description?: string;
    thumbnail?: string;
  }
) => {
  switch (type) {
    case 'text':
    case 'emoji':
      return undefined; // 文本和表情不需要metadata
    
    case 'image':
    case 'video':
    case 'audio':
    case 'file':
    case 'url':
      return metadata;
    
    default:
      return metadata;
  }
};

// 工具函数：获取消息的显示文本
export const getMessageDisplayText = (content: string, type: string, metadata?: any): string => {
  switch (type) {
    case 'text':
    case 'emoji':
      return content;
    
    case 'image':
    case 'video':
    case 'audio':
      return metadata?.fileName || content.split('/').pop() || 'Media';
    
    case 'file':
      return metadata?.fileName || content.split('/').pop() || 'File';
    
    case 'url':
      return metadata?.title || content;
    
    default:
      return content;
  }
}; 