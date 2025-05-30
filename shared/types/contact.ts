import { User } from './user';

export interface Contact {
  _id: string;
  userId: string;
  contactId: string;
  contact: User;
  createdAt: Date;
  updatedAt: Date;
} 