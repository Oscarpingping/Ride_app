import mongoose, { Document, Schema } from 'mongoose';

// 消息编辑和删除的时间限制（5分钟）
const MESSAGE_EDIT_WINDOW = 5 * 60 * 1000; // 5分钟，单位：毫秒

export interface IChatRoom extends Document {
  club: mongoose.Types.ObjectId;    // 关联的俱乐部
  messages: Array<{
    senderNameSid: string;          // 发送者的 name_sid
    type: 'text' | 'emoji' | 'image' | 'video' | 'file' | 'url';
    content: string;
    metadata?: {
      fileName?: string;
      fileSize?: number;
      mimeType?: string;
      duration?: number;
      thumbnail?: string;
    };
    createdAt: Date;
    updatedAt: Date;
    isEdited: boolean;
    isDeleted: boolean;
    editHistory?: Array<{
      content: string;
      editedAt: Date;
      editedBy: string;            // 编辑者的 name_sid
    }>;
    deletedBy?: string[];          // 删除者的 name_sid 数组
    deleteReason?: string;
    reactions?: Array<{
      user: string;                // 用户的 name_sid
      emoji: string;
      createdAt: Date;
    }>;
    mentions?: string[];           // 被提及用户的 name_sid 数组
    readBy: Array<{
      user: string;               // 用户的 name_sid
      readAt: Date;
    }>;
    canEdit: boolean;
    canDelete: boolean;
  }>;
  lastMessage: {
    senderNameSid: string;        // 发送者的 name_sid
    content: string;
    type: string;
    timestamp: Date;
  };
  pinnedMessages?: string[];
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
      senderNameSid: {
        type: String,
        required: true,
        index: true
      },
      type: {
        type: String,
        enum: ['text', 'emoji', 'image', 'video', 'file', 'url'],
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
        thumbnail: String
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
        editedAt: Date,
        editedBy: String
      }],
      deletedBy: [String],
      deleteReason: String,
      reactions: [{
        user: String,
        emoji: String,
        createdAt: {
          type: Date,
          default: Date.now
        }
      }],
      mentions: [String],
      readBy: [{
        user: String,
        readAt: {
          type: Date,
          default: Date.now
        }
      }],
      canEdit: {
        type: Boolean,
        default: true
      },
      canDelete: {
        type: Boolean,
        default: true
      }
    }],
    lastMessage: {
      senderNameSid: String,
      content: String,
      type: String,
      timestamp: Date
    },
    pinnedMessages: [String]
  },
  {
    timestamps: true
  }
);

// 创建索引
chatRoomSchema.index({ club: 1 });
chatRoomSchema.index({ 'messages.senderNameSid': 1 });
chatRoomSchema.index({ 'messages.createdAt': -1 });
chatRoomSchema.index({ 'messages.type': 1 });
chatRoomSchema.index({ 'messages.mentions': 1 });
chatRoomSchema.index({ 'messages.readBy.user': 1 });
chatRoomSchema.index({ 'messages.reactions.user': 1 });

// 更新最后一条消息
chatRoomSchema.pre('save', function(next) {
  if (this.messages.length > 0) {
    const lastMsg = this.messages[this.messages.length - 1];
    this.lastMessage = {
      senderNameSid: lastMsg.senderNameSid,
      content: lastMsg.content,
      type: lastMsg.type,
      timestamp: lastMsg.createdAt
    };
  }
  next();
});

// 检查消息是否可以编辑或删除
chatRoomSchema.methods.checkMessagePermissions = function(messageId: string, userSid: string) {
  const message = this.messages.id(messageId);
  if (!message) return { canEdit: false, canDelete: false };

  const now = new Date();
  const messageAge = now.getTime() - message.createdAt.getTime();
  
  // 只有发送者且在时间窗口内可以编辑或删除
  const isSender = message.senderNameSid === userSid;
  const isWithinTimeWindow = messageAge <= MESSAGE_EDIT_WINDOW;
  
  message.canEdit = isSender && isWithinTimeWindow;
  message.canDelete = isSender && isWithinTimeWindow;
  
  return {
    canEdit: message.canEdit,
    canDelete: message.canDelete
  };
};

export const ChatRoom = mongoose.model<IChatRoom>('ChatRoom', chatRoomSchema); 