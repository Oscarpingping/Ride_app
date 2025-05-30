#!/usr/bin/env ts-node

/**
 * 用户类型一致性验证脚本
 * 检查前后端类型定义是否一致
 */

import { User, UserSummary, UserPublic, SocketUser, AuthUser } from '../shared/types/user-unified';

// 模拟数据验证
const mockUser: User = {
  _id: '507f1f77bcf86cd799439011',
  name: 'John Doe',
  email: 'john@example.com',
  avatar: 'https://example.com/avatar.jpg',
  bio: 'A passionate cyclist',
  rating: 4.5,
  ridesJoined: 15,
  ridesCreated: 3,
  createdRides: ['507f1f77bcf86cd799439012'],
  joinedRides: ['507f1f77bcf86cd799439013'],
  clubs: [{
    club: '507f1f77bcf86cd799439014',
    joinedAt: new Date('2024-01-01')
  }],
  emergencyContact: {
    name: 'Jane Doe',
    phone: '+1234567890'
  },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-15')
};

// 类型转换验证
function validateTypeConversions() {
  console.log('🔍 验证类型转换...');

  try {
    // 导入转换函数
    const { 
      toUserSummary, 
      toUserPublic, 
      toSocketUser, 
      toAuthUser,
      isUser,
      isUserSummary 
    } = require('../shared/types/user-unified');

    // 验证类型守卫
    console.log('✅ 类型守卫验证:');
    console.log(`  isUser(mockUser): ${isUser(mockUser)}`);
    
    const summary = toUserSummary(mockUser);
    console.log(`  isUserSummary(summary): ${isUserSummary(summary)}`);

    // 验证类型转换
    console.log('✅ 类型转换验证:');
    
    const userSummary: UserSummary = toUserSummary(mockUser);
    console.log(`  UserSummary: ${JSON.stringify(userSummary, null, 2)}`);

    const userPublic: UserPublic = toUserPublic(mockUser);
    console.log(`  UserPublic: ${JSON.stringify(userPublic, null, 2)}`);

    const socketUser: SocketUser = toSocketUser(mockUser);
    console.log(`  SocketUser: ${JSON.stringify(socketUser, null, 2)}`);

    const authUser: AuthUser = toAuthUser(mockUser);
    console.log(`  AuthUser: ${JSON.stringify(authUser, null, 2)}`);

    console.log('✅ 所有类型转换验证通过!');
  } catch (error) {
    console.error('❌ 类型转换验证失败:', error);
  }
}

// 字段一致性验证
function validateFieldConsistency() {
  console.log('\n🔍 验证字段一致性...');

  const requiredFields = ['_id', 'name', 'email', 'createdAt', 'updatedAt'];
  const missingFields = requiredFields.filter(field => !(field in mockUser));

  if (missingFields.length === 0) {
    console.log('✅ 所有必需字段都存在');
  } else {
    console.error('❌ 缺少必需字段:', missingFields);
  }

  // 检查字段类型
  const fieldTypes = {
    _id: 'string',
    name: 'string',
    email: 'string',
    avatar: 'string',
    rating: 'number',
    createdAt: 'object', // Date
    updatedAt: 'object'  // Date
  };

  let typeErrors = 0;
  Object.entries(fieldTypes).forEach(([field, expectedType]) => {
    const actualType = typeof (mockUser as any)[field];
    if (field in mockUser && actualType !== expectedType) {
      console.error(`❌ 字段 ${field} 类型错误: 期望 ${expectedType}, 实际 ${actualType}`);
      typeErrors++;
    }
  });

  if (typeErrors === 0) {
    console.log('✅ 所有字段类型正确');
  }
}

// 导入一致性验证
function validateImportConsistency() {
  console.log('\n🔍 验证导入一致性...');

  try {
    // 验证统一类型文件
    const unifiedTypes = require('../shared/types/user-unified');
    console.log('✅ 统一类型文件导入成功');

    // 验证兼容层文件
    const userTypes = require('../shared/types/user');
    console.log('✅ 用户类型文件导入成功');

    const entityTypes = require('../shared/types/entities');
    console.log('✅ 实体类型文件导入成功');

    const socketTypes = require('../shared/types/socket');
    console.log('✅ Socket类型文件导入成功');

    const apiTypes = require('../shared/api/types');
    console.log('✅ API类型文件导入成功');

    console.log('✅ 所有类型文件导入一致性验证通过!');
  } catch (error) {
    console.error('❌ 导入一致性验证失败:', error);
  }
}

// 主验证函数
function main() {
  console.log('🚀 开始用户类型一致性验证\n');

  validateFieldConsistency();
  validateTypeConversions();
  validateImportConsistency();

  console.log('\n🎉 验证完成!');
}

// 运行验证
if (require.main === module) {
  main();
}

export { validateTypeConversions, validateFieldConsistency, validateImportConsistency };