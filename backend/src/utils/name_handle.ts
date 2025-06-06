import { User } from '../models/User';
import crypto from 'crypto';

/**
 * 生成用户唯一标识符
 * @param name 用户名
 * @returns 格式为 @[纯字母name]-[6位随机字符] 的标识符
 */
export const generateHandle = async (name: string): Promise<string> => {
  // 只保留字母字符
  const base = name.toLowerCase().replace(/[^a-z]/g, '');
  
  // 生成6位随机字符（字母和数字）
  const randomChars = crypto.randomBytes(3).toString('hex');
  
  const handle = `@${base}-${randomChars}`;
  
  // 检查是否已存在
  const existingUser = await User.findOne({ name_sid: handle });
  if (existingUser) {
    // 如果存在，递归生成新的
    return generateHandle(name);
  }
  
  return handle;
}; 