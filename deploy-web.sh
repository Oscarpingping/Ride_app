#!/bin/bash

# Web部署到服务器脚本

set -e

# 配置变量
SERVER_IP=${1:-"3.139.190.107"}
SERVER_USER=${2:-"ubuntu"}
SERVER_PATH="/home/ubuntu/wildpals"
NGINX_PATH="/var/www/html"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🌐 Starting Wildpals Web Deployment...${NC}"

# 1. 构建Web版本
echo -e "${YELLOW}🔨 Building web version...${NC}"
./build-web.sh

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Web build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Web build completed!${NC}"

# 2. 上传到服务器
echo -e "${YELLOW}📤 Uploading web files to server...${NC}"
rsync -avz --delete dist/ $SERVER_USER@$SERVER_IP:$SERVER_PATH/dist/

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Upload failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Upload completed!${NC}"

# 3. 在服务器上配置Nginx
echo -e "${YELLOW}🌐 Configuring Nginx on server...${NC}"
ssh $SERVER_USER@$SERVER_IP << EOF
    # 备份原配置
    sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup
    
    # 复制新的Nginx配置
    sudo cp $SERVER_PATH/dist/nginx.conf /etc/nginx/sites-available/wildpals-web
    
    # 启用新配置
    sudo ln -sf /etc/nginx/sites-available/wildpals-web /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # 测试配置
    sudo nginx -t
    
    # 部署Web文件到Nginx根目录
    sudo cp -r $SERVER_PATH/dist/* $NGINX_PATH/
    sudo chown -R www-data:www-data $NGINX_PATH/
    sudo chmod -R 755 $NGINX_PATH/
    
    # 重启Nginx
    sudo systemctl restart nginx
    sudo systemctl enable nginx
EOF

# 4. 启动后端服务
echo -e "${YELLOW}🔧 Starting backend service...${NC}"
ssh $SERVER_USER@$SERVER_IP << EOF
    cd $SERVER_PATH
    
    # 安装serve包（如果不存在）
    npm install -g serve
    
    # 停止之前的服务
    pm2 delete wildpals-backend wildpals-web 2>/dev/null || true
    
    # 启动服务
    pm2 start ecosystem-web.config.js
    pm2 save
    pm2 startup
EOF

# 5. 检查服务状态
echo -e "${YELLOW}🔍 Checking service status...${NC}"
ssh $SERVER_USER@$SERVER_IP << EOF
    echo "=== PM2 Status ==="
    pm2 status
    
    echo "=== Nginx Status ==="
    sudo systemctl status nginx --no-pager
    
    echo "=== Port Status ==="
    sudo netstat -tlnp | grep -E ':(80|3000|8080)'
    
    echo "=== Web Files ==="
    ls -la $NGINX_PATH/ | head -10
EOF

echo -e "${GREEN}🎉 Web deployment completed successfully!${NC}"
echo -e "${GREEN}🌍 Your web app is available at: http://$SERVER_IP${NC}"
echo -e "${GREEN}🔧 Backend API: http://$SERVER_IP/api${NC}"
echo -e "${YELLOW}📋 To view logs:${NC}"
echo -e "   Web: ssh $SERVER_USER@$SERVER_IP 'pm2 logs wildpals-web'"
echo -e "   Backend: ssh $SERVER_USER@$SERVER_IP 'pm2 logs wildpals-backend'"
echo -e "   Nginx: ssh $SERVER_USER@$SERVER_IP 'sudo tail -f /var/log/nginx/wildpals_web_error.log'" 