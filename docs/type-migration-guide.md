# 用户类型统一迁移指南

## 概述

为了解决项目中用户数据类型定义重复和不一致的问题，我们创建了统一的用户类型定义系统。本文档说明了迁移过程和新的类型使用方式。

## 问题分析

### 迁移前的问题

1. **字段名不一致**
   - 有些使用 `_id`，有些使用 `id`
   - 有些使用 `name`，有些使用 `username`
   - 有些使用 `avatar`，有些使用 `profilePicture`

2. **类型定义重复**
   - `shared/types/user.ts`
   - `shared/types/entities.ts`
   - `shared/types/socket.ts`
   - `shared/types/common.ts`
   - `types/ride.ts`
   - `backend/src/models/User.ts`

3. **字段不完整**：不同定义包含的字段差异很大

4. **引用关系混乱**：不同模块引用不同的用户定义

## 解决方案

### 新的类型层次结构

我们在 `shared/types/user-unified.ts` 中创建了统一的类型定义：

```typescript
// 基础用户信息（最小集合）
interface BaseUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 完整用户信息
interface User extends BaseUser {
  bio?: string;
  rating?: number;
  ridesJoined?: number;
  ridesCreated?: number;
  createdRides?: string[];
  joinedRides?: string[];
  clubs?: ClubReference[];
  emergencyContact?: EmergencyContact;
}

// 用户简要信息（用于列表显示）
interface UserSummary {
  _id: string;
  name: string;
  avatar?: string;
  rating?: number;
}

// 用户公开信息（用于其他用户查看）
interface UserPublic extends BaseUser {
  bio?: string;
  rating?: number;
  ridesJoined?: number;
  ridesCreated?: number;
}

// Socket连接用户信息
interface SocketUser {
  _id: string;
  name: string;
  avatar?: string;
  status?: UserStatus;
  lastSeen?: Date;
}

// 认证用户信息
interface AuthUser {
  _id: string;
  email: string;
  name: string;
  avatar?: string;
}
```

### 工具函数

提供了类型转换工具函数：

```typescript
// 类型守卫
function isUser(obj: any): obj is User
function isUserSummary(obj: any): obj is UserSummary

// 类型转换
function toUserSummary(user: User | BaseUser): UserSummary
function toUserPublic(user: User): UserPublic
function toSocketUser(user: User | BaseUser, status?: UserStatus): SocketUser
function toAuthUser(user: User): AuthUser
```

## 迁移步骤

### 1. 更新导入语句

**旧方式：**
```typescript
import { User } from '../types/user';
import { User } from '../types/entities';
```

**新方式：**
```typescript
import { User, UserSummary, UserPublic } from '../types/user-unified';
```

### 2. 使用合适的用户类型

根据使用场景选择合适的类型：

- **完整用户信息**：使用 `User`
- **列表显示**：使用 `UserSummary`
- **公开信息**：使用 `UserPublic`
- **Socket连接**：使用 `SocketUser`
- **认证响应**：使用 `AuthUser`

### 3. 字段名统一

所有新代码应使用统一的字段名：

- 使用 `_id` 而不是 `id`（MongoDB标准）
- 使用 `name` 而不是 `username`
- 使用 `avatar` 而不是 `profilePicture`

### 4. 后端模型更新

后端用户模型现在包含 `toJSON()` 方法，自动转换为前端类型：

```typescript
const user = await User.findById(userId);
const userResponse = user.toJSON(); // 自动转换为前端User类型
```

## 向后兼容性

为了确保平滑迁移，我们保留了旧的类型定义文件，但它们现在重新导出统一的类型：

- `shared/types/user.ts` - 重新导出统一类型
- `shared/types/entities.ts` - 继承BaseUser
- `shared/types/socket.ts` - 继承SocketUser
- `shared/types/common.ts` - 保留兼容接口
- `types/ride.ts` - 保留兼容接口

## 最佳实践

### 1. 新代码规范

```typescript
// ✅ 推荐：使用统一类型
import { User, UserSummary } from '../shared/types/user-unified';

// ❌ 避免：使用旧的分散定义
import { User } from '../types/entities';
```

### 2. 类型选择指南

```typescript
// 用户列表页面
const users: UserSummary[] = await fetchUsers();

// 用户详情页面
const user: User = await fetchUserDetails(userId);

// 公开用户信息
const publicUser: UserPublic = toUserPublic(user);

// Socket连接
const socketUser: SocketUser = toSocketUser(user, UserStatus.ONLINE);
```

### 3. API响应

```typescript
// 登录响应
interface AuthResponse {
  token: string;
  refreshToken: string;
  user: AuthUser; // 只包含必要的认证信息
}

// 用户详情响应
interface UserDetailResponse {
  user: User; // 完整用户信息
}
```

## 迁移检查清单

- [ ] 更新所有用户类型导入
- [ ] 统一字段名（_id, name, avatar）
- [ ] 使用合适的用户类型变体
- [ ] 更新API响应类型
- [ ] 测试前后端类型一致性
- [ ] 更新相关文档

## 注意事项

1. **渐进式迁移**：可以逐步迁移，旧代码仍然可以工作
2. **类型检查**：使用TypeScript严格模式确保类型安全
3. **测试覆盖**：确保类型变更不影响现有功能
4. **文档更新**：及时更新相关API文档

## 常见问题

### Q: 为什么使用 `_id` 而不是 `id`？
A: 这是MongoDB的标准字段名，保持与数据库一致性。

### Q: 如何处理现有的 `id` 字段？
A: 在兼容层中保留，但新代码应使用 `_id`。

### Q: 什么时候使用 `UserSummary` vs `User`？
A: `UserSummary` 用于列表显示，`User` 用于详细信息。

### Q: 如何确保前后端类型一致？
A: 后端模型的 `toJSON()` 方法自动转换为前端类型。

## 相关文件

- `shared/types/user-unified.ts` - 统一类型定义
- `backend/src/models/User.ts` - 后端用户模型
- `shared/api/types.ts` - API类型定义
- 各个旧类型文件 - 向后兼容层