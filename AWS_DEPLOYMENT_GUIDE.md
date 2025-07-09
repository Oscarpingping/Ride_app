# Wildpals AWS 部署指南

## 概述
本指南将帮助你在AWS EC2 Ubuntu服务器上部署Wildpals应用，包括前端、后端、MongoDB数据库和Nginx反向代理。

## 系统要求
- AWS EC2 Ubuntu 22.04 LTS
- 至少2GB RAM
- 至少20GB存储空间
- 开放端口：22 (SSH), 80 (HTTP), 443 (HTTPS), 3000 (API)

## 部署步骤

### 第一步：服务器初始化

1. **连接到你的AWS服务器**
   ```bash
   ssh -i your-key.pem ubuntu@your-server-ip
   ```

2. **上传并运行服务器初始化脚本**
   ```bash
   # 在本地机器上上传脚本
   scp -i your-key.pem server-setup.sh ubuntu@your-server-ip:~/
   
   # 在服务器上运行脚本
   ssh -i your-key.pem ubuntu@your-server-ip
   chmod +x server-setup.sh
   ./server-setup.sh
   ```

   这个脚本会自动安装：
   - Node.js 18.x
   - PM2 进程管理器
   - Nginx 反向代理
   - MongoDB 7.0
   - 配置防火墙
   - 创建必要的目录结构

### 第二步：配置环境变量

1. **在服务器上配置后端环境变量**
   ```bash
   ssh -i your-key.pem ubuntu@your-server-ip
   cd /home/ubuntu/wildpals-backend
   cp .env.template .env
   nano .env
   ```

2. **更新环境变量配置**
   ```env
   # 数据库配置
   MONGODB_URI=mongodb://wildpals_user:wildpals_password_2024@localhost:27017/wildpals?authSource=wildpals
   
   # 服务器配置
   PORT=3000
   NODE_ENV=production
   
   # JWT配置
   JWT_SECRET=your_very_secure_jwt_secret_here
   JWT_EXPIRES_IN=7d
   
   # 文件上传配置
   UPLOAD_PATH=/home/ubuntu/wildpals-backend/uploads
   MAX_FILE_SIZE=10485760
   
   # CORS配置
   CORS_ORIGIN=http://your-server-ip,http://your-domain.com
   ```

### 第三步：部署应用

1. **在本地机器上运行部署脚本**
   ```bash
   # 给脚本执行权限
   chmod +x deploy-aws.sh
   
   # 运行部署脚本
   ./deploy-aws.sh your-server-ip ubuntu
   ```

   这个脚本会：
   - 构建前端Web版本
   - 构建后端TypeScript代码
   - 上传文件到服务器
   - 安装依赖
   - 启动PM2进程
   - 配置Nginx

### 第四步：验证部署

1. **检查服务状态**
   ```bash
   ssh -i your-key.pem ubuntu@your-server-ip
   /home/ubuntu/monitor.sh
   ```

2. **查看应用日志**
   ```bash
   # 查看PM2日志
   pm2 logs wildpals-backend
   
   # 查看Nginx日志
   sudo tail -f /var/log/nginx/wildpals_error.log
   sudo tail -f /var/log/nginx/wildpals_access.log
   ```

3. **测试应用**
   - 前端：http://your-server-ip
   - 后端API：http://your-server-ip/api
   - 健康检查：http://your-server-ip/health

## 常用管理命令

### 服务管理
```bash
# 重启后端服务
pm2 restart wildpals-backend

# 重启Nginx
sudo systemctl restart nginx

# 重启MongoDB
sudo systemctl restart mongod

# 查看所有服务状态
pm2 status
sudo systemctl status nginx mongod
```

### 日志查看
```bash
# 实时查看后端日志
pm2 logs wildpals-backend --lines 100

# 查看Nginx访问日志
sudo tail -f /var/log/nginx/wildpals_access.log

# 查看系统监控日志
tail -f /var/log/wildpals/monitor.log
```

### 备份和恢复
```bash
# 手动备份
/home/ubuntu/backup.sh

# 查看备份文件
ls -la /home/ubuntu/backups/
```

### 数据库管理
```bash
# 连接到MongoDB
mongosh --uri="mongodb://wildpals_user:wildpals_password_2024@localhost:27017/wildpals?authSource=wildpals"

# 查看数据库
show dbs
use wildpals
show collections
```

## 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 查看端口占用
   sudo netstat -tlnp | grep :3000
   
   # 杀死占用进程
   sudo kill -9 <PID>
   ```

2. **权限问题**
   ```bash
   # 修复文件权限
   sudo chown -R ubuntu:ubuntu /home/ubuntu/wildpals*
   sudo chmod -R 755 /home/ubuntu/wildpals*
   ```

3. **磁盘空间不足**
   ```bash
   # 清理日志文件
   sudo journalctl --vacuum-time=7d
   
   # 清理npm缓存
   npm cache clean --force
   
   # 清理apt缓存
   sudo apt clean
   ```

4. **MongoDB连接问题**
   ```bash
   # 检查MongoDB状态
   sudo systemctl status mongod
   
   # 查看MongoDB日志
   sudo tail -f /var/log/mongodb/mongod.log
   ```

### 性能优化

1. **启用Nginx缓存**
   ```nginx
   # 在Nginx配置中添加
   location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   ```

2. **启用Gzip压缩**
   ```nginx
   # 在Nginx配置中添加
   gzip on;
   gzip_vary on;
   gzip_min_length 1024;
   gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
   ```

3. **PM2集群模式**
   ```bash
   # 修改PM2配置为集群模式
   pm2 start ecosystem.config.js --instances max
   ```

## 安全建议

1. **设置防火墙规则**
   ```bash
   # 只允许必要的端口
   sudo ufw allow ssh
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw deny 3000/tcp  # 不直接暴露API端口
   ```

2. **配置SSL证书**
   ```bash
   # 安装Certbot
   sudo apt install certbot python3-certbot-nginx
   
   # 获取SSL证书
   sudo certbot --nginx -d your-domain.com
   ```

3. **定期更新系统**
   ```bash
   # 设置自动更新
   sudo apt install unattended-upgrades
   sudo dpkg-reconfigure -plow unattended-upgrades
   ```

## 监控和维护

1. **设置监控告警**
   - 使用AWS CloudWatch监控服务器资源
   - 设置磁盘空间、内存使用率告警
   - 监控应用响应时间

2. **定期维护**
   ```bash
   # 每周运行一次
   sudo apt update && sudo apt upgrade -y
   npm update -g pm2
   /home/ubuntu/backup.sh
   ```

3. **日志轮转**
   ```bash
   # 配置logrotate
   sudo nano /etc/logrotate.d/wildpals
   ```

## 联系信息

如果在部署过程中遇到问题，请检查：
1. 服务器日志：`/var/log/wildpals/`
2. 应用日志：`pm2 logs wildpals-backend`
3. Nginx日志：`/var/log/nginx/`
4. 系统日志：`journalctl -u nginx -u mongod`

---

**注意**：请确保在生产环境中更改所有默认密码和密钥！ 