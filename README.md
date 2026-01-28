# MRJZ - 节奏英雄勺大赛数据统计平台

为"节奏英雄勺大赛"提供专业的数据统计分析平台，包含比赛详情、选手数据、成就系统等功能。

## 技术栈

### 前端
- React 18
- React Router
- Ant Design
- Axios
- Vite

### 后端
- Node.js + Express.js
- Sequelize (MySQL ORM)
- node-cron (定时任务)
- OpenDota API / Steam API

### 数据库
- MySQL 8.0 / MariaDB

## 项目结构

```
MRJZ/
├── aio/                 # All-in-One Docker 构建文件
├── backend/             # Node.js 后端服务
│   ├── src/
│   │   ├── config/      # 配置文件
│   │   ├── models/      # Sequelize 模型
│   │   ├── controllers/ # 控制器
│   │   ├── routes/      # 路由
│   │   ├── services/    # 业务逻辑
│   │   └── jobs/        # 定时任务
├── frontend/            # React 前端
│   ├── src/
│   │   ├── components/  # 通用组件
│   │   ├── pages/       # 页面组件
└── docker-compose.yml   # Docker 部署配置
```

## 快速开始

### 🐳 方式 1: All-in-One Docker 部署（推荐）

本项目采用 **All-in-One (三合一)** 容器架构，将前端(Nginx)、后端(Node.js)和数据库(MariaDB)打包在一个容器中，极大简化了部署流程，特别适合 NAS 部署。

**前置要求**: 只需安装 [Docker Desktop](https://www.docker.com/products/docker-desktop)

1. **准备配置文件**
   在项目根目录创建一个 `.env` 文件（或直接修改 `docker-compose.yml` 中的环境变量）：
   ```bash
   # Steam API Key (必填，从 https://steamcommunity.com/dev/apikey 获取)
   STEAM_API_KEY=你的SteamWebAPIKey
   
   # 联赛 ID (默认 18365)
   LEAGUE_ID=18365
   ```

2. **启动服务**
   ```bash
   docker-compose up -d
   ```

3. **访问应用**
   容器启动后（首次启动需等待数据库初始化），访问：
   - **前端**: http://localhost:5173
   - **数据库数据**: 自动持久化在 Docker 卷 `mrjz-data` 中

---

### 💻 方式 2: 传统部署

#### 环境要求

- Node.js >= 16
- MySQL >= 8.0
- npm 或 yarn

#### 🗄️ 数据库准备 (重要)

在启动后端之前，必须手动设置本地 MySQL 数据库：

1. 确保 MySQL 服务已运行 (推荐版本 8.0+)
2. 连接到 MySQL 并执行以下脚本：
```bash
# 1. 创建数据库
source database/init.sql

# 2. 创建表结构
source database/tables.sql
```

#### 后端启动

```bash
cd backend
npm install

# 配置环境变量 (必须)
cp .env.example .env
# ⚠️ 编辑 .env 文件，填入你的 MySQL 密码 和 Steam API Key
# nano .env 

npm start
```

服务器将在 `http://localhost:3001` 启动

#### 前端启动

```bash
cd frontend
npm install
npm run dev
```

前端将在 `http://localhost:5173` 启动

---

## API 文档

### 基础信息

**Base URL**: `http://localhost:3001/api`

**响应格式**: JSON

### 比赛相关 API

#### 1. 获取比赛列表

```
GET /api/matches?league_id={leagueId}&page={page}&pageSize={pageSize}
```

#### 2. 获取比赛详情

```
GET /api/matches/:matchId
```

#### 3. 强制刷新比赛数据 (管理功能)

```
POST /api/matches/force-refresh?league_id={leagueId}
```

### 选手相关 API

#### 1. 获取选手列表
```
GET /api/players?page={page}&pageSize={pageSize}
```

#### 2. 获取选手详情
```
GET /api/players/:playerId
```

#### 3. 获取选手英雄统计
```
GET /api/players/:playerId/heroes
```

---

## 功能特性

- ✅ 比赛详情展示（参考 Dotabuff）
  - 完整的玩家数据（KDA、GPM、XPM、伤害等）
  - 经济数据（正补、反补、净值）
  - 装备显示（主装备、背包、中立物品）
  - 路线信息
- ✅ 全部比赛列表（支持分页和筛选）
- ✅ 选手详情页面（统计数据、英雄池）
- ✅ 成就系统（8种成就类型）
- ✅ 数据同步功能
  - 增量同步（只同步新比赛）
  - 强制刷新（删除后重新同步）
  - 定时自动同步（每天晚上10点）
- ✅ 移动端适配
  - 支持手机浏览，表格横向滚动

---

## 维护与更新

### 英雄资源更新

当 Dota 2 发布新英雄时，使用以下脚本更新英雄头像和映射：

```bash
cd frontend
npm run update-heroes
```

### 数据库维护

如果 Docker 部署遇到数据库问题，可以尝试重置数据卷：
```bash
docker-compose down
docker volume rm mrjz_mrjz-data
docker-compose up -d
```

### 🧹 清除数据并重新部署

如果您需要彻底清除旧数据（清空数据库）并重新部署最新代码，请在 NAS 终端或命令行中执行以下步骤：

1. **停止服务并删除容器**
   ```bash
   docker-compose down
   ```

2. **删除旧数据库卷** (这一步会永久删除所有历史数据！)
   ```bash
   docker volume rm mrjz_mrjz-data
   ```
   *注意：如果您的文件夹名不是 `mrjz`，卷名可能是 `文件夹名_mrjz-data`。可以使用 `docker volume ls` 查看准确名称。*

3. **拉取最新代码**
   ```bash
   git pull
   ```

4. **重新构建并启动**
   ```bash
   docker-compose up -d --build
   ```

---

## 📅 版本历史

### v1.0.2 (2026-01-28)
- **UI 优化**: 升级了选手页面的 UI 展示（添加战队标识）

### v1.0.1 (2026-01-28)
- **新特性: 选手统计页面**:
  - 全新的选手数据列表 (`/players`)
  - 完整的数据展示：KDA、胜率、GPM/XPM、场均伤害/承伤等
- **UI 优化**:
  - 统一了所有页面的空数据状态 (`NoData` 组件)
  - 优化了深色模式下的背景显示
- **后端增强**:
  - 数据库新增 `damage_taken`（承伤）字段支持
  - 优化分页与数据聚合逻辑

### v1.0.0 (2026-01-26)
- **All-in-One 架构**: 单容器部署所有服务
- **移动端适配**: 优化手机端浏览体验
- **自动化**: 自动修复数据库兼容性问题


## 许可证

MIT
