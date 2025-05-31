// 使用统一的用户类型定义
import { UserSummary } from './user-unified';

// 联系人接口定义
export interface Contact {
  _id: string;
  userId: string;
  contactId: string;
  contact: UserSummary;
  createdAt: Date;
  updatedAt: Date;
} 