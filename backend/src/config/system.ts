/**
 * 系统配置文件
 * 
 * 配置说明：
 * 1. 所有配置项都可以通过环境变量覆盖
 * 2. 敏感信息（如密码、密钥等）必须通过环境变量配置
 * 3. 开发环境可以使用默认值，生产环境必须配置所有必要的环境变量
 * 
 * 环境变量配置示例：
 * PORT=3000
 * API_PORT=5001
 * NODE_ENV=development
 * MONGODB_URI=mongodb://localhost:27017/wildpals
 * JWT_SECRET=your-jwt-secret-key
 * JWT_REFRESH_SECRET=your-jwt-refresh-secret-key
 * EMAIL_FROM_ADDRESS=noreply@wildpals.com
 * EMAIL_FROM_NAME=WildPals Support
 * SMTP_HOST=smtp.gmail.com
 * SMTP_PORT=587
 * SMTP_USER=your-smtp-user
 * SMTP_PASS=your-smtp-password
 * PASSWORD_RESET_BASE_URL=http://localhost:3000/reset-password
 * PASSWORD_RESET_PORT=3000
 * PASSWORD_RESET_SUCCESS_URL=http://localhost:3000/reset-success
 * PASSWORD_RESET_ERROR_URL=http://localhost:3000/reset-error
 * CLUB_CREATION_THRESHOLD=100
 */

// 系统配置
export const SYSTEM_CONFIG = {
  // 服务器配置
  SERVER: {
    // 主服务端口
    PORT: process.env.PORT || 3000,
    // API服务端口
    API_PORT: process.env.API_PORT || 5002,
    NODE_ENV: process.env.NODE_ENV || 'development'
  },

  // 数据库配置
  DATABASE: {
    URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/wildpals'
  },

  // JWT配置
  JWT: {
    SECRET: process.env.JWT_SECRET || 'your-jwt-secret-key',
    REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your-jwt-refresh-secret-key'
  },

  // 邮件配置
  EMAIL: {
    FROM: {
      ADDRESS: process.env.EMAIL_FROM_ADDRESS || 'l.tao0866@gmail.com',
      NAME: process.env.EMAIL_FROM_NAME || 'ride_app Support'
    },
    SMTP: {
      HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
      PORT: parseInt(process.env.SMTP_PORT || '587'),
      USER: process.env.SMTP_USER,
      PASS: process.env.SMTP_PASS
    }
  },

  // 密码重置配置
  PASSWORD_RESET: {
    // 重置服务配置
    SERVICE: {
      // 重置服务端口（使用3000，与主服务共用端口）
      PORT: process.env.PASSWORD_RESET_PORT || 3000,
      
      // 重置服务基础路径
      BASE_PATH: '/reset',
      
      // 重置成功页面URL
      SUCCESS_URL: process.env.PASSWORD_RESET_SUCCESS_URL || 'http://localhost:3000/reset-success',
      
      // 重置失败页面URL
      ERROR_URL: process.env.PASSWORD_RESET_ERROR_URL || 'http://localhost:3000/reset-error'
    },
    
    // 重置链接基础URL
    BASE_URL: process.env.PASSWORD_RESET_BASE_URL || 'http://localhost:3000/reset-password',
    
    // 重置令牌过期时间（小时）
    EXPIRY_HOURS: 24
  },

  // 其他配置
  CLUB: {
    // 创建俱乐部所需的最低评分
    CREATION_THRESHOLD: parseInt(process.env.CLUB_CREATION_THRESHOLD || '100')
  }
}; 