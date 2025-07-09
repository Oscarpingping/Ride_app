#!/bin/bash

# 修复部署问题的脚本

set -e

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🔧 Fixing deployment issues...${NC}"

# 1. 检查当前状态
echo -e "${YELLOW}📋 Checking current status...${NC}"
echo "Current directory: $(pwd)"
echo "Frontend dist exists: $([ -d "dist" ] && echo "Yes" || echo "No")"
echo "Backend exists: $([ -d "backend" ] && echo "Yes" || echo "No")"

# 2. 构建后端
echo -e "${YELLOW}🔨 Building backend...${NC}"
if [ -d "backend" ]; then
    cd backend
    npm install
    npm run build
    cd ..
    echo -e "${GREEN}✅ Backend build completed${NC}"
else
    echo -e "${RED}❌ Backend directory not found!${NC}"
    exit 1
fi

# 3. 创建正确的目录结构
echo -e "${YELLOW}📁 Creating correct directory structure...${NC}"

# 创建后端部署目录
mkdir -p /home/ubuntu/wildpals-backend

# 复制后端文件
cp -r backend/dist /home/ubuntu/wildpals-backend/
cp backend/package.json /home/ubuntu/wildpals-backend/
cp backend/.env_back /home/ubuntu/wildpals-backend/.env

# 安装后端依赖
cd /home/ubuntu/wildpals-backend
npm install --production
cd /home/ubuntu/wildpals

echo -e "${GREEN}✅ Backend files prepared${NC}"

# 4. 检查后端文件
echo -e "${YELLOW}🔍 Checking backend files...${NC}"
if [ -f "/home/ubuntu/wildpals-backend/dist/backend/src/app.js" ]; then
    echo -e "${GREEN}✅ Backend app.js found${NC}"
else
    echo -e "${RED}❌ Backend app.js not found!${NC}"
    echo "Available files in backend dist:"
    find /home/ubuntu/wildpals-backend/dist -name "*.js" | head -10
    exit 1
fi

# 5. 创建正确的PM2配置
echo -e "${YELLOW}📋 Creating correct PM2 configuration...${NC}"
cat > /home/ubuntu/ecosystem-fixed.config.js << 'PM2CONFIG'
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

# 6. 停止之前的进程
echo -e "${YELLOW}🛑 Stopping previous processes...${NC}"
pm2 delete wildpals-backend 2>/dev/null || true
pm2 delete wildpals-expo 2>/dev/null || true
pm2 delete wildpals-web 2>/dev/null || true

# 7. 启动后端服务
echo -e "${YELLOW}🚀 Starting backend service...${NC}"
cd /home/ubuntu
pm2 start ecosystem-fixed.config.js
pm2 save

# 8. 配置Nginx（如果还没有配置）
echo -e "${YELLOW}🌐 Configuring Nginx...${NC}"

# 检查Nginx是否已配置
if [ ! -f "/etc/nginx/sites-enabled/wildpals-web" ]; then
    echo "Configuring Nginx..."
    
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
    
    # 日志配置
    access_log /var/log/nginx/wildpals_web_access.log;
    error_log /var/log/nginx/wildpals_web_error.log;
}
NGINXCONFIG

    # 启用配置
    sudo ln -sf /etc/nginx/sites-available/wildpals-web /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # 测试配置
    sudo nginx -t
    
    # 重启Nginx
    sudo systemctl restart nginx
    sudo systemctl enable nginx
    
    echo -e "${GREEN}✅ Nginx configured${NC}"
else
    echo -e "${GREEN}✅ Nginx already configured${NC}"
fi

# 9. 部署前端文件（如果还没有部署）
echo -e "${YELLOW}📁 Deploying frontend files...${NC}"
if [ -d "/home/ubuntu/wildpals/dist" ]; then
    sudo cp -r /home/ubuntu/wildpals/dist/* /var/www/html/
    sudo chown -R www-data:www-data /var/www/html/
    sudo chmod -R 755 /var/www/html/
    echo -e "${GREEN}✅ Frontend files deployed${NC}"
else
    echo -e "${RED}❌ Frontend dist not found!${NC}"
    exit 1
fi

# 10. 检查服务状态
echo -e "${YELLOW}🔍 Checking service status...${NC}"
echo "=== PM2 Status ==="
pm2 status

echo "=== Nginx Status ==="
sudo systemctl status nginx --no-pager

echo "=== Port Status ==="
sudo netstat -tlnp | grep -E ':(80|3000)'

echo "=== Backend Files ==="
ls -la /home/ubuntu/wildpals-backend/dist/backend/src/

# 11. 测试API
echo -e "${YELLOW}🧪 Testing API...${NC}"
sleep 3
if curl -s http://localhost:3000/health > /dev/null; then
    echo -e "${GREEN}✅ Backend API is running${NC}"
else
    echo -e "${RED}❌ Backend API is not responding${NC}"
    echo "Checking backend logs..."
    pm2 logs wildpals-backend --lines 10
fi

# 12. 获取服务器IP
SERVER_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || hostname -I | awk '{print $1}')

echo -e "${GREEN}🎉 Deployment fix completed!${NC}"
echo -e "${GREEN}🌍 Your web app is available at: http://$SERVER_IP${NC}"
echo -e "${GREEN}🔧 Backend API: http://$SERVER_IP/api${NC}"
echo -e "${GREEN}🏥 Health check: http://$SERVER_IP/health${NC}"
echo -e ""
echo -e "${YELLOW}📋 Management commands:${NC}"
echo -e "   View logs: pm2 logs wildpals-backend"
echo -e "   Restart: pm2 restart wildpals-backend"
echo -e "   Status: pm2 status"
echo -e "   Nginx logs: sudo tail -f /var/log/nginx/wildpals_web_error.log" 