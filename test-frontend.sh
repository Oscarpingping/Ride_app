#!/bin/bash

# WildPals Frontend Local Test Script

set -e

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# 检查构建文件
if [ ! -d "dist" ]; then
    echo "错误: dist 目录不存在，请先运行构建脚本"
    exit 1
fi

# 启动本地服务器
log_info "启动本地测试服务器..."
cd dist

# 检查是否有Python3
if command -v python3 &> /dev/null; then
    log_info "使用 Python3 启动服务器..."
    python3 -m http.server 8080
elif command -v python &> /dev/null; then
    log_info "使用 Python 启动服务器..."
    python -m SimpleHTTPServer 8080
else
    log_info "使用 Node.js 启动服务器..."
    npx serve -s . -l 8080
fi
