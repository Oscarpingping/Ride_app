import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  senderId: mongoose.Types.ObjectId;    // 发送者ID
  receiverId: mongoose.Types.ObjectId;  // 接收者ID
  senderNameSid: string;                // User's name_sid as primary identifier
  receiverNameSid: string;              // Receiver's name_sid
  content: string;
  timestamp: Date;
  type: 'CHAT' | 'JOIN_REQUEST' | 'JOIN_APPROVED';
  rideId?: mongoose.Types.ObjectId;
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
      required: true,
      index: true
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
      enum: ['CHAT', 'JOIN_REQUEST', 'JOIN_APPROVED'],
      required: true
    },
    rideId: {
      type: Schema.Types.ObjectId,
      ref: 'Ride'
    }
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
messageSchema.index({ rideId: 1 });

export const Message = mongoose.model<IMessage>('Message', messageSchema); 