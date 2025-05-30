import mongoose from 'mongoose';

export interface IMessage extends mongoose.Document {
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  content: string;
  timestamp: Date;
  type: 'CHAT' | 'JOIN_REQUEST' | 'JOIN_APPROVED';
  rideId?: mongoose.Types.ObjectId;
}

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
    default: 'CHAT'
  },
  rideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride'
  }
}, {
  timestamps: true
});

export const Message = mongoose.model<IMessage>('Message', messageSchema); 