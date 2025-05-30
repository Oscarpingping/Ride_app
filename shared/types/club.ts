import { User } from './user';

export interface Club {
  _id: string;
  name: string;
  contactEmail: string;
  description: string;
  creatorId: string;
  creator: User;
  members: User[];
  createdAt: Date;
  updatedAt: Date;
} 