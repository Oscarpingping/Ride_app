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
e，在个人页面“设置”上方增加“我的好友”，点开我的好友页面，里面按照用户name字母顺序排列已添加的好友，
支持该用户添加每个好友的描述字段保留在该用户数据库里，通过好友的数据库ID进行索引，但不保留好友的其它信息。
用户在home页面点击“orgnized by”提示用户添加好友，“好友”添加到“我的好友”页面。
f，主界面home左边的图标打开message页面，列出用户最近（按时间先后顺序）聊过的好友和群。
打开其中的某个好友聊天，出现与该好友的聊天页面，聊天页面从后端数据库调取最近的聊天记录，
用户也可以通过点击“我的好友”中的好友打开该聊天页面。
g，在创建活动时，活动创建者可以点击页面中的“建群聊”建个聊天群，或选择当前自己所在的一个聊天群，
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