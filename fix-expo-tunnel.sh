#!/bin/bash

# 修复Expo tunnel问题的脚本

set -e

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🔧 Fixing Expo tunnel issues...${NC}"

# 1. 清理npm缓存
echo -e "${YELLOW}🧹 Cleaning npm cache...${NC}"
npm cache clean --force

# 2. 安装ngrok包
echo -e "${YELLOW}📦 Installing @expo/ngrok...${NC}"

# 尝试多种安装方法
echo "Method 1: Using sudo npm install -g"
sudo npm install -g @expo/ngrok@^4.1.0 || {
    echo "Method 1 failed, trying Method 2: Using npx"
    npx @expo/ngrok@^4.1.0 --version || {
        echo "Method 2 failed, trying Method 3: Local installation"
        npm install @expo/ngrok@^4.1.0
    }
}

# 3. 检查Node.js和npm版本
echo -e "${YELLOW}📋 Checking Node.js and npm versions...${NC}"
node --version
npm --version

# 4. 清理Expo缓存
echo -e "${YELLOW}🧹 Cleaning Expo cache...${NC}"
npx expo install --fix
rm -rf .expo
rm -rf node_modules/.cache

# 5. 重新安装依赖
echo -e "${YELLOW}📦 Reinstalling dependencies...${NC}"
rm -rf node_modules
npm install

# 6. 检查环境变量
echo -e "${YELLOW}🔍 Checking environment variables...${NC}"
if [ -f ".env_front" ]; then
    echo "Found .env_front file"
    cp .env_front .env
fi

# 7. 测试Expo配置
echo -e "${YELLOW}🧪 Testing Expo configuration...${NC}"
npx expo doctor

# 8. 创建启动脚本
echo -e "${YELLOW}📝 Creating startup script...${NC}"
cat > start-expo.sh << 'STARTSCRIPT'
#!/bin/bash

echo "🚀 Starting Expo with tunnel mode..."

# 设置环境变量
export EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0

# 启动Expo tunnel
npx expo start --tunnel --port 8081
STARTSCRIPT

chmod +x start-expo.sh

# 9. 创建PM2配置
echo -e "${YELLOW}📋 Creating PM2 configuration...${NC}"
cat > ecosystem-expo-fixed.config.js << 'PM2CONFIG'
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
      name: 'wildpals-expo',
      script: './start-expo.sh',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        EXPO_DEVTOOLS_LISTEN_ADDRESS: '0.0.0.0'
      },
      cwd: '/home/ubuntu/wildpals'
    }
  ]
};
PM2CONFIG

echo -e "${GREEN}✅ Fix completed!${NC}"
echo -e "${YELLOW}📋 Next steps:${NC}"
echo -e "1. Try running: ./start-expo.sh"
echo -e "2. Or use PM2: pm2 start ecosystem-expo-fixed.config.js"
echo -e "3. Check logs: pm2 logs wildpals-expo"
echo -e ""
echo -e "${YELLOW}🔧 Alternative solutions if tunnel still fails:${NC}"
echo -e "1. Use LAN mode: npx expo start --lan"
echo -e "2. Use localhost: npx expo start --localhost"
echo -e "3. Use web build: npx expo export --platform web" 