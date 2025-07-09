#!/bin/bash

# 服务测试脚本

set -e

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🧪 Testing Wildpals Services...${NC}"

# 1. 检查服务状态
echo -e "${YELLOW}📋 Checking service status...${NC}"

# PM2状态
echo "=== PM2 Status ==="
if command -v pm2 &> /dev/null; then
    pm2 status
else
    echo -e "${RED}❌ PM2 not found${NC}"
fi

# Nginx状态
echo -e "\n=== Nginx Status ==="
if sudo systemctl is-active nginx &> /dev/null; then
    echo -e "${GREEN}✅ Nginx is running${NC}"
    sudo systemctl status nginx --no-pager | head -5
else
    echo -e "${RED}❌ Nginx is not running${NC}"
fi

# MongoDB状态
echo -e "\n=== MongoDB Status ==="
if sudo systemctl is-active mongod &> /dev/null; then
    echo -e "${GREEN}✅ MongoDB is running${NC}"
    sudo systemctl status mongod --no-pager | head -5
else
    echo -e "${RED}❌ MongoDB is not running${NC}"
fi

# 2. 检查端口占用
echo -e "\n${YELLOW}🔍 Checking port usage...${NC}"
echo "=== Port Status ==="
sudo netstat -tlnp | grep -E ':(80|3000|27017)' || echo "No services found on expected ports"

# 3. 测试后端API
echo -e "\n${YELLOW}🧪 Testing Backend API...${NC}"

# 测试健康检查
echo "Testing health endpoint..."
if curl -s http://localhost:3000/health > /dev/null; then
    echo -e "${GREEN}✅ Backend health check passed${NC}"
    curl -s http://localhost:3000/health
else
    echo -e "${RED}❌ Backend health check failed${NC}"
fi

# 测试根路径
echo -e "\nTesting root endpoint..."
if curl -s http://localhost:3000/ > /dev/null; then
    echo -e "${GREEN}✅ Backend root endpoint responding${NC}"
else
    echo -e "${RED}❌ Backend root endpoint failed${NC}"
fi

# 4. 测试前端Web服务
echo -e "\n${YELLOW}🌐 Testing Frontend Web Service...${NC}"

# 测试Nginx服务
echo "Testing Nginx web service..."
if curl -s http://localhost/ > /dev/null; then
    echo -e "${GREEN}✅ Nginx web service responding${NC}"
    echo "Response headers:"
    curl -I http://localhost/ | head -5
else
    echo -e "${RED}❌ Nginx web service failed${NC}"
fi

# 测试API代理
echo -e "\nTesting API proxy..."
if curl -s http://localhost/api/ > /dev/null; then
    echo -e "${GREEN}✅ API proxy working${NC}"
else
    echo -e "${RED}❌ API proxy failed${NC}"
fi

# 5. 测试MongoDB连接
echo -e "\n${YELLOW}🗄️ Testing MongoDB Connection...${NC}"

# 检查MongoDB进程
if pgrep mongod > /dev/null; then
    echo -e "${GREEN}✅ MongoDB process is running${NC}"
    
    # 测试MongoDB连接
    if command -v mongosh &> /dev/null; then
        echo "Testing MongoDB connection..."
        if mongosh --eval "db.runCommand({ping: 1})" --quiet > /dev/null 2>&1; then
            echo -e "${GREEN}✅ MongoDB connection successful${NC}"
        else
            echo -e "${RED}❌ MongoDB connection failed${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️ mongosh not available for connection test${NC}"
    fi
else
    echo -e "${RED}❌ MongoDB process not found${NC}"
fi

# 6. 检查日志文件
echo -e "\n${YELLOW}📋 Checking log files...${NC}"

# 检查PM2日志
echo "=== Recent PM2 Logs ==="
if command -v pm2 &> /dev/null; then
    pm2 logs --lines 5 2>/dev/null || echo "No PM2 logs available"
fi

# 检查Nginx日志
echo -e "\n=== Recent Nginx Error Logs ==="
if [ -f "/var/log/nginx/wildpals_web_error.log" ]; then
    sudo tail -5 /var/log/nginx/wildpals_web_error.log
else
    echo "Nginx error log not found"
fi

# 检查MongoDB日志
echo -e "\n=== Recent MongoDB Logs ==="
if [ -f "/var/log/mongodb/mongod.log" ]; then
    sudo tail -5 /var/log/mongodb/mongod.log
else
    echo "MongoDB log not found"
fi

# 7. 获取服务器信息
echo -e "\n${YELLOW}📊 Server Information...${NC}"

# 获取服务器IP
SERVER_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || hostname -I | awk '{print $1}')
echo "Server IP: $SERVER_IP"

# 系统资源
echo -e "\n=== System Resources ==="
echo "Memory usage:"
free -h | head -2
echo ""
echo "Disk usage:"
df -h / | tail -1

# 8. 生成测试报告
echo -e "\n${BLUE}📋 Test Summary${NC}"
echo "=================="

# 统计测试结果
TESTS_PASSED=0
TESTS_FAILED=0

# 检查各项服务
if curl -s http://localhost:3000/health > /dev/null; then
    echo -e "${GREEN}✅ Backend API: PASSED${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ Backend API: FAILED${NC}"
    ((TESTS_FAILED++))
fi

if curl -s http://localhost/ > /dev/null; then
    echo -e "${GREEN}✅ Frontend Web: PASSED${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ Frontend Web: FAILED${NC}"
    ((TESTS_FAILED++))
fi

if sudo systemctl is-active nginx > /dev/null; then
    echo -e "${GREEN}✅ Nginx Service: PASSED${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ Nginx Service: FAILED${NC}"
    ((TESTS_FAILED++))
fi

if sudo systemctl is-active mongod > /dev/null; then
    echo -e "${GREEN}✅ MongoDB Service: PASSED${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ MongoDB Service: FAILED${NC}"
    ((TESTS_FAILED++))
fi

# 显示结果
echo -e "\n${BLUE}📊 Test Results${NC}"
echo "=================="
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed! Your services are running correctly.${NC}"
    echo -e "${BLUE}🌍 Your application should be available at: http://$SERVER_IP${NC}"
else
    echo -e "\n${RED}⚠️ Some tests failed. Please check the logs above for details.${NC}"
fi

echo -e "\n${YELLOW}🔧 Useful commands:${NC}"
echo "  View PM2 logs: pm2 logs"
echo "  View Nginx logs: sudo tail -f /var/log/nginx/wildpals_web_error.log"
echo "  Restart backend: pm2 restart wildpals-backend"
echo "  Restart nginx: sudo systemctl restart nginx"
echo "  Check status: pm2 status" 