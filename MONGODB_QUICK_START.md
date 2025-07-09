# MongoDB 快速启动指南

## 1. 安装MongoDB

### Ubuntu/Debian
```bash
# 导入公钥
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# 添加仓库
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# 安装
sudo apt-get update
sudo apt-get install -y mongodb-org
```

### macOS
```bash
# 使用Homebrew
brew tap mongodb/brew
brew install mongodb-community
```

## 2. 启动MongoDB服务

```bash
# 启动服务
sudo systemctl start mongod

# 设置开机自启
sudo systemctl enable mongod

# 检查状态
sudo systemctl status mongod
```

## 3. 快速配置（使用脚本）

```bash
# 给脚本执行权限
chmod +x setup-mongodb.sh

# 运行配置脚本
./setup-mongodb.sh
```

## 4. 手动配置（可选）

### 创建用户和数据库
```bash
# 连接到MongoDB
mongosh

# 在MongoDB shell中执行：
use admin
db.createUser({
  user: "admin",
  pwd: "wildpals_admin_2024",
  roles: [
    { role: "userAdminAnyDatabase", db: "admin" },
    { role: "readWriteAnyDatabase", db: "admin" }
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
```

### 启用认证
```bash
# 编辑配置文件
sudo nano /etc/mongod.conf

# 添加以下内容：
security:
  authorization: enabled

# 重启服务
sudo systemctl restart mongod
```

## 5. 验证配置

### 测试连接
```bash
# 测试应用用户连接
mongosh --uri="mongodb://wildpals_user:wildpals_password_2024@localhost:27017/wildpals?authSource=wildpals"

# 测试管理员连接
mongosh --uri="mongodb://admin:wildpals_admin_2024@localhost:27017/admin?authSource=admin"
```

### 检查数据库
```bash
# 在MongoDB shell中：
show dbs
use wildpals
show collections
```

## 6. 环境变量配置

创建 `.env` 文件：
```env
MONGODB_URI=mongodb://wildpals_user:wildpals_password_2024@localhost:27017/wildpals?authSource=wildpals
PORT=3000
NODE_ENV=production
JWT_SECRET=your_jwt_secret_here
```

## 7. 常用管理命令

### 服务管理
```bash
# 启动
sudo systemctl start mongod

# 停止
sudo systemctl stop mongod

# 重启
sudo systemctl restart mongod

# 查看状态
sudo systemctl status mongod

# 查看日志
sudo tail -f /var/log/mongodb/mongod.log
```

### 数据库管理
```bash
# 备份数据库
mongodump --uri="mongodb://wildpals_user:wildpals_password_2024@localhost:27017/wildpals?authSource=wildpals" --out=backup/

# 恢复数据库
mongorestore --uri="mongodb://wildpals_user:wildpals_password_2024@localhost:27017/wildpals?authSource=wildpals" backup/wildpals/

# 查看数据库大小
mongosh --uri="mongodb://wildpals_user:wildpals_password_2024@localhost:27017/wildpals?authSource=wildpals" --eval "db.stats()"
```

## 8. 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 查看端口占用
   sudo netstat -tlnp | grep :27017
   
   # 杀死进程
   sudo kill -9 <PID>
   ```

2. **权限问题**
   ```bash
   # 修复数据目录权限
   sudo chown -R mongodb:mongodb /var/lib/mongodb
   sudo chown -R mongodb:mongodb /var/log/mongodb
   ```

3. **磁盘空间不足**
   ```bash
   # 检查磁盘空间
   df -h
   
   # 清理日志
   sudo journalctl --vacuum-time=7d
   ```

4. **连接被拒绝**
   ```bash
   # 检查MongoDB是否运行
   sudo systemctl status mongod
   
   # 检查防火墙
   sudo ufw status
   ```

## 9. 性能优化

### 内存配置
```bash
# 编辑配置文件
sudo nano /etc/mongod.conf

# 添加内存配置
storage:
  wiredTiger:
    engineConfig:
      cacheSizeGB: 1
```

### 索引优化
```bash
# 在MongoDB shell中创建索引
use wildpals
db.users.createIndex({ "email": 1 }, { unique: true })
db.rides.createIndex({ "date": 1 })
db.rides.createIndex({ "location": "2dsphere" })
```

## 10. 安全建议

1. **更改默认密码**
2. **限制网络访问**
3. **定期备份**
4. **监控日志**
5. **更新MongoDB版本**

---

**注意**：请在生产环境中更改所有默认密码！ 