#!/bin/bash

# MongoDB配置脚本
# 用于设置MongoDB用户、数据库和安全配置

set -e

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🚀 Starting MongoDB configuration...${NC}"

# 1. 启动MongoDB服务
echo -e "${YELLOW}📦 Starting MongoDB service...${NC}"
sudo systemctl start mongod
sudo systemctl enable mongod

# 等待MongoDB启动
sleep 5

# 2. 创建MongoDB配置脚本
echo -e "${YELLOW}📝 Creating MongoDB setup script...${NC}"
cat > /tmp/mongo-setup.js << 'MONGOJS'
// MongoDB配置脚本
use admin

// 创建管理员用户
db.createUser({
  user: "admin",
  pwd: "wildpals_admin_2024",
  roles: [
    { role: "userAdminAnyDatabase", db: "admin" },
    { role: "readWriteAnyDatabase", db: "admin" },
    { role: "dbAdminAnyDatabase", db: "admin" }
  ]
})

// 切换到wildpals数据库
use wildpals

// 创建应用用户
db.createUser({
  user: "wildpals_user",
  pwd: "wildpals_password_2024",
  roles: [
    { role: "readWrite", db: "wildpals" },
    { role: "dbAdmin", db: "wildpals" }
  ]
})

// 创建初始集合
db.createCollection("users")
db.createCollection("clubs")
db.createCollection("rides")
db.createCollection("messages")
db.createCollection("uploads")

// 创建索引
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "username": 1 }, { unique: true })
db.clubs.createIndex({ "name": 1 })
db.rides.createIndex({ "date": 1 })
db.rides.createIndex({ "location": "2dsphere" })
db.messages.createIndex({ "timestamp": 1 })

print("MongoDB setup completed successfully!")
print("Admin user: admin / wildpals_admin_2024")
print("App user: wildpals_user / wildpals_password_2024")
MONGOJS

# 3. 运行MongoDB配置脚本
echo -e "${YELLOW}🔧 Running MongoDB setup script...${NC}"
mongosh --file /tmp/mongo-setup.js

# 4. 配置MongoDB认证
echo -e "${YELLOW}🔒 Configuring MongoDB authentication...${NC}"

# 备份原配置
sudo cp /etc/mongod.conf /etc/mongod.conf.backup

# 添加认证配置
sudo tee -a /etc/mongod.conf << 'MONGOAUTH'

# Security configuration
security:
  authorization: enabled

# Network configuration
net:
  port: 27017
  bindIp: 127.0.0.1

# Storage configuration
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true

# Logging configuration
systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log

# Process management
processManagement:
  timeZoneInfo: /usr/share/zoneinfo
MONGOAUTH

# 5. 重启MongoDB以应用新配置
echo -e "${YELLOW}🔄 Restarting MongoDB with new configuration...${NC}"
sudo systemctl restart mongod

# 等待重启完成
sleep 5

# 6. 验证配置
echo -e "${YELLOW}🔍 Verifying configuration...${NC}"

# 测试管理员连接
echo "Testing admin connection..."
mongosh --uri="mongodb://admin:wildpals_admin_2024@localhost:27017/admin?authSource=admin" --eval "db.runCommand({ping: 1})"

# 测试应用用户连接
echo "Testing app user connection..."
mongosh --uri="mongodb://wildpals_user:wildpals_password_2024@localhost:27017/wildpals?authSource=wildpals" --eval "db.runCommand({ping: 1})"

# 7. 创建环境变量文件
echo -e "${YELLOW}📝 Creating environment file...${NC}"
cat > /home/ubuntu/wildpals-backend/.env << 'ENVFILE'
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

# 8. 设置目录权限
echo -e "${YELLOW}🔐 Setting directory permissions...${NC}"
sudo mkdir -p /home/ubuntu/wildpals-backend/uploads
sudo chown -R ubuntu:ubuntu /home/ubuntu/wildpals-backend
sudo chmod -R 755 /home/ubuntu/wildpals-backend

# 9. 创建MongoDB管理脚本
echo -e "${YELLOW}📋 Creating management scripts...${NC}"
cat > /home/ubuntu/mongo-manage.sh << 'MANAGESCRIPT'
#!/bin/bash

echo "=== MongoDB Management Script ==="
echo "1. Check MongoDB status"
echo "2. Connect to MongoDB"
echo "3. Backup database"
echo "4. Restore database"
echo "5. View logs"
echo "6. Restart MongoDB"
echo "7. Exit"

read -p "Choose an option (1-7): " choice

case $choice in
    1)
        sudo systemctl status mongod
        ;;
    2)
        echo "Connecting to MongoDB..."
        mongosh --uri="mongodb://wildpals_user:wildpals_password_2024@localhost:27017/wildpals?authSource=wildpals"
        ;;
    3)
        echo "Creating backup..."
        mongodump --uri="mongodb://wildpals_user:wildpals_password_2024@localhost:27017/wildpals?authSource=wildpals" --out="/home/ubuntu/backups/mongodb_$(date +%Y%m%d_%H%M%S)"
        ;;
    4)
        read -p "Enter backup directory path: " backup_path
        mongorestore --uri="mongodb://wildpals_user:wildpals_password_2024@localhost:27017/wildpals?authSource=wildpals" "$backup_path"
        ;;
    5)
        sudo tail -f /var/log/mongodb/mongod.log
        ;;
    6)
        sudo systemctl restart mongod
        echo "MongoDB restarted"
        ;;
    7)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo "Invalid option"
        ;;
esac
MANAGESCRIPT

chmod +x /home/ubuntu/mongo-manage.sh

# 10. 最终验证
echo -e "${GREEN}🎉 MongoDB configuration completed!${NC}"
echo -e "${YELLOW}📋 Summary:${NC}"
echo -e "✅ MongoDB service is running"
echo -e "✅ Authentication is enabled"
echo -e "✅ Admin user: admin / wildpals_admin_2024"
echo -e "✅ App user: wildpals_user / wildpals_password_2024"
echo -e "✅ Database: wildpals"
echo -e "✅ Collections: users, clubs, rides, messages, uploads"
echo -e "✅ Environment file: /home/ubuntu/wildpals-backend/.env"
echo -e "✅ Management script: /home/ubuntu/mongo-manage.sh"
echo -e ""
echo -e "${YELLOW}🔧 Useful commands:${NC}"
echo -e "Check status: sudo systemctl status mongod"
echo -e "View logs: sudo tail -f /var/log/mongodb/mongod.log"
echo -e "Connect: mongosh --uri='mongodb://wildpals_user:wildpals_password_2024@localhost:27017/wildpals?authSource=wildpals'"
echo -e "Manage: /home/ubuntu/mongo-manage.sh" 