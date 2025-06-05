// 密码验证规则
export const PASSWORD_RULES = {
  // 密码最小长度
  MIN_LENGTH: 8,
  
  // 密码正则表达式
  REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  
  // 密码验证错误消息
  ERROR_MESSAGE: 'Password must be at least 8 characters long and contain uppercase, lowercase, number and special character',
  
  // 密码验证函数
  validate: (password: string): boolean => {
    return PASSWORD_RULES.REGEX.test(password);
  }
}; 