#!/bin/bash

# AWS服务器初始化脚本
# 在Ubuntu服务器上运行此脚本来安装所有必要的软件

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting AWS Server Setup for Wildpals...${NC}"

# 更新系统
echo -e "${YELLOW}📦 Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y

# 安装基础工具
echo -e "${YELLOW}🔧 Installing basic tools...${NC}"
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# 安装Node.js 18.x
echo -e "${YELLOW}📦 Installing Node.js 18.x...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证Node.js安装
echo -e "${GREEN}✅ Node.js version: $(node --version)${NC}"
echo -e "${GREEN}✅ npm version: $(npm --version)${NC}"

# 安装PM2进程管理器
echo -e "${YELLOW}📦 Installing PM2...${NC}"
sudo npm install -g pm2

# 安装Nginx
echo -e "${YELLOW}🌐 Installing Nginx...${NC}"
sudo apt install nginx -y

# 安装MongoDB 7.0
echo -e "${YELLOW}🗄️ Installing MongoDB 7.0...${NC}"

# 导入MongoDB公钥
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# 添加MongoDB仓库
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# 更新包列表并安装MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# 启动并启用MongoDB
echo -e "${YELLOW}🚀 Starting MongoDB...${NC}"
sudo systemctl start mongod
sudo systemctl enable mongod

# 验证MongoDB状态
echo -e "${GREEN}✅ MongoDB status:${NC}"
sudo systemctl status mongod --no-pager

# 配置MongoDB安全设置
echo -e "${YELLOW}🔒 Configuring MongoDB security...${NC}"

# 创建MongoDB管理员用户
sudo tee /tmp/mongo-setup.js << 'MONGOJS'
use admin
db.createUser({
  user: "admin",
  pwd: "wildpals_admin_2024",
  roles: [
    { role: "userAdminAnyDatabase", db: "admin" },
    { role: "readWriteAnyDatabase", db: "admin" },
    { role: "dbAdminAnyDatabase", db: "admin" }
  ]
})

use wildpals
db.createUser({
  user: "wildpals_user",
  pwd: "wildpals_password_2024",
  roles: [
    { role: "readWrite", db: "wildpals" }
  ]
})
MONGOJS

# 运行MongoDB设置脚本
mongosh --file /tmp/mongo-setup.js

# 配置MongoDB认证
sudo tee -a /etc/mongod.conf << 'MONGOAUTH'

security:
  authorization: enabled
MONGOAUTH

# 重启MongoDB以应用认证设置
sudo systemctl restart mongod

# 配置防火墙
echo -e "${YELLOW}🔥 Configuring firewall...${NC}"
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw --force enable

# 创建应用目录
echo -e "${YELLOW}📁 Creating application directories...${NC}"
mkdir -p /home/ubuntu/wildpals
mkdir -p /home/ubuntu/wildpals-backend
mkdir -p /home/ubuntu/wildpals-backend/uploads
mkdir -p /var/www/html

# 设置目录权限
sudo chown -R ubuntu:ubuntu /home/ubuntu/wildpals*
sudo chmod -R 755 /home/ubuntu/wildpals*

# 配置Nginx
echo -e "${YELLOW}🌐 Configuring Nginx...${NC}"

# 备份默认配置
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup

# 创建Wildpals Nginx配置
sudo tee /etc/nginx/sites-available/wildpals << 'NGINXCONFIG'
server {
    listen 80;
    server_name _;
    
    # 前端静态文件
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }
    
    # 后端API代理
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
    access_log /var/log/nginx/wildpals_access.log;
    error_log /var/log/nginx/wildpals_error.log;
}
NGINXCONFIG

# 启用Wildpals配置
sudo ln -sf /etc/nginx/sites-available/wildpals /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# 测试Nginx配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

# 创建PM2启动脚本
echo -e "${YELLOW}📋 Creating PM2 startup script...${NC}"
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu

# 创建日志目录
sudo mkdir -p /var/log/wildpals
sudo chown ubuntu:ubuntu /var/log/wildpals

# 创建环境变量文件模板
echo -e "${YELLOW}📝 Creating environment file template...${NC}"
cat > /home/ubuntu/wildpals-backend/.env.template << 'ENVTEMPLATE'
# Database Configuration
MONGODB_URI=mongodb://wildpals_user:wildpals_password_2024@localhost:27017/wildpals?authSource=wildpals

# Server Configuration
PORT=3000
NODE_ENV=production

# JWT Configuration
JWT_SECRET=your_jwt_secret_here_change_this_in_production
JWT_EXPIRES_IN=7d

# Email Configuration (if needed)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password

# File Upload Configuration
UPLOAD_PATH=/home/ubuntu/wildpals-backend/uploads
MAX_FILE_SIZE=10485760

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://your-domain.com

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/wildpals/app.log
ENVTEMPLATE

# 创建监控脚本
echo -e "${YELLOW}📊 Creating monitoring script...${NC}"
cat > /home/ubuntu/monitor.sh << 'MONITORSCRIPT'
#!/bin/bash

echo "=== System Status ==="
echo "Date: $(date)"
echo "Uptime: $(uptime)"
echo "Memory: $(free -h | grep Mem)"
echo "Disk: $(df -h / | tail -1)"

echo -e "\n=== Service Status ==="
echo "MongoDB: $(systemctl is-active mongod)"
echo "Nginx: $(systemctl is-active nginx)"
echo "PM2: $(pm2 ping 2>/dev/null && echo 'Running' || echo 'Not running')"

echo -e "\n=== Port Status ==="
netstat -tlnp | grep -E ':(80|3000|27017)' || echo "No services listening on expected ports"

echo -e "\n=== PM2 Processes ==="
pm2 list

echo -e "\n=== Recent Logs ==="
tail -10 /var/log/nginx/wildpals_error.log 2>/dev/null || echo "No error logs found"
MONITORSCRIPT

chmod +x /home/ubuntu/monitor.sh

# 创建备份脚本
echo -e "${YELLOW}💾 Creating backup script...${NC}"
cat > /home/ubuntu/backup.sh << 'BACKUPSCRIPT'
#!/bin/bash

BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# 备份MongoDB
echo "Backing up MongoDB..."
mongodump --uri="mongodb://wildpals_user:wildpals_password_2024@localhost:27017/wildpals?authSource=wildpals" --out="$BACKUP_DIR/mongodb_$DATE"

# 备份应用文件
echo "Backing up application files..."
tar -czf "$BACKUP_DIR/app_$DATE.tar.gz" /home/ubuntu/wildpals /home/ubuntu/wildpals-backend

# 清理旧备份（保留最近7天）
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "mongodb_*" -mtime +7 -exec rm -rf {} \;

echo "Backup completed: $BACKUP_DIR"
BACKUPSCRIPT

chmod +x /home/ubuntu/backup.sh

# 设置定时任务
echo -e "${YELLOW}⏰ Setting up cron jobs...${NC}"
(crontab -l 2>/dev/null; echo "0 2 * * * /home/ubuntu/backup.sh") | crontab -
(crontab -l 2>/dev/null; echo "*/5 * * * * /home/ubuntu/monitor.sh > /var/log/wildpals/monitor.log 2>&1") | crontab -

# 最终状态检查
echo -e "${GREEN}🔍 Final status check...${NC}"
echo "=== Service Status ==="
sudo systemctl status mongod --no-pager | head -5
sudo systemctl status nginx --no-pager | head -5

echo -e "\n=== Port Status ==="
sudo netstat -tlnp | grep -E ':(80|3000|27017)' || echo "No services listening on expected ports"

echo -e "\n=== Directory Structure ==="
ls -la /home/ubuntu/
ls -la /var/www/html/

echo -e "${GREEN}🎉 Server setup completed successfully!${NC}"
echo -e "${BLUE}📋 Next steps:${NC}"
echo -e "1. Copy your application files to the server"
echo -e "2. Update the .env file with your configuration"
echo -e "3. Run the deployment script from your local machine"
echo -e "4. Monitor the application using: /home/ubuntu/monitor.sh"
echo -e "5. Set up SSL certificate for HTTPS (recommended)"
echo -e ""
echo -e "${YELLOW}🔑 MongoDB credentials:${NC}"
echo -e "Admin: admin / wildpals_admin_2024"
echo -e "App: wildpals_user / wildpals_password_2024"
echo -e ""
echo -e "${YELLOW}📁 Important directories:${NC}"
echo -e "App: /home/ubuntu/wildpals"
echo -e "Backend: /home/ubuntu/wildpals-backend"
echo -e "Web root: /var/www/html"
echo -e "Logs: /var/log/wildpals"
echo -e "Backups: /home/ubuntu/backups" 