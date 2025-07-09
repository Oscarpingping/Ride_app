#!/bin/bash

# 后端构建和部署文件生成脚本

set -e

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🔨 Building Wildpals Backend...${NC}"

# 1. 检查后端目录
echo -e "${YELLOW}📋 Checking backend directory...${NC}"
if [ ! -d "backend" ]; then
    echo -e "${RED}❌ Backend directory not found!${NC}"
    exit 1
fi

cd backend

# 2. 检查TypeScript配置
echo -e "${YELLOW}📋 Checking TypeScript configuration...${NC}"
if [ ! -f "tsconfig.json" ]; then
    echo -e "${RED}❌ tsconfig.json not found!${NC}"
    exit 1
fi

# 3. 安装依赖
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install

# 4. 清理之前的构建
echo -e "${YELLOW}🧹 Cleaning previous build...${NC}"
rm -rf dist/
rm -rf node_modules/.cache

# 5. 构建TypeScript代码
echo -e "${YELLOW}🔨 Building TypeScript code...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ TypeScript build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ TypeScript build completed!${NC}"

# 6. 检查构建结果
echo -e "${YELLOW}📋 Build results:${NC}"
if [ -d "dist" ]; then
    echo "Dist directory structure:"
    find dist -type f -name "*.js" | head -20
    
    echo ""
    echo "Build size:"
    du -sh dist/
    
    # 检查关键文件
    if [ -f "dist/backend/src/app.js" ]; then
        echo -e "${GREEN}✅ Main app file found: dist/backend/src/app.js${NC}"
    else
        echo -e "${RED}❌ Main app file not found!${NC}"
        echo "Available files:"
        find dist -name "app.js" -o -name "app.ts"
        exit 1
    fi
else
    echo -e "${RED}❌ Dist directory not created!${NC}"
    exit 1
fi

# 7. 创建环境变量文件
echo -e "${YELLOW}📝 Creating environment file...${NC}"
if [ -f ".env_back" ]; then
    cp .env_back .env
    echo -e "${GREEN}✅ Environment file created from .env_back${NC}"
else
    # 创建默认环境变量文件
    cat > .env << 'ENVFILE'
# Database Configuration
MONGODB_URI=mongodb://wildpals_user:wildpals_password_2024@localhost:27017/wildpals?authSource=wildpals

# Server Configuration
PORT=3000
NODE_ENV=production

# JWT Configuration
JWT_SECRET=your_jwt_secret_here_change_this_in_production
JWT_EXPIRES_IN=7d

# File Upload Configuration
UPLOAD_PATH=/home/ubuntu/wildpals-backend/uploads
MAX_FILE_SIZE=10485760

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://your-server-ip

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/wildpals/app.log
ENVFILE
    echo -e "${GREEN}✅ Default environment file created${NC}"
fi

# 8. 创建uploads目录
echo -e "${YELLOW}📁 Creating uploads directory...${NC}"
mkdir -p uploads
chmod 755 uploads

# 9. 创建部署包
echo -e "${YELLOW}📦 Creating deployment package...${NC}"
cd ..

# 创建部署目录
DEPLOY_DIR="backend-deploy-$(date +%Y%m%d_%H%M%S)"
mkdir -p $DEPLOY_DIR

# 复制必要文件
cp -r backend/dist $DEPLOY_DIR/
cp backend/package.json $DEPLOY_DIR/
cp backend/.env $DEPLOY_DIR/
cp -r backend/uploads $DEPLOY_DIR/

# 创建生产环境package.json
cat > $DEPLOY_DIR/package.json << 'PACKAGEJSON'
{
  "name": "wildpals-backend",
  "version": "1.0.0",
  "description": "Backend for WildPals cycling app",
  "main": "dist/backend/src/app.js",
  "scripts": {
    "start": "node dist/backend/src/app.js",
    "dev": "nodemon dist/backend/src/app.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "joi": "^17.13.3",
    "jsonwebtoken": "^9.0.0",
    "mongoose": "^7.0.3",
    "multer": "^1.4.5-lts.1",
    "nodemailer": "^7.0.3",
    "socket.io": "^4.8.1"
  }
}
PACKAGEJSON

# 10. 创建PM2配置文件
echo -e "${YELLOW}📋 Creating PM2 configuration...${NC}"
cat > $DEPLOY_DIR/ecosystem.config.js << 'PM2CONFIG'
module.exports = {
  apps: [
    {
      name: 'wildpals-backend',
      script: 'dist/backend/src/app.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/var/log/wildpals/backend-error.log',
      out_file: '/var/log/wildpals/backend-out.log',
      log_file: '/var/log/wildpals/backend-combined.log',
      time: true
    }
  ]
};
PM2CONFIG

# 11. 创建启动脚本
echo -e "${YELLOW}📝 Creating startup script...${NC}"
cat > $DEPLOY_DIR/start.sh << 'STARTSCRIPT'
#!/bin/bash

echo "🚀 Starting Wildpals Backend..."

# 检查环境变量
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    exit 1
fi

# 检查主文件
if [ ! -f "dist/backend/src/app.js" ]; then
    echo "❌ Main app file not found!"
    exit 1
fi

# 创建日志目录
sudo mkdir -p /var/log/wildpals
sudo chown ubuntu:ubuntu /var/log/wildpals

# 启动应用
echo "✅ Starting application..."
node dist/backend/src/app.js
STARTSCRIPT

chmod +x $DEPLOY_DIR/start.sh

# 12. 创建部署说明
echo -e "${YELLOW}📖 Creating deployment instructions...${NC}"
cat > $DEPLOY_DIR/DEPLOYMENT.md << 'DEPLOYMENT'
# Wildpals Backend Deployment

## 文件说明
- `dist/` - 编译后的JavaScript文件
- `package.json` - 生产环境依赖配置
- `.env` - 环境变量配置
- `uploads/` - 文件上传目录
- `ecosystem.config.js` - PM2配置文件
- `start.sh` - 启动脚本

## 部署步骤

### 1. 上传到服务器
```bash
scp -r backend-deploy-* ubuntu@your-server:/home/ubuntu/
```

### 2. 在服务器上部署
```bash
# 进入部署目录
cd /home/ubuntu/backend-deploy-*

# 安装依赖
npm install --production

# 使用PM2启动
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 或者直接启动
./start.sh
```

### 3. 验证部署
```bash
# 检查服务状态
pm2 status

# 测试API
curl http://localhost:3000/health

# 查看日志
pm2 logs wildpals-backend
```

## 环境变量配置
请根据你的环境修改 `.env` 文件中的配置：
- `MONGODB_URI` - MongoDB连接字符串
- `JWT_SECRET` - JWT密钥
- `PORT` - 服务端口
- `CORS_ORIGIN` - 允许的跨域来源

## 故障排除
1. 检查日志：`pm2 logs wildpals-backend`
2. 检查端口：`netstat -tlnp | grep :3000`
3. 检查MongoDB：`sudo systemctl status mongod`
4. 重启服务：`pm2 restart wildpals-backend`
DEPLOYMENT

# 13. 创建压缩包
echo -e "${YELLOW}📦 Creating deployment archive...${NC}"
tar -czf "${DEPLOY_DIR}.tar.gz" $DEPLOY_DIR

# 14. 显示结果
echo -e "${GREEN}🎉 Backend build and packaging completed!${NC}"
echo -e "${YELLOW}📋 Results:${NC}"
echo -e "   Deployment directory: $DEPLOY_DIR"
echo -e "   Archive file: ${DEPLOY_DIR}.tar.gz"
echo -e "   Build size: $(du -sh $DEPLOY_DIR)"
echo -e ""
echo -e "${YELLOW}📁 Deployment package contents:${NC}"
ls -la $DEPLOY_DIR/
echo -e ""
echo -e "${YELLOW}📋 Next steps:${NC}"
echo -e "1. Upload to server: scp ${DEPLOY_DIR}.tar.gz ubuntu@your-server:/home/ubuntu/"
echo -e "2. Extract on server: tar -xzf ${DEPLOY_DIR}.tar.gz"
echo -e "3. Deploy: cd $DEPLOY_DIR && npm install && pm2 start ecosystem.config.js"
echo -e ""
echo -e "${YELLOW}🔧 Quick deployment:${NC}"
echo -e "   ./deploy-backend.sh your-server-ip" 