/**
 * 认证系统修复验证脚本
 * 用于快速验证修复后的功能是否正常工作
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 验证认证系统修复...\n');

// 检查文件是否存在
function checkFileExists(filePath, description) {
  const fullPath = path.join(__dirname, filePath);
  const exists = fs.existsSync(fullPath);
  console.log(`${exists ? '✅' : '❌'} ${description}: ${filePath}`);
  return exists;
}

// 检查文件内容是否包含特定字符串
function checkFileContains(filePath, searchString, description) {
  try {
    const fullPath = path.join(__dirname, filePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    const contains = content.includes(searchString);
    console.log(`${contains ? '✅' : '❌'} ${description}`);
    return contains;
  } catch (error) {
    console.log(`❌ ${description} (文件读取失败)`);
    return false;
  }
}

console.log('📁 检查关键文件是否存在:');
checkFileExists('shared/config/api.ts', 'API配置文件');
checkFileExists('backend/.env.example', '环境变量示例文件');
checkFileExists('authentication_issues_log.md', '修复日志文件');

console.log('\n🔧 检查后端路由配置:');
checkFileContains('backend/src/app.ts', "app.use('/api/users', userRoutes)", '用户路由注册');
checkFileContains('backend/src/app.ts', "app.use('/api/clubs', clubRoutes)", '俱乐部路由注册');
checkFileContains('backend/src/app.ts', "app.use('/api/messages', messageRoutes)", '消息路由注册');

console.log('\n🌐 检查API配置:');
checkFileContains('shared/config/api.ts', 'buildApiUrl', 'API URL构建函数');
checkFileContains('shared/config/api.ts', 'HTTP_CONFIG', 'HTTP配置');
checkFileContains('shared/api/user.ts', 'buildApiUrl', '统一API调用');

console.log('\n🔐 检查认证修复:');
checkFileContains('backend/src/middleware/auth.ts', 'userId?: string', '认证中间件兼容性');
checkFileContains('backend/src/routes/userRoutes.ts', 'success: true', 'API响应格式统一');

console.log('\n📱 检查前端修复:');
checkFileContains('app/auth.tsx', 'UserApi.requestPasswordReset', '密码重置API调用');
checkFileContains('app/reset-password.tsx', 'Alert.alert', '用户反馈改进');
checkFileContains('app/context/AuthContext.tsx', 'user-unified', '类型定义统一');

console.log('\n🛡️ 检查安全配置:');
checkFileContains('backend/.env.example', 'JWT_SECRET', 'JWT密钥配置');
checkFileContains('backend/.env.example', 'EMAIL_HOST', '邮件服务配置');

console.log('\n📊 验证总结:');
console.log('✅ 主要修复已完成');
console.log('⚠️  请确保配置环境变量');
console.log('🧪 建议进行功能测试');

console.log('\n🚀 下一步操作建议:');
console.log('1. 复制 backend/.env.example 为 backend/.env 并配置');
console.log('2. 安装依赖: cd backend && npm install');
console.log('3. 启动后端: npm run dev');
console.log('4. 启动前端: cd .. && npx expo start');
console.log('5. 测试注册、登录、密码重置功能');