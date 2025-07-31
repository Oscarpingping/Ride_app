# WildPals 环境变量配置指南

## 前端环境变量配置

### 必需配置
```bash
# API配置
API_BASE_URL=http://localhost:5001/api  # 开发环境
# API_BASE_URL=https://api.your-domain.com/api  # 生产环境

# 地图服务配置
MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
```

## 后端环境变量配置

### 1. 服务器配置
```bash
# 服务器端口配置
PORT=3000                    # 主服务端口
API_PORT=5001               # API服务端口
NODE_ENV=development        # 运行环境 (development/production)
```

### 2. 数据库配置
```bash
# MongoDB配置
MONGODB_URI=mongodb://localhost:27017/wildpals  # 开发环境
# MONGODB_URI=mongodb://user:password@your-mongodb-host:27017/wildpals  # 生产环境
```

### 3. JWT配置
```bash
# JWT密钥配置
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
```

### 4. 邮件服务配置
```bash
# 邮件服务配置
EMAIL_FROM_ADDRESS=noreply@wildpals.com
EMAIL_FROM_NAME=WildPals Support
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
```

### 5. 密码重置配置
```bash
# 密码重置URL配置
PASSWORD_RESET_BASE_URL=http://localhost:3000/reset-password
PASSWORD_RESET_PORT=3000
PASSWORD_RESET_SUCCESS_URL=http://localhost:3000/reset-success
PASSWORD_RESET_ERROR_URL=http://localhost:3000/reset-error
```

### 6. 其他配置
```bash
# 俱乐部配置
CLUB_CREATION_THRESHOLD=100  # 创建俱乐部所需的最低评分
```

## 配置说明

### 开发环境
1. 复制上述配置到 `.env.development` 文件
2. 使用默认值或本地开发配置
3. 确保MongoDB本地服务已启动

### 生产环境
1. 复制上述配置到 `.env.production` 文件
2. 修改所有默认值为生产环境实际值
3. 使用强密码和安全的密钥
4. 配置正确的生产环境URL和端口

## 安全注意事项

### 重要提醒
- ⚠️ 不要将包含实际值的 `.env` 文件提交到版本控制系统
- ⚠️ 生产环境必须更改所有默认密码和密钥
- ⚠️ 定期轮换密钥和密码
- ⚠️ 使用HTTPS保护API通信

### 敏感信息保护
- 🔒 JWT密钥必须使用强密码
- 🔒 数据库密码必须使用强密码
- 🔒 SMTP密码必须使用应用专用密码
- 🔒 所有API密钥必须妥善保管

## 配置检查清单

### 开发环境
- [ ] MongoDB本地服务已启动
- [ ] 所有必需的环境变量已配置
- [ ] API端口未被占用
- [ ] 邮件服务配置正确

### 生产环境
- [ ] 所有默认密码已更改
- [ ] 使用HTTPS
- [ ] 数据库连接使用强密码
- [ ] 邮件服务使用安全的SMTP配置
- [ ] 所有URL使用生产环境域名

## 技术支持

如果遇到配置问题，请检查：
1. 环境变量文件格式是否正确
2. 所有必需的环境变量是否都已配置
3. 端口是否被占用
4. 数据库连接是否正常
5. 邮件服务配置是否正确

---
*最后更新: 2024-03-21* 