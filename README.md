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
1,管理活动创建、活动发帖、用户间即时消息和群聊;
至少包括如下模块：
a，主页面home展示已公开发布的户外活动招募，基于活动的发帖及互动；
b，注册成员可以创建发起公开活动或私密活动，公开活动对所有人可见，私密活动只有创建者指定的成员可以看到；
c，支持组织者将活动参与者拉群聊，群员之间可以私聊等；
d，个人页面内展示个人发起的活动和参与的活动，支持用户profile管理；
e，在个人页面"设置"上方增加"我的好友"，点开我的好友页面，里面按照用户name字母顺序排列已添加的好友，
支持该用户添加每个好友的描述字段保留在该用户数据库里，通过好友的数据库ID进行索引，但不保留好友的其它信息。
用户在home页面点击"orgnized by"提示用户添加好友，"好友"添加到"我的好友"页面。
f，主界面home左边的图标打开message页面，列出用户最近（按时间先后顺序）聊过的好友和群。
打开其中的某个好友聊天，出现与该好友的聊天页面，聊天页面从后端数据库调取最近的聊天记录，
用户也可以通过点击"我的好友"中的好友打开该聊天页面。
g，在创建活动时，活动创建者可以点击页面中的"建群聊"建个聊天群，或选择当前自己所在的一个聊天群，
打开聊天群进入此聊天群的聊天室，从后端数据库调取最近的聊天记录。




项目结构：
项目设计采用前后端分离设计，前端app采用React Native + Expo；后端采用Node.js+Express+mongoDB，项目结构如下：

```
├── app/                    # 主要应用代码
│   ├── components/        # 可复用组件
│   ├── context/          # Context相关
│   ├── hooks/            # 自定义Hooks
│   ├── services/         # API服务
│   ├── types/            # TypeScript类型定义
│   ├── constants/        # 常量定义
│   └── (tabs)/           # 标签页相关组件
├── backend/              # 后端服务代码
├── shared/              # 前后端共享代码
├── assets/              # 静态资源
└── scripts/             # 工具脚本

其中，shared 目录的设计体现了现代前端工程化的最佳实践，是一个很好的参考示例。

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