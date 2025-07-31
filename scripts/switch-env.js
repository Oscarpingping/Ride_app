#!/usr/bin/env node

/**
 * 环境切换脚本
 * 用法: node scripts/switch-env.js [development|production]
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const environment = args[0];

if (!environment || !['development', 'production'].includes(environment)) {
  console.error('❌ 请指定环境: development 或 production');
  console.log('用法: node scripts/switch-env.js [development|production]');
  process.exit(1);
}

const sourceFile = `.env.${environment}`;
const targetFile = '.env';

try {
  if (!fs.existsSync(sourceFile)) {
    console.error(`❌ 环境配置文件不存在: ${sourceFile}`);
    process.exit(1);
  }

  // 复制环境配置文件
  fs.copyFileSync(sourceFile, targetFile);
  
  console.log(`✅ 已切换到 ${environment} 环境`);
  console.log(`📁 配置文件: ${sourceFile} -> ${targetFile}`);
  
  // 显示当前配置
  const config = fs.readFileSync(targetFile, 'utf8');
  const apiUrl = config.match(/EXPO_PUBLIC_API_URL=(.+)/)?.[1];
  const nodeEnv = config.match(/NODE_ENV=(.+)/)?.[1];
  
  console.log(`🌐 API URL: ${apiUrl}`);
  console.log(`🔧 NODE_ENV: ${nodeEnv}`);
  
} catch (error) {
  console.error(`❌ 环境切换失败: ${error.message}`);
  process.exit(1);
}