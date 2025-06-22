import mongoose, { Document, Schema } from 'mongoose';

// 消息编辑和删除的时间限制（5分钟）
const MESSAGE_EDIT_WINDOW = 5 * 60 * 1000; // 5分钟，单位：毫秒

export interface IChatRoom extends Document {
  name: string;                    // 聊天室名称
  type: 'club' | 'group' | 'activity' | 'other'; // 聊天室类型
  club: mongoose.Types.ObjectId;    // 关联的俱乐部
  members: mongoose.Types.ObjectId[]; // 聊天室成员
  messages: Array<{
    senderNameSid: string;          // 发送者的 name_sid
    type: 'text' | 'emoji' | 'image' | 'video' | 'audio' | 'file' | 'url';
    content: string;                // 消息内容：文本或URL
    metadata?: {
      // 文件信息
      fileName?: string;
      fileSize?: number;
      mimeType?: string;
      // 媒体信息
      duration?: number;
      width?: number;
      height?: number;
      // URL信息
      title?: string;
      description?: string;
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
  maxMembers: number;
  autoDeleteDuration: number;
  pinnedMessages?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const chatRoomSchema = new Schema<IChatRoom>(
  {
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['club', 'group', 'activity', 'other'],
      required: true
    },
    club: {
      type: Schema.Types.ObjectId,
      ref: 'Club',
      required: true,
      unique: true
    },
    members: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    messages: [{
      senderNameSid: {
        type: String,
        required: true,
        index: true
      },
      type: {
        type: String,
        enum: ['text', 'emoji', 'image', 'video', 'audio', 'file', 'url'],
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
        width: Number,
        height: Number,
        title: String,
        description: String,
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
    maxMembers: {
      type: Number,
      default: 100
    },
    autoDeleteDuration: {
      type: Number,
      default: 0 // 0表示不自动删除
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
  
  // 只有发送者且在时间窗口内可以操作
  const isSender = message.senderNameSid === userSid;
  const isWithinTimeWindow = messageAge <= MESSAGE_EDIT_WINDOW;
  
  // 编辑权限：只有文本和表情消息可以编辑，且需要是发送者且在时间窗口内
  const canEditText = (message.type === 'text' || message.type === 'emoji');
  message.canEdit = isSender && isWithinTimeWindow && canEditText;
  
  // 删除权限：所有类型消息都可以删除，但需要是发送者且在时间窗口内
  message.canDelete = isSender && isWithinTimeWindow;
  
  return {
    canEdit: message.canEdit,
    canDelete: message.canDelete
  };
};

// 验证消息编辑权限
chatRoomSchema.methods.validateEditPermission = function(messageId: string, userSid: string): { 
  canEdit: boolean; 
  reason?: string; 
} {
  const message = this.messages.id(messageId);
  if (!message) {
    return { canEdit: false, reason: 'Message not found' };
  }

  const now = new Date();
  const messageAge = now.getTime() - message.createdAt.getTime();
  
  // 检查是否是发送者
  if (message.senderNameSid !== userSid) {
    return { canEdit: false, reason: 'Only message sender can edit' };
  }
  
  // 检查时间窗口
  if (messageAge > MESSAGE_EDIT_WINDOW) {
    return { canEdit: false, reason: 'Edit time window expired (5 minutes)' };
  }
  
  // 检查消息类型
  if (message.type !== 'text' && message.type !== 'emoji') {
    return { canEdit: false, reason: 'Only text and emoji messages can be edited' };
  }
  
  return { canEdit: true };
};

// 验证消息删除权限
chatRoomSchema.methods.validateDeletePermission = function(messageId: string, userSid: string): { 
  canDelete: boolean; 
  reason?: string; 
} {
  const message = this.messages.id(messageId);
  if (!message) {
    return { canDelete: false, reason: 'Message not found' };
  }

  const now = new Date();
  const messageAge = now.getTime() - message.createdAt.getTime();
  
  // 检查是否是发送者
  if (message.senderNameSid !== userSid) {
    return { canDelete: false, reason: 'Only message sender can delete' };
  }
  
  // 检查时间窗口
  if (messageAge > MESSAGE_EDIT_WINDOW) {
    return { canDelete: false, reason: 'Delete time window expired (5 minutes)' };
  }
  
  return { canDelete: true };
};

// 编辑消息
chatRoomSchema.methods.editMessage = function(messageId: string, userSid: string, newContent: string): {
  success: boolean;
  message?: string;
  error?: string;
} {
  const validation = this.validateEditPermission(messageId, userSid);
  if (!validation.canEdit) {
    return { success: false, error: validation.reason };
  }

  const message = this.messages.id(messageId);
  if (!message) {
    return { success: false, error: 'Message not found' };
  }

  try {
    // 保存编辑历史
    if (!message.editHistory) {
      message.editHistory = [];
    }
    
    message.editHistory.push({
      content: message.content,
      editedAt: new Date(),
      editedBy: userSid
    });

    // 更新消息内容
    message.content = newContent;
    message.isEdited = true;
    message.updatedAt = new Date();

    return { success: true, message: 'Message edited successfully' };
  } catch (error) {
    return { success: false, error: 'Failed to edit message' };
  }
};

// 删除消息
chatRoomSchema.methods.deleteMessage = function(messageId: string, userSid: string, reason?: string): {
  success: boolean;
  message?: string;
  error?: string;
} {
  const validation = this.validateDeletePermission(messageId, userSid);
  if (!validation.canDelete) {
    return { success: false, error: validation.reason };
  }

  const message = this.messages.id(messageId);
  if (!message) {
    return { success: false, error: 'Message not found' };
  }

  try {
    // 标记消息为已删除
    message.isDeleted = true;
    message.updatedAt = new Date();
    
    // 记录删除信息
    if (!message.deletedBy) {
      message.deletedBy = [];
    }
    message.deletedBy.push(userSid);
    
    if (reason) {
      message.deleteReason = reason;
    }

    return { success: true, message: 'Message deleted successfully' };
  } catch (error) {
    return { success: false, error: 'Failed to delete message' };
  }
};

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