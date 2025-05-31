# 数据模型定义文档

## 用户数据模型

### 基础用户信息 (BaseUser)
```typescript
interface BaseUser {
  _id: string;          // 用户唯一标识
  name: string;         // 用户名称
  email: string;        // 用户邮箱
  avatar?: string;      // 用户头像
  createdAt: Date;      // 创建时间
  updatedAt: Date;      // 更新时间
}
```

### 完整用户信息 (User)
```typescript
interface User extends BaseUser {
  bio?: string;                     // 个人简介
  rating?: number;                  // 用户评分
  ridesJoined?: number;            // 参与骑行次数
  ridesCreated?: number;           // 创建骑行次数
  createdRides?: string[];         // 创建的骑行活动ID列表
  joinedRides?: string[];          // 参与的骑行活动ID列表
  clubs?: ClubReference[];         // 加入的俱乐部列表
  createdClubs?: string[];         // 创建的俱乐部ID列表
  managedClubs?: string[];         // 管理的俱乐部ID列表
  canCreateClub: boolean;          // 创建俱乐部权限
  emergencyContact?: EmergencyContact; // 紧急联系人
  password?: never;                // 密码字段（仅后端使用）
}
```

### 用户公开信息 (UserPublic)
```typescript
interface UserPublic extends BaseUser {
  bio?: string;                     // 个人简介
  rating?: number;                  // 用户评分
  ridesJoined?: number;            // 参与骑行次数
  ridesCreated?: number;           // 创建骑行次数
  createdClubs?: string[];         // 创建的俱乐部ID列表
  managedClubs?: string[];         // 管理的俱乐部ID列表
}
```

### 认证用户信息 (AuthUser)
```typescript
interface AuthUser {
  _id: string;          // 用户ID
  email: string;        // 用户邮箱
  name: string;         // 用户名称
  avatar?: string;      // 用户头像
  canCreateClub: boolean; // 创建俱乐部权限
  rating?: number;      // 用户评分
  createdClubs?: string[]; // 创建的俱乐部列表
  managedClubs?: string[]; // 管理的俱乐部列表
}
```

### 紧急联系人 (EmergencyContact)
```typescript
interface EmergencyContact {
  name: string;    // 联系人姓名
  phone: string;   // 联系人电话
}
```

## 俱乐部数据模型

### 俱乐部信息 (Club)
```typescript
interface Club {
  _id: string;                    // 俱乐部ID
  name: string;                   // 俱乐部名称
  description: string;            // 俱乐部描述
  logo?: string;                  // 俱乐部logo
  coverImage?: string;            // 俱乐部封面图片
  type: ClubType;                 // 俱乐部类型
  founder: string;                // 创始人ID
  admins: string[];               // 管理员ID列表
  members: string[];              // 成员ID列表
  location: {                     // 位置信息
    city: string;
    province: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    }
  };
  stats: {                        // 统计信息
    memberCount: number;          // 成员数量
    activityCount: number;        // 活动数量
  };
  rules: string[];               // 俱乐部规则
  tags: string[];                // 标签
  isPrivate: boolean;            // 是否私有俱乐部
  joinRequests: {                // 加入请求
    pending: JoinRequest[];      // 待处理请求
    history: JoinRequestHistory[]; // 历史请求
  };
  createdAt: Date;               // 创建时间
  updatedAt: Date;               // 更新时间
}
```

### 俱乐部类型 (ClubType)
```typescript
type ClubType = 'biking' | 'climbing' | 'hiking' | 'skiing' | 'surfing' | 'running' | 'camping';
```

### 加入请求 (JoinRequest)
```typescript
interface JoinRequest {
  user: {                        // 申请用户信息
    _id: string;
    name: string;
    avatar?: string;
  };
  message?: string;              // 申请留言
  createdAt: string;            // 申请时间
}
```

### 加入请求历史 (JoinRequestHistory)
```typescript
interface JoinRequestHistory extends JoinRequest {
  status: 'approved' | 'rejected';  // 处理状态
  response?: string;                // 处理回复
  handledBy: {                      // 处理人信息
    _id: string;
    name: string;
    avatar?: string;
  };
  handledAt: string;               // 处理时间
}
```

## 联系人数据模型

### 联系人关系 (Contact)
```typescript
interface Contact {
  _id: string;           // 联系人关系ID
  userId: string;        // 用户ID
  contactId: string;     // 联系人ID
  contact: UserSummary;  // 联系人信息
  createdAt: Date;       // 创建时间
  updatedAt: Date;       // 更新时间
}
```

## 数据关系说明

1. 用户与俱乐部的关系：
   - 用户可以创建多个俱乐部（createdClubs）
   - 用户可以管理多个俱乐部（managedClubs）
   - 用户可以加入多个俱乐部（clubs）
   - 俱乐部可以有多个成员（members）
   - 俱乐部可以有多个管理员（admins）

2. 用户与联系人的关系：
   - 用户可以添加多个联系人
   - 联系人关系是双向的（A是B的联系人，B也是A的联系人）
   - 联系人信息包含基本的用户摘要信息

3. 用户与骑行活动的关系：
   - 用户可以创建多个骑行活动（createdRides）
   - 用户可以参与多个骑行活动（joinedRides）
   - 用户有骑行相关的统计数据（ridesCreated, ridesJoined）

## 权限控制

1. 俱乐部创建权限：
   - 通过 `canCreateClub` 字段控制
   - 默认值为 false
   - 需要管理员手动开启或通过算法自动更新

2. 俱乐部管理权限：
   - 创始人自动成为管理员
   - 管理员可以管理成员和内容
   - 私有俱乐部需要申请加入

3. 联系人管理：
   - 用户可以自由添加/删除联系人
   - 不需要对方确认
   - 主要用于快速联系和紧急情况 