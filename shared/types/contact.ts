// 使用统一的用户类型定义
import { Friend, UserSummary } from './user-unified';

// 为了向后兼容，保留Contact接口
export interface Contact {
  _id: string;
  userId: string;
  contactId: string;
  contact: UserSummary;
  createdAt: Date;
  updatedAt: Date;
}

// 推荐使用新的Friend类型
export { Friend }; 