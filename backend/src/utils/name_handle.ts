import { User } from '../models/User';
import crypto from 'crypto';

/**
 * 生成用户唯一标识符
 * @param name 用户名
 * @returns 格式为 @[纯字母name]-[6位随机字符] 的标识符
 * 例如：用户名为 "Tony Liu" 会生成 "@tonyliu-a1b2c3"
 */
export const generateHandle = async (name: string): Promise<string> => {
  // 移除所有非字母字符，并将空格替换为空字符串
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