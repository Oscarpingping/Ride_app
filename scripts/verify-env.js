#!/usr/bin/env node

/**
 * 环境验证脚本
 * 验证当前环境配置是否正确
 */

const fs = require('fs');
const https = require('https');
const http = require('http');

async function verifyEnvironment() {
  console.log('🔍 验证当前环境配置...\n');

  // 读取当前环境配置
  const envContent = fs.readFileSync('.env', 'utf8');
  const apiUrl = envContent.match(/EXPO_PUBLIC_API_URL=(.+)/)?.[1];
  const nodeEnv = envContent.match(/NODE_ENV=(.+)/)?.[1];

  console.log(`🌐 当前 API URL: ${apiUrl}`);
  console.log(`🔧 当前环境: ${nodeEnv}\n`);

  // 测试 API 连接
  console.log('🔗 测试 API 连接...');
  
  try {
    const url = new URL(`${apiUrl}/health`);
    const client = url.protocol === 'https:' ? https : http;
    
    const response = await new Promise((resolve, reject) => {
      const req = client.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, data }));
      });
      req.on('error', reject);
      req.setTimeout(5000, () => reject(new Error('请求超时')));
    });

    if (response.status === 200) {
      console.log('✅ API 连接成功');
      console.log(`📊 服务器响应: ${response.data}`);
    } else {
      console.log(`⚠️ API 响应异常: HTTP ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ API 连接失败: ${error.message}`);
    console.log('💡 请检查服务器是否运行或网络连接');
  }

  // 验证环境一致性
  console.log('\n🔍 验证环境一致性...');
  
  const expectedUrls = {
    development: 'http://192.168.1.50:5001',
    production: 'http://3.139.190.107:5001'
  };

  const expectedUrl = expectedUrls[nodeEnv];
  if (apiUrl === expectedUrl) {
    console.log('✅ 环境配置一致');
  } else {
    console.log(`⚠️ 环境配置不一致:`);
    console.log(`   期望: ${expectedUrl}`);
    console.log(`   实际: ${apiUrl}`);
  }

  console.log('\n🎯 验证完成！');
}

verifyEnvironment().catch(console.error);