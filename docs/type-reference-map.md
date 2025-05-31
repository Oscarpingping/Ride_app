# 用户类型引用关系图

## 新的类型系统架构

```
shared/types/user-unified.ts (核心定义)
├── BaseUser (基础接口)
├── User (完整用户信息)
├── UserSummary (简要信息)
├── UserPublic (公开信息)
├── SocketUser (Socket连接)
├── AuthUser (认证信息)
└── 工具函数 (类型转换和守卫)
```

## 文件引用关系

### 核心定义文件
- `shared/types/user-unified.ts` - 所有用户类型的统一定义

### 兼容层文件
- `shared/types/user.ts` → 重新导出 `user-unified.ts`
- `shared/types/entities.ts` → 继承 `BaseUser`
- `shared/types/socket.ts` → 继承 `SocketUser`
- `shared/types/common.ts` → 保留兼容接口
- `shared/types/contact.ts` → 联系人类型定义
- `types/ride.ts` → 保留兼容接口

### API层文件
- `shared/api/types.ts` → 使用 `AuthUser`, `LoginRequest` 等

### 后端文件
- `backend/src/models/User.ts` → 导入统一类型，实现转换方法

## 使用场景映射

| 使用场景 | 推荐类型 | 文件位置 |
|---------|---------|----------|
| 用户详情页面 | `User` | `shared/types/user-unified.ts` |
| 用户列表显示 | `UserSummary` | `shared/types/user-unified.ts` |
| 公开用户信息 | `UserPublic` | `shared/types/user-unified.ts` |
| Socket连接 | `SocketUser` | `shared/types/user-unified.ts` |
| 登录响应 | `AuthUser` | `shared/types/user-unified.ts` |
| 联系人管理 | `Contact` | `shared/types/contact.ts` |
| 数据库模型 | `IUser` | `backend/src/models/User.ts` |

## 导入示例

### 推荐的导入方式

```typescript
// 前端组件
import { User, UserSummary, toUserSummary } from '../shared/types/user-unified';

// API层
import { AuthUser, LoginRequest, RegisterRequest } from '../shared/types/user-unified';

// Socket层
import { SocketUser, UserStatus, toSocketUser } from '../shared/types/user-unified';

// 联系人管理
import { Contact } from '../shared/types/contact';
```

### 兼容性导入（逐步迁移）

```typescript
// 仍然可以使用，但会重新导出统一类型
import { User, UserState } from '../shared/types/user';
import { User } from '../shared/types/entities';
```

## 类型转换流程

```
数据库 (IUser) 
    ↓ toJSON()
前端完整类型 (User)
    ↓ toUserSummary()
列表显示 (UserSummary)
    ↓ toUserPublic()
公开信息 (UserPublic)
    ↓ toSocketUser()
Socket连接 (SocketUser)
    ↓ toAuthUser()
认证信息 (AuthUser)
```

## 字段映射表

| 统一字段名 | 旧字段名 | 说明 |
|-----------|---------|------|
| `_id` | `id` | MongoDB标准ID |
| `name` | `username` | 用户姓名 |
| `avatar` | `profilePicture` | 头像URL |
| `createdAt` | - | 创建时间 |
| `updatedAt` | - | 更新时间 |

## 迁移优先级

### 高优先级（立即迁移）
1. 新功能开发
2. API响应类型
3. 核心用户操作

### 中优先级（逐步迁移）
1. 现有组件更新
2. 工具函数重构
3. 测试用例更新

### 低优先级（可选迁移）
1. 旧的兼容代码
2. 临时脚本
3. 开发工具

## 验证检查

### TypeScript编译检查
```bash
npx tsc --noEmit
```

### 类型一致性检查
```typescript
// 确保前后端类型一致
const user: IUser = await User.findById(id);
const frontendUser: User = user.toJSON();
```

### 导入检查
```bash
# 查找所有用户类型导入
grep -r "import.*User" --include="*.ts" --include="*.tsx" .
```

## 注意事项

1. **渐进式迁移**：不需要一次性迁移所有文件
2. **向后兼容**：旧的导入方式仍然有效
3. **类型安全**：使用TypeScript严格模式
4. **测试覆盖**：确保类型变更不破坏功能
5. **文档同步**：及时更新相关文档

## 相关工具

### 类型检查工具
- TypeScript编译器
- ESLint类型规则
- IDE类型提示

### 迁移工具
- 全局搜索替换
- AST转换工具
- 自动化重构脚本