#!/bin/bash

# AWS服务器部署脚本
# 使用方法: ./deploy-aws.sh [server_ip] [username]

set -e

# 配置变量
SERVER_IP=${1:-"3.139.190.107"}
SERVER_USER=${2:-"ubuntu"}
SERVER_PATH="/home/ubuntu/wildpals"
BACKEND_PATH="/home/ubuntu/wildpals-backend"
NGINX_PATH="/var/www/html"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Wildpals AWS Deployment...${NC}"

# 检查本地环境
echo -e "${YELLOW}📋 Checking local environment...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found! Please install Node.js first.${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found! Please install npm first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Local environment check passed${NC}"

# 1. 安装前端依赖并构建
echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
npm install

echo -e "${YELLOW}🔨 Building web version...${NC}"
npx expo export --platform web

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Frontend build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Frontend build completed!${NC}"

# 2. 构建后端
echo -e "${YELLOW}🔨 Building backend...${NC}"
cd backend
npm install
npm run build
cd ..

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Backend build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Backend build completed!${NC}"

# 3. 创建服务器目录结构
echo -e "${YELLOW}📁 Creating server directory structure...${NC}"
ssh $SERVER_USER@$SERVER_IP << EOF
    mkdir -p $SERVER_PATH
    mkdir -p $BACKEND_PATH
    mkdir -p $BACKEND_PATH/dist
    mkdir -p $BACKEND_PATH/uploads
EOF

# 4. 上传前端文件
echo -e "${YELLOW}📤 Uploading frontend files...${NC}"
rsync -avz --delete dist/ $SERVER_USER@$SERVER_IP:$SERVER_PATH/dist/

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Frontend upload failed!${NC}"
    exit 1
fi

# 5. 上传后端文件
echo -e "${YELLOW}📤 Uploading backend files...${NC}"
rsync -avz --delete backend/dist/ $SERVER_USER@$SERVER_IP:$BACKEND_PATH/dist/
rsync -avz backend/package.json $SERVER_USER@$SERVER_IP:$BACKEND_PATH/
rsync -avz backend/.env_back $SERVER_USER@$SERVER_IP:$BACKEND_PATH/.env

# 上传PM2配置文件
rsync -avz ecosystem-expo.config.js $SERVER_USER@$SERVER_IP:$SERVER_PATH/

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Backend upload failed!${NC}"
    exit 1
fi

# 6. 在服务器上安装依赖并启动服务
echo -e "${YELLOW}🔧 Setting up services on server...${NC}"
ssh $SERVER_USER@$SERVER_IP << EOF
    # 安装后端依赖
    cd $BACKEND_PATH
    npm install --production
    
    # 安装前端依赖
    cd $SERVER_PATH
    npm install
    
    # 安装Expo CLI
    npm install -g @expo/cli
    
    # 上传PM2配置文件
    cp ecosystem-expo.config.js $SERVER_PATH/
    
    # 启动所有服务
    pm2 delete wildpals-backend wildpals-expo 2>/dev/null || true
    pm2 start $SERVER_PATH/ecosystem-expo.config.js
    pm2 save
    pm2 startup
EOF

# 7. 配置Nginx
echo -e "${YELLOW}🌐 Configuring Nginx...${NC}"
ssh $SERVER_USER@$SERVER_IP << EOF
    # 备份原配置
    sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup
    
    # 创建新的Nginx配置
    sudo tee /etc/nginx/sites-available/wildpals << 'NGINXCONFIG'
server {
    listen 80;
    server_name $SERVER_IP;
    
    # 前端静态文件
    location / {
        root /var/www/html;
        try_files \$uri \$uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
    
    # 后端API代理
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # 文件上传
    location /uploads/ {
        alias /home/ubuntu/wildpals-backend/uploads/;
    }
}
NGINXCONFIG
    
    # 启用新配置
    sudo ln -sf /etc/nginx/sites-available/wildpals /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # 测试配置
    sudo nginx -t
    
    # 重启Nginx
    sudo systemctl restart nginx
    sudo systemctl enable nginx
EOF

# 8. 部署前端到Nginx
echo -e "${YELLOW}🌐 Deploying frontend to Nginx...${NC}"
ssh $SERVER_USER@$SERVER_IP << EOF
    sudo cp -r $SERVER_PATH/dist/* $NGINX_PATH/
    sudo chown -R www-data:www-data $NGINX_PATH/
    sudo chmod -R 755 $NGINX_PATH/
EOF

# 9. 检查服务状态
echo -e "${YELLOW}🔍 Checking service status...${NC}"
ssh $SERVER_USER@$SERVER_IP << EOF
    echo "=== PM2 Status ==="
    pm2 status
    
    echo "=== Nginx Status ==="
    sudo systemctl status nginx --no-pager
    
    echo "=== MongoDB Status ==="
    sudo systemctl status mongod --no-pager
    
    echo "=== Port Status ==="
    sudo netstat -tlnp | grep -E ':(80|3000|27017)'
EOF

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${GREEN}🌍 Your app is available at: http://$SERVER_IP${NC}"
echo -e "${GREEN}🔧 Backend API: http://$SERVER_IP/api${NC}"
echo -e "${YELLOW}📋 To view logs: ssh $SERVER_USER@$SERVER_IP 'pm2 logs wildpals-backend'${NC}" 