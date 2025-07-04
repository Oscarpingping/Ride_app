# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.


一、项目说明
这个项目是要开发一款可以在iOS和Andriod上兼容运行的app，实现riding活动社交管理:
1,管理活动创建、活动发帖、俱乐部展示，用户间即时消息和群聊;
至少包括如下模块：
a，主页面home展示已公开发布的户外活动招募，基于活动的发帖及互动；
b，message页面里支持注册用户之间私聊和聊天室群聊，聊天室由俱乐部创建者创建俱乐部专属的聊天室，或活动者建立活动时建某个活动的聊天室等；
c,注册成员可以在creat页面创建活动，分为公开活动或私密活动，公开活动对所有人可见，私密活动只在创建者指定的俱乐部内可见，活动创建人已经是俱乐部成员的前提下；在创建私有活动时，活动创建者可以邀请非俱乐部他人参加。；
d，club页面，根据用户位置展示附近各俱乐部，包括简介、创始人，管理员，成员数量、组织的活动数量等，打开俱乐部可展示最近发起的活动，
用户在此可以申请加入俱乐部，申请会进入俱乐部创建人和管理员的消息窗口，等待批准或拒绝；
e，profile页面内展示个人发起的活动和参与的活动，个人保存的联系人和已加入的俱乐部，支持用户profile管理，页面展示"我的活动"，"我的联系人"，"我的俱乐部"三个子页面。
在"我的联系人"里面按照用户name字母顺序排列已添加的联系人，并可新增联系人；在"我的俱乐部"里展示该用户已创建、管理和加入的俱乐部（创建人和管理人可以是同一人），
用户可以在这里创建俱乐部（以后这个权限需要根据用户的级别授予），创建俱乐部时可选建立专属的聊天室，新成员加入俱乐部即刻加入聊天室；
f，打开message页面，列出用户最近（按时间先后顺序）聊过的联系人和聊天室。打开其中的某个聊天，聊天页面从后端数据库调取最近的聊天记录，聊天消息包括：文字、有大小限制的图片和视频、语音、文件、其它app分享的位置信息url。除了俱乐部专属聊天室，
支持1对1聊天，但是发起人必须得到接收者的接受成为联系人聊天记录可以保存，打招呼的消息会被定期清理；
g，用户登录过程：用户首次打开app会跳出welcome界面可选择login 或register，
分别引导用户进入登录或注册页面。已登录用户打开app应通过logme机制自动登录用户，
除非用户本地存储的登录状态token已失效，此时跳出用户登录页面。支持通过用户邮箱重置密码。


1，类型定义
使用 TypeScript 接口和类型
清晰的类型层次结构
类型复用和组合
2，API 设计
RESTful 风格
统一的端点管理
类型安全的请求/响应
3，工具函数
纯函数设计
单一职责
可测试性
4，配置管理
环境变量管理
类型安全的配置
开发/生产环境分离

设置share的目录这种设计方式确保了：
代码的可维护性
类型安全
前后端一致性
开发效率
代码复用

三、项目使用的技术栈
前端技术栈：
核心框架：
React Native (0.76.9)
Expo (52.0.46)
TypeScript


UI组件：
React Native Paper (Material Design组件库)
Expo Vector Icons
React Native Maps (地图功能)
React Native Reanimated (动画)
功能模块：
Expo Location (位置服务)
React Native Gesture Handler (手势处理)
AsyncStorage (本地存储)
Google Sign-In (Google登录)
后端技术栈：
服务器：
Express.js
MongoDB (mongoose)
JWT (身份验证)
Firebase (可能用于实时功能)

## 2024-03-26 导航结构优化和页面重组

### 主要目的
优化 WildPals App 的导航结构和页面组织，提升用户体验。

### 完成的主要任务
1. 删除了不需要的 `explore.tsx` 文件
2. 重组了页面文件结构：
   - 创建了 `messages.tsx`，实现消息列表功能
   - 创建了 `profile.tsx`，实现用户个人资料页面
   - 创建了 `clubs.tsx`，实现俱乐部列表页面

### 关键决策和解决方案
1. 采用了 React Native Paper 组件库来构建统一的 UI 界面
2. 实现了搜索、筛选和刷新等常用功能
3. 添加了适当的加载状态和错误处理
4. 使用了 FAB (Floating Action Button) 来优化用户操作体验

### 使用的技术栈
- React Native
- React Native Paper
- Expo Router
- TypeScript
- date-fns (日期处理)

### 修改的文件
- 删除: `app/(tabs)/explore.tsx`
- 新建: `app/(tabs)/messages.tsx`
- 新建: `app/(tabs)/profile.tsx`
- 新建: `app/(tabs)/clubs.tsx`
- 更新: `README.md`

# 数据模型管理规范

## 使用 Prisma 的条件
- 变更频率 > 2次/周
- 需要复杂查询
- 涉及全栈类型安全

## 保持 Mongoose 的条件
- 变更频率 < 1次/月  
- 简单 CRUD 操作
- 历史代码依赖性强

## 性能对比示例
const benchmark = async () => {
  // Prisma 查询
  const prismaStart = Date.now()
  await prisma.ride.findMany()
  const prismaTime = Date.now() - prismaStart

  // Mongoose 查询
  const mongooseStart = Date.now()
  await RideModel.find()
  const mongooseTime = Date.now() - mongooseStart

  console.table([
    { ORM: 'Prisma', Time: `${prismaTime}ms` },
    { ORM: 'Mongoose', Time: `${mongooseTime}ms` }
  ])
}

graph TD
    A[数据模型] --> B{变更频率}
    B -->|高频变更| C[Ride - Prisma]
    B -->|低频变更| D[User/Club - Mongoose]
    C --> E[优势: 快速迭代/类型安全]
    D --> F[优势: 稳定/减少迁移成本]

# 1. 安装依赖
npm install prisma @prisma/client

# 2. 初始化 Prisma
npx prisma init --datasource-provider mongodb

# 3. 配置.env
echo 'DATABASE_URL="mongodb://your-mongo-uri"' >> .env

npx prisma generate

## 2024-12-19 Socket.IO 调试信息清理

### 主要目的
清理 Socket.IO 相关的调试日志信息，减少控制台输出噪音，提升开发体验。

### 完成的主要任务
1. 注释掉了后端 Socket.IO 服务器的连接调试信息
2. 关闭了前端 Socket 连接状态的调试日志
3. 保留了错误日志用于问题排查

### 关键决策和解决方案
1. 将频繁的连接日志改为注释状态，便于需要时启用调试
2. 保留了 `console.error` 错误日志，确保问题排查能力
3. 统一处理了前后端的 Socket 调试信息

### 使用的技术栈
- Socket.IO (后端)
- Socket.IO Client (前端)
- TypeScript

### 修改的文件
- `backend/src/socket.ts` - 注释了 6 处 Socket.IO 调试日志
- `app/messages/[chatRoomId].tsx` - 注释了 2 处 Socket 连接状态日志
- `shared/services/socket.ts` - 注释了 2 处 Socket 连接状态日志

## 2024-12-19 Profile 页面 Club 卡片布局优化

### 主要目的
优化 Profile 页面中 MyClubGrid 组件的卡片布局，增加卡片宽度和 logo 大小，提升视觉效果和用户体验。

### 完成的主要任务
1. 增加了 club card 的宽度和高度，更好地适应屏幕宽度
2. 放大了 club logo 的尺寸，从 48x48 增加到 60x60
3. 调整了卡片间距和内边距，提升整体布局美观度
4. 优化了文字大小和间距，提升可读性

### 关键决策和解决方案
1. 将卡片边距从 8px 增加到 12px，提供更好的视觉分离
2. 卡片高度从 180px 增加到 200px，为更大的 logo 和文字提供空间
3. logo 尺寸增加 25%，从 48x48 增加到 60x60，提升视觉重要性
4. 调整了内边距和圆角，保持设计一致性

### 使用的技术栈
- React Native
- React Native Paper
- TypeScript
- StyleSheet

### 修改的文件
- `app/(profile)/MyClubGrid.tsx` - 调整了卡片尺寸和间距常量
- `app/components/MiniClubCard.tsx` - 优化了卡片样式、logo 尺寸和文字布局
- `app/(tabs)/profile/index.tsx` - 调整了 section 和 clubsContainer 的内边距，优化整体布局

## 2024-12-19 聊天室类型定义重构和安全性优化

### 主要目的
解决聊天室类型定义中的联合类型问题，提升类型安全性和代码可维护性。

### 完成的主要任务
1. **重构类型定义架构**：
   - 创建了 `ChatRoomDB` 类型用于数据库存储（只包含ID引用）
   - 创建了 `ChatRoom` 类型用于API响应（包含populated数据）
   - 创建了 `ChatRoomItem` 类型用于消息列表显示
   - 移除了不安全的联合类型 `club: string | object`

2. **优化前端代码**：
   - 更新了消息页面使用新的 `ChatRoomItem` 类型
   - 简化了logo获取逻辑，移除了复杂的类型判断
   - 修正了字段名使用，统一使用 `lastMessageId` 而不是 `lastMessage`

3. **提升类型安全性**：
   - 消除了运行时类型检查的需求
   - 减少了代码复杂度和维护成本
   - 提供了明确的类型边界

### 关键决策和解决方案
1. **类型分离策略**：将数据库存储类型和API响应类型明确分离，避免联合类型带来的类型不安全问题
2. **字段标准化**：统一使用后端实际返回的字段名，确保前后端数据一致性
3. **渐进式重构**：保持向后兼容性，逐步迁移到新的类型定义

### 使用的技术栈
   - TypeScript 类型系统
- React Native
- Mongoose (后端数据模型)
- Express.js API

### 修改的文件
- `shared/types/club.ts` - 重构了ChatRoom相关类型定义
- `app/(tabs)/messages/index.tsx` - 更新了消息页面使用新的类型定义
- `README.md` - 添加了本次会话总结

