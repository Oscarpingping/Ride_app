import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export interface IRide extends Document {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  meetingPoint: {
    latitude: number;
    longitude: number;
    address: string;
  };
  route: {
    type: 'road' | 'mountain' | 'gravel';
    distance: number;
    elevation: number;
  };
  difficulty: 'easy' | 'medium' | 'hard';
  pace: number;
  maxParticipants: number;
  currentParticipants: number;
  isPrivate: boolean;
  organizer: IUser['_id'];
  participants: IUser['_id'][];
  createdAt: Date;
  updatedAt: Date;
}

const rideSchema = new Schema<IRide>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    meetingPoint: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
    },
    route: {
      type: {
        type: String,
        enum: ['road', 'mountain', 'gravel'],
        required: true,
      },
      distance: {
        type: Number,
        required: true,
      },
      elevation: {
        type: Number,
        required: true,
      },
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    pace: {
      type: Number,
      required: true,
    },
    maxParticipants: {
      type: Number,
      required: true,
      min: 1,
    },
    currentParticipants: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    organizer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    participants: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
  },
  {
    timestamps: true,
  }
);

// 索引
rideSchema.index({ startTime: 1 });
rideSchema.index({ 'meetingPoint.latitude': 1, 'meetingPoint.longitude': 1 });
rideSchema.index({ organizer: 1 });
rideSchema.index({ participants: 1 });

export const Ride = mongoose.model<IRide>('Ride', rideSchema); 