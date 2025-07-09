#!/bin/bash

# 修复文件监视器限制的脚本

set -e

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🔧 Fixing file watchers limit...${NC}"

# 1. 检查当前限制
echo -e "${YELLOW}📋 Checking current file watchers limit...${NC}"
current_limit=$(cat /proc/sys/fs/inotify/max_user_watches)
echo "Current limit: $current_limit"

# 2. 临时增加限制
echo -e "${YELLOW}⚡ Temporarily increasing file watchers limit...${NC}"
echo 524288 | sudo tee /proc/sys/fs/inotify/max_user_watches

# 3. 永久增加限制
echo -e "${YELLOW}💾 Making the change permanent...${NC}"
echo 'fs.inotify.max_user_watches=524288' | sudo tee -a /etc/sysctl.conf

# 4. 应用更改
sudo sysctl -p

# 5. 验证更改
echo -e "${YELLOW}✅ Verifying the change...${NC}"
new_limit=$(cat /proc/sys/fs/inotify/max_user_watches)
echo "New limit: $new_limit"

# 6. 优化Metro配置以减少文件监视
echo -e "${YELLOW}🔧 Optimizing Metro configuration...${NC}"

# 创建优化的Metro配置
cat > metro.config.optimized.js << 'METROCONFIG'
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// 减少工作进程数量
config.maxWorkers = 1;

// 优化转换器配置
config.transformer.minifierConfig = {
  compress: {
    drop_console: true,
    drop_debugger: true,
  },
};

// 配置服务器
config.server = {
  ...config.server,
  port: 8081,
};

// 减少文件监视
config.watchFolders = [__dirname];

// 排除不必要的目录
config.resolver.blockList = [
  /backend\/.*/,
  /node_modules\/.*\/test\/.*/,
  /node_modules\/.*\/tests\/.*/,
  /node_modules\/.*\/docs\/.*/,
  /node_modules\/.*\/examples\/.*/,
  /node_modules\/.*\/node_modules\/.*/,
  /node_modules\/react-native\/ReactAndroid\/.*/,
  /node_modules\/react-native\/ReactCommon\/.*/,
  /node_modules\/react-native\/Libraries\/.*/,
  /node_modules\/react-native\/scripts\/.*/,
  /node_modules\/react-native\/third-party\/.*/,
  /node_modules\/react-native\/tools\/.*/,
  /node_modules\/react-native\/website\/.*/,
];

// 配置缓存
config.cacheStores = [
  {
    name: 'disk',
    options: {
      cacheDirectory: '/tmp/metro-cache',
    },
  },
];

// 减少文件监视器使用
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;
METROCONFIG

# 7. 创建优化的启动脚本
echo -e "${YELLOW}📝 Creating optimized startup script...${NC}"
cat > start-expo-optimized.sh << 'STARTSCRIPT'
#!/bin/bash

echo "🚀 Starting Expo with optimized configuration..."

# 设置环境变量
export EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
export EXPO_USE_FAST_REFRESH=false

# 清理缓存
rm -rf .expo
rm -rf node_modules/.cache

# 使用优化的Metro配置启动
EXPO_METRO_CONFIG=metro.config.optimized.js npx expo start --tunnel --port 8081
STARTSCRIPT

chmod +x start-expo-optimized.sh

# 8. 创建PM2优化配置
echo -e "${YELLOW}📋 Creating optimized PM2 configuration...${NC}"
cat > ecosystem-expo-optimized.config.js << 'PM2CONFIG'
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
      name: 'wildpals-expo-optimized',
      script: './start-expo-optimized.sh',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        EXPO_DEVTOOLS_LISTEN_ADDRESS: '0.0.0.0',
        EXPO_USE_FAST_REFRESH: 'false'
      },
      cwd: '/home/ubuntu/wildpals'
    }
  ]
};
PM2CONFIG

# 9. 创建监控脚本
echo -e "${YELLOW}📊 Creating monitoring script...${NC}"
cat > monitor-watchers.sh << 'MONITORSCRIPT'
#!/bin/bash

echo "=== File Watchers Monitoring ==="
echo "Current limit: $(cat /proc/sys/fs/inotify/max_user_watches)"
echo "Current usage: $(find /proc/*/fd -lname anon_inode:inotify 2>/dev/null | wc -l)"
echo ""

echo "=== System Resources ==="
echo "Memory usage:"
free -h
echo ""
echo "Disk usage:"
df -h /
echo ""
echo "Process count:"
ps aux | wc -l
MONITORSCRIPT

chmod +x monitor-watchers.sh

echo -e "${GREEN}✅ File watchers fix completed!${NC}"
echo -e "${YELLOW}📋 Next steps:${NC}"
echo -e "1. Try running: ./start-expo-optimized.sh"
echo -e "2. Or use PM2: pm2 start ecosystem-expo-optimized.config.js"
echo -e "3. Monitor resources: ./monitor-watchers.sh"
echo -e ""
echo -e "${YELLOW}🔧 If you still have issues:${NC}"
echo -e "1. Use web build: npx expo export --platform web"
echo -e "2. Use LAN mode: npx expo start --lan"
echo -e "3. Increase limit further: echo 1048576 | sudo tee /proc/sys/fs/inotify/max_user_watches" 