#!/bin/bash

# 恢复文件监视器设置的脚本

set -e

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🔄 Restoring file watchers to default settings...${NC}"

# 1. 检查当前设置
echo -e "${YELLOW}📋 Current file watchers limit:${NC}"
current_limit=$(cat /proc/sys/fs/inotify/max_user_watches)
echo "Current: $current_limit"

# 2. 恢复到默认值
echo -e "${YELLOW}⚡ Restoring to default limit (8192)...${NC}"
echo 8192 | sudo tee /proc/sys/fs/inotify/max_user_watches

# 3. 从sysctl.conf中移除永久设置
echo -e "${YELLOW}🗑️ Removing permanent setting from sysctl.conf...${NC}"
sudo sed -i '/fs.inotify.max_user_watches=524288/d' /etc/sysctl.conf

# 4. 应用更改
sudo sysctl -p

# 5. 验证恢复
echo -e "${YELLOW}✅ Verifying restoration...${NC}"
new_limit=$(cat /proc/sys/fs/inotify/max_user_watches)
echo "New limit: $new_limit"

if [ "$new_limit" = "8192" ]; then
    echo -e "${GREEN}✅ Successfully restored to default limit${NC}"
else
    echo -e "${RED}❌ Failed to restore to default limit${NC}"
    exit 1
fi

# 6. 检查系统资源
echo -e "${YELLOW}📊 System resource check:${NC}"
echo "Memory usage:"
free -h | head -2
echo ""
echo "File watchers in use:"
find /proc/*/fd -lname anon_inode:inotify 2>/dev/null | wc -l

echo -e "${GREEN}🎉 File watchers restoration completed!${NC}"
echo -e "${YELLOW}📋 Note: You may need to restart Expo if it was running${NC}" 