#!/bin/bash

set -e

DEPLOY_DIR="/var/www/wildpals"
BUILD_DIR="./dist/web"


echo "=== 1. 安装依赖 ==="
npm install

echo "=== 2. 清理本地旧的构建产物 ==="
rm -rf ./dist ./web-build ./build

echo "=== 3. 构建Web版本 ==="
npx expo export --platform web

echo "=== 4. 彻底清空部署目录 ==="
sudo rm -rf "$DEPLOY_DIR"
sudo mkdir -p "$DEPLOY_DIR"

echo "=== 5. 拷贝新构建产物到部署目录 ==="
sudo cp -r "$BUILD_DIR"/* "$DEPLOY_DIR"/

echo "=== 6. 设置权限 ==="
sudo chown -R www-data:www-data "$DEPLOY_DIR"
sudo chmod -R 755 "$DEPLOY_DIR"

echo "=== 7. 检查并重载Nginx ==="
sudo nginx -t
sudo systemctl reload nginx

echo "=== 8. 部署完成，访问 http://3.139.190.107 测试 ==="


