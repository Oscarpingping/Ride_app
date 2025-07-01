import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  senderId: mongoose.Types.ObjectId;    // 发送者ID
  receiverId: mongoose.Types.ObjectId;  // 接收者ID（用户/俱乐部/活动/请求）
  receiverType: 'user' | 'club' | 'activity' | 'request'; // 新增，接收者类型
  senderNameSid: string;                // User's name_sid as primary identifier
  receiverNameSid: string;              // Receiver's name_sid
  content: string; // 文本、URL、位置描述等
  timestamp: Date;
  type: 'text' | 'emoji' | 'image' | 'video' | 'audio' | 'file' | 'url' | 'location' | 'CHAT' | 'JOIN_REQUEST' | 'JOIN_APPROVED' | 'SYSTEM';
  relatedClubId?: mongoose.Types.ObjectId;     // 相关俱乐部
  relatedActivityId?: mongoose.Types.ObjectId; // 相关活动
  chatroomId?: mongoose.Types.ObjectId; // 关联chatroom
  mentions?: mongoose.Types.ObjectId[]; // 提及的用户ID列表
  metadata?: {
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    duration?: number;
    width?: number;
    height?: number;
    lat?: number;
    lng?: number;
    mapUrl?: string;
    placeName?: string;
    title?: string;
    description?: string;
    thumbnail?: string;
  };
  isEdited?: boolean;
  isDeleted?: boolean;
  editHistory?: Array<{
    content: string;
    editedAt: Date;
    editedBy: string; // name_sid
  }>;
  deletedBy?: string[]; // name_sid数组
  deleteReason?: string;
  canEdit(userSid: string): boolean;
  canDelete(userSid: string): boolean;
}

const messageSchema = new Schema<IMessage>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true
    },
    receiverType: {
      type: String,
      enum: ['user', 'club', 'activity', 'request'],
      required: true
    },
    senderNameSid: {
      type: String,
      required: true,
      index: true
    },
    receiverNameSid: {
      type: String,
      required: true,
      index: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['text', 'emoji', 'image', 'video', 'audio', 'file', 'url', 'location', 'CHAT', 'JOIN_REQUEST', 'JOIN_APPROVED', 'SYSTEM'],
      required: true
    },
    relatedClubId: {
      type: Schema.Types.ObjectId,
      ref: 'Club',
      default: null
    },
    relatedActivityId: {
      type: Schema.Types.ObjectId,
      ref: 'Ride',
      default: null
    },
    chatroomId: {
      type: Schema.Types.ObjectId,
      ref: 'ChatRoom',
      default: null
    },
    mentions: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    metadata: {
      fileName: { type: String },
      fileSize: { type: Number },
      mimeType: { type: String },
      duration: { type: Number },
      width: { type: Number },
      height: { type: Number },
      lat: { type: Number },
      lng: { type: Number },
      mapUrl: { type: String },
      placeName: { type: String },
      title: { type: String },
      description: { type: String },
      thumbnail: { type: String }
    },
    isEdited: {
      type: Boolean,
      default: false
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    editHistory: [
      {
        content: String,
        editedAt: Date,
        editedBy: String
      }
    ],
    deletedBy: [String],
    deleteReason: String
  },
  {
    timestamps: true
  }
);

// 创建索引
messageSchema.index({ senderId: 1, receiverId: 1 });
messageSchema.index({ senderNameSid: 1, receiverNameSid: 1 });
messageSchema.index({ timestamp: -1 });
messageSchema.index({ type: 1 });
messageSchema.index({ relatedClubId: 1 });
messageSchema.index({ relatedActivityId: 1 });

// 消息编辑权限：仅发送者且在5分钟内可编辑
messageSchema.methods.canEdit = function(userSid: string): boolean {
  if (this.isDeleted) return false;
  const isSender = this.senderNameSid === userSid;
  const now = new Date();
  const messageAge = now.getTime() - this.timestamp.getTime();
  const EDIT_WINDOW = 5 * 60 * 1000;
  return isSender && messageAge <= EDIT_WINDOW;
};

// 消息删除权限：仅发送者且在5分钟内可删除
messageSchema.methods.canDelete = function(userSid: string): boolean {
  if (this.isDeleted) return false;
  const isSender = this.senderNameSid === userSid;
  const now = new Date();
  const messageAge = now.getTime() - this.timestamp.getTime();
  const DELETE_WINDOW = 5 * 60 * 1000;
  return isSender && messageAge <= DELETE_WINDOW;
};

export const Message = mongoose.model<IMessage>('Message', messageSchema); 