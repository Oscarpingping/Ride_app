#!/bin/bash

# Web构建和部署脚本

set -e

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🌐 Building Wildpals for Web...${NC}"

# 1. 检查环境
echo -e "${YELLOW}📋 Checking environment...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found!${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environment check passed${NC}"

# 2. 安装依赖
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install

# 3. 清理之前的构建
echo -e "${YELLOW}🧹 Cleaning previous build...${NC}"
rm -rf dist/
rm -rf .expo/

# 4. 构建Web版本
echo -e "${YELLOW}🔨 Building web version...${NC}"
npx expo export --platform web

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Web build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Web build completed!${NC}"

# 5. 检查构建结果
echo -e "${YELLOW}📋 Build results:${NC}"
ls -la dist/
echo ""
echo "Build size:"
du -sh dist/

# 6. 创建部署配置
echo -e "${YELLOW}📝 Creating deployment configuration...${NC}"
cat > dist/nginx.conf << 'NGINXCONFIG'
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

# 7. 创建启动脚本
echo -e "${YELLOW}📝 Creating startup script...${NC}"
cat > start-web.sh << 'STARTSCRIPT'
#!/bin/bash

echo "🌐 Starting Wildpals Web Server..."

# 检查dist目录
if [ ! -d "dist" ]; then
    echo "❌ dist directory not found. Please run build-web.sh first."
    exit 1
fi

# 启动本地web服务器（用于测试）
echo "🚀 Starting local web server on http://localhost:8080"
echo "📱 Open your browser and navigate to: http://localhost:8080"
echo "🛑 Press Ctrl+C to stop the server"
echo ""

# 使用Python或Node.js启动本地服务器
if command -v python3 &> /dev/null; then
    cd dist && python3 -m http.server 8080
elif command -v python &> /dev/null; then
    cd dist && python -m SimpleHTTPServer 8080
elif command -v npx &> /dev/null; then
    cd dist && npx serve -s . -l 8080
else
    echo "❌ No suitable web server found. Please install Python or Node.js."
    exit 1
fi
STARTSCRIPT

chmod +x start-web.sh

# 8. 创建PM2配置
echo -e "${YELLOW}📋 Creating PM2 configuration...${NC}"
cat > ecosystem-web.config.js << 'PM2CONFIG'
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
    },
    {
      name: 'wildpals-web',
      script: 'npx',
      args: 'serve -s dist -l 8080',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production'
      },
      cwd: '/home/ubuntu/wildpals'
    }
  ]
};
PM2CONFIG

echo -e "${GREEN}🎉 Web build and configuration completed!${NC}"
echo -e "${YELLOW}📋 Next steps:${NC}"
echo -e "1. Test locally: ./start-web.sh"
echo -e "2. Deploy to server: ./deploy-web.sh"
echo -e "3. Use PM2: pm2 start ecosystem-web.config.js"
echo -e ""
echo -e "${YELLOW}🌐 Web app will be available at:${NC}"
echo -e "   Local: http://localhost:8080"
echo -e "   Server: http://your-server-ip"
echo -e ""
echo -e "${YELLOW}📁 Build files location:${NC}"
echo -e "   dist/ - Web build files"
echo -e "   dist/nginx.conf - Nginx configuration" 