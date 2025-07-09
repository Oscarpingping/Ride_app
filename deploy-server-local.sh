#!/bin/bash

# 服务器本地部署脚本（在AWS服务器上运行）

set -e

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🚀 Starting local server deployment...${NC}"

# 1. 检查当前目录
echo -e "${YELLOW}📋 Current directory: $(pwd)${NC}"
if [[ ! -f "package.json" ]]; then
    echo -e "${RED}❌ Not in project root directory!${NC}"
    exit 1
fi

# 2. 构建Web版本
echo -e "${YELLOW}🔨 Building web version...${NC}"
npx expo export --platform web

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Web build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Web build completed!${NC}"

# 3. 检查构建结果
echo -e "${YELLOW}📋 Build results:${NC}"
ls -la dist/
echo ""
echo "Build size:"
du -sh dist/

# 4. 配置Nginx
echo -e "${YELLOW}🌐 Configuring Nginx...${NC}"

# 创建Nginx配置
sudo tee /etc/nginx/sites-available/wildpals-web << 'NGINXCONFIG'
server {
    listen 80;
    server_name _;
    
    root /var/www/html;
    index index.html;
    
    # 处理单页应用路由
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin *;
    }
    
    # API代理
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # 文件上传
    location /uploads/ {
        alias /home/ubuntu/wildpals-backend/uploads/;
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
        add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range";
    }
    
    # 健康检查
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # 日志配置
    access_log /var/log/nginx/wildpals_web_access.log;
    error_log /var/log/nginx/wildpals_web_error.log;
}
NGINXCONFIG

# 启用新配置
sudo ln -sf /etc/nginx/sites-available/wildpals-web /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# 测试Nginx配置
sudo nginx -t

# 5. 部署Web文件
echo -e "${YELLOW}📁 Deploying web files...${NC}"
sudo cp -r dist/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html/
sudo chmod -R 755 /var/www/html/

# 6. 重启Nginx
echo -e "${YELLOW}🔄 Restarting Nginx...${NC}"
sudo systemctl restart nginx
sudo systemctl enable nginx

# 7. 启动后端服务
echo -e "${YELLOW}🔧 Starting backend service...${NC}"

# 检查后端目录
if [ ! -d "backend" ]; then
    echo -e "${RED}❌ Backend directory not found!${NC}"
    exit 1
fi

# 构建后端
cd backend
npm install
npm run build
cd ..

# 创建后端目录
mkdir -p /home/ubuntu/wildpals-backend
cp -r backend/dist /home/ubuntu/wildpals-backend/
cp backend/package.json /home/ubuntu/wildpals-backend/
cp backend/.env_back /home/ubuntu/wildpals-backend/.env

# 安装后端依赖
cd /home/ubuntu/wildpals-backend
npm install --production

# 8. 配置PM2
echo -e "${YELLOW}📋 Configuring PM2...${NC}"

# 创建PM2配置
cat > /home/ubuntu/ecosystem-server.config.js << 'PM2CONFIG'
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
      cwd: '/home/ubuntu/wildpals-backend'
    }
  ]
};
PM2CONFIG

# 启动服务
cd /home/ubuntu
pm2 delete wildpals-backend 2>/dev/null || true
pm2 start ecosystem-server.config.js
pm2 save
pm2 startup

# 9. 检查服务状态
echo -e "${YELLOW}🔍 Checking service status...${NC}"
echo "=== PM2 Status ==="
pm2 status

echo "=== Nginx Status ==="
sudo systemctl status nginx --no-pager

echo "=== Port Status ==="
sudo netstat -tlnp | grep -E ':(80|3000)'

echo "=== Web Files ==="
ls -la /var/www/html/ | head -10

# 10. 获取服务器IP
SERVER_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || hostname -I | awk '{print $1}')

echo -e "${GREEN}🎉 Local deployment completed successfully!${NC}"
echo -e "${GREEN}🌍 Your web app is available at: http://$SERVER_IP${NC}"
echo -e "${GREEN}🔧 Backend API: http://$SERVER_IP/api${NC}"
echo -e "${YELLOW}📋 To view logs:${NC}"
echo -e "   Backend: pm2 logs wildpals-backend"
echo -e "   Nginx: sudo tail -f /var/log/nginx/wildpals_web_error.log"
echo -e ""
echo -e "${YELLOW}🔧 Management commands:${NC}"
echo -e "   Restart backend: pm2 restart wildpals-backend"
echo -e "   Restart nginx: sudo systemctl restart nginx"
echo -e "   View status: pm2 status" 