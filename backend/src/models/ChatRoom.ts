import mongoose, { Document, Schema } from 'mongoose';

// 消息编辑和删除的时间限制（5分钟）
const MESSAGE_EDIT_WINDOW = 5 * 60 * 1000; // 5分钟，单位：毫秒

export interface IChatRoom extends Document {
  club: mongoose.Types.ObjectId;    // 关联的俱乐部
  messages: Array<{
    sender: string;                 // 发送者的 name_sid
    type: 'text' | 'emoji' | 'image' | 'video' | 'file' | 'url';  // 改为 url 类型
    content: string;                // 消息内容
    metadata?: {                    // 媒体文件的元数据
      fileName?: string;            // 文件名
      fileSize?: number;            // 文件大小
      mimeType?: string;            // 文件类型
      duration?: number;            // 视频时长
      thumbnail?: string;           // 缩略图URL
    };
    createdAt: Date;               // 发送时间
    updatedAt: Date;               // 最后编辑时间
    isEdited: boolean;             // 是否被编辑过
    isDeleted: boolean;            // 是否被删除
    editHistory?: Array<{          // 编辑历史
      content: string;             // 修改前的内容
      editedAt: Date;              // 修改时间
      editedBy: string;            // 修改者
    }>;
    deletedBy?: string[];          // 谁删除了这条消息
    deleteReason?: string;         // 删除原因
    reactions?: Array<{            // 消息反应
      user: string;                // 用户ID
      emoji: string;               // 表情
      createdAt: Date;             // 添加时间
    }>;
    mentions?: string[];           // 提及的用户
    readBy: Array<{               // 已读信息
      user: string;               // 用户ID
      readAt: Date;               // 阅读时间
    }>;
    canEdit: boolean;             // 是否可以编辑
    canDelete: boolean;           // 是否可以删除
  }>;
  lastMessage: {                    // 最后一条消息
    sender: string;                 // 发送者
    content: string;                // 内容预览
    type: string;                   // 消息类型
    timestamp: Date;                // 发送时间
  };
  pinnedMessages?: string[];        // 置顶消息ID列表
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
        enum: ['text', 'emoji', 'image', 'video', 'file', 'url'],  // 改为 url 类型
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
      sender: String,
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
chatRoomSchema.index({ 'messages.sender': 1 });
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
      sender: lastMsg.sender,
      content: lastMsg.content,
      type: lastMsg.type,
      timestamp: lastMsg.createdAt
    };
  }
  next();
});

// 检查消息是否可以编辑或删除
chatRoomSchema.methods.checkMessagePermissions = function(messageId: string, userId: string) {
  const message = this.messages.id(messageId);
  if (!message) return { canEdit: false, canDelete: false };

  const now = new Date();
  const messageAge = now.getTime() - message.createdAt.getTime();
  
  // 只有发送者且在时间窗口内可以编辑或删除
  const isSender = message.sender === userId;
  const isWithinTimeWindow = messageAge <= MESSAGE_EDIT_WINDOW;
  
  message.canEdit = isSender && isWithinTimeWindow;
  message.canDelete = isSender && isWithinTimeWindow;
  
  return {
    canEdit: message.canEdit,
    canDelete: message.canDelete
  };
};

export const ChatRoom = mongoose.model<IChatRoom>('ChatRoom', chatRoomSchema); 