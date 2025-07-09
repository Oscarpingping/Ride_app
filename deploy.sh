#!/bin/bash

# 部署配置
SERVER_IP="3.139.190.107"
SERVER_USER="ubuntu"
SERVER_PATH="/home/ubuntu/wildpals"
NGINX_PATH="/var/www/html"

echo "🚀 Starting Wildpals deployment..."

# 1. 构建Web版本
echo "📦 Building web version..."
npx expo export --platform web

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build completed!"

# 2. 上传到服务器
echo "📤 Uploading to server..."
rsync -avz --delete dist/ $SERVER_USER@$SERVER_IP:$SERVER_PATH/dist/

if [ $? -ne 0 ]; then
    echo "❌ Upload failed!"
    exit 1
fi

echo "✅ Upload completed!"

# 3. 部署到Nginx
echo "🌐 Deploying to Nginx..."
ssh $SERVER_USER@$SERVER_IP << EOF
    sudo cp -r $SERVER_PATH/dist/* $NGINX_PATH/
    sudo systemctl restart nginx
    echo "✅ Nginx restarted!"
EOF

echo "🎉 Deployment completed!"
echo "🌍 Your app is available at: http://$SERVER_IP" 