/**
 * 系统常数配置
 * 包含各种业务逻辑中使用的常数值
 */

// 俱乐部创建权限算法相关配置
export const CLUB_CREATION_PERMISSION = {
  // 评分权重配置
  WEIGHTS: {
    RATING: 0.4,           // 用户评分权重
    RIDES_JOINED: 0.2,     // 参与活动权重
    RIDES_CREATED: 0.2,    // 创建活动权重
    CLUBS_COUNT: 0.1,      // 加入俱乐部权重
    REGISTRATION_AGE: 0.1  // 注册时长权重
  },

  // 权限阈值
  THRESHOLD: 5.0,          // 获得创建权限所需的最低分数

  // 注册时长计算（月）
  REGISTRATION_AGE_UNIT: {
    MILLISECONDS_PER_MONTH: 1000 * 60 * 60 * 24 * 30  // 一个月的毫秒数
  }
} as const;

// 用户评分相关配置
export const USER_RATING = {
  // 评分范围
  MIN: 0,
  MAX: 10,
  
  // 评分更新规则
  UPDATE_RULES: {
    RIDE_COMPLETION: 0.5,    // 完成一次活动
    RIDE_CREATION: 1.0,      // 创建一次活动
    CLUB_JOIN: 0.3,          // 加入一个俱乐部
    CLUB_CREATION: 2.0       // 创建一个俱乐部
  }
} as const;

// 导出所有配置
export const SYSTEM_CONSTANTS = {
  CLUB_CREATION_PERMISSION,
  USER_RATING
} as const; 