# MRJZ 项目创建实施计划

## 项目概述

创建 MRJZ（节奏英雄勺大赛数据统计平台）的完整项目结构，包括前端、后端和数据库。

## 项目结构

```
MRJZ/
├── frontend/              # React TypeScript 前端
│   ├── src/
│   │   ├── pages/        # 页面组件
│   │   ├── components/   # 通用组件
│   │   ├── services/     # API 调用
│   │   ├── hooks/        # 自定义 Hooks
│   │   ├── utils/        # 工具函数
│   │   ├── types/        # TypeScript 类型定义
│   │   └── App.tsx
│   ├── package.json
│   └── tsconfig.json
│
├── backend/              # Node.js Express 后端
│   ├── src/
│   │   ├── controllers/  # 路由控制器
│   │   ├── services/     # 业务逻辑
│   │   ├── models/       # Sequelize 模型
│   │   ├── utils/        # 工具函数
│   │   ├── middleware/   # 中间件
│   │   ├── jobs/         # 定时任务
│   │   ├── config/       # 配置文件
│   │   └── server.js     # 入口文件
│   ├── package.json
│   └── .env.example
│
├── database/             # 数据库脚本
│   ├── init.sql         # 初始化脚本
│   ├── tables.sql       # 建表脚本
│   └── seed.sql         # 测试数据
│
└── README.md
```

## 实施步骤

### Phase 1: 前端项目初始化 ✅

**已完成**:
- ✅ 创建 React TypeScript 应用（使用 create-react-app）

**待完成**:
1. 安装依赖包
   ```bash
   npm install antd axios react-router-dom react-query
   npm install @types/react-router-dom --save-dev
   ```

2. 创建基础目录结构
   - src/pages/
   - src/components/
   - src/services/
   - src/hooks/
   - src/utils/
   - src/types/

3. 配置路由和基础布局

### Phase 2: 后端项目初始化

1. 初始化 Node.js 项目
   ```bash
   cd backend
   npm init -y
   ```

2. 安装核心依赖
   ```bash
   npm install express sequelize mysql2 dotenv cors
   npm install axios node-cron
   npm install --save-dev nodemon
   ```

3. 创建项目结构
   - src/controllers/
   - src/services/
   - src/models/
   - src/utils/
   - src/middleware/
   - src/jobs/
   - src/config/

4. 创建配置文件
   - .env.example
   - src/config/database.js
   - src/config/steam.js

5. 创建入口文件 server.js

### Phase 3: 数据库脚本创建

1. 创建数据库初始化脚本（init.sql）
   - 创建数据库
   - 设置字符集

2. 创建建表脚本（tables.sql）
   - matches 表
   - players 表
   - match_players 表
   - heroes 表
   - achievements 表
   - api_keys 表
   - sync_logs 表

3. 创建测试数据脚本（seed.sql）
   - 插入测试英雄数据
   - 插入测试 API Key

## 技术栈详情

### 前端
- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Ant Design** - UI 组件库
- **React Router** - 路由管理
- **React Query** - 数据获取和缓存
- **Axios** - HTTP 客户端

### 后端
- **Node.js** - 运行环境
- **Express.js** - Web 框架
- **Sequelize** - MySQL ORM
- **node-cron** - 定时任务
- **axios** - Steam API 调用
- **dotenv** - 环境变量管理
- **cors** - 跨域支持

### 数据库
- **MySQL 8.0** - 关系型数据库

## 配置文件

### 后端 .env.example
```env
# 服务器配置
PORT=3001
NODE_ENV=development

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=mrjz
DB_USER=root
DB_PASSWORD=your_password

# Steam API
STEAM_API_KEY=your_steam_api_key
LEAGUE_ID=your_league_id

# 定时任务
SYNC_CRON=0 22 * * *
```

### 前端 .env
```env
REACT_APP_API_URL=http://localhost:3001
```

## 验证计划

### 1. 前端验证
```bash
cd frontend
npm start
```
**预期结果**: 
- 开发服务器启动在 http://localhost:3000
- 浏览器自动打开并显示 React 默认页面
- 无编译错误

### 2. 后端验证
```bash
cd backend
npm run dev
```
**预期结果**:
- 服务器启动在 http://localhost:3001
- 控制台显示 "Server running on port 3001"
- 数据库连接成功

### 3. 数据库验证
```bash
mysql -u root -p < database/init.sql
mysql -u root -p mrjz < database/tables.sql
```
**预期结果**:
- 数据库 mrjz 创建成功
- 7个表创建成功
- 可以查询表结构

### 4. API 测试
```bash
curl http://localhost:3001/api/health
```
**预期结果**:
- 返回 `{"status": "ok"}`

## 注意事项

1. **Node.js 版本**: 使用 v18.12.0（已安装）
2. **MySQL 版本**: 使用 8.0.44（已安装）
3. **端口占用**: 
   - 前端: 3000
   - 后端: 3001
   - MySQL: 3306
4. **Steam API Key**: 需要从 Steam 官网申请

## 下一步计划

项目结构创建完成后：
1. 实现比赛详情页面
2. 实现成就系统
3. 实现数据同步功能
4. 实现管理后台
