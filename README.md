# 每日节奏英雄勺大赛 (MRJZ) - 赛事数据统计系统

这是一个基于 OpenDota API 开发的 Dota 2 赛事数据统计系统，专为"每日节奏英雄勺大赛"定制。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Docker](https://img.shields.io/badge/docker-supported-blue)

## ✨ 主要功能

- **自动化数据同步**：支持一键从 OpenDota API 同步联赛比赛数据。
- **比赛列表管理**：清晰的比赛列表，包含比赛结果、胜负方、持续时间等信息。
- **比赛详情深度解析**：
    - **选手数据**：KDA、经济(GPM/XPM)、补刀(LH/D)、伤害输出、治疗量等。
    - **出装分析**：直观展示选手的主装备、背包物品和中立装备。
    - **移动端适配**：完美支持手机浏览器，支持表格横向滚动和响应式布局。
- **自动成就系统**：
    - 自动识别并展示"MVP"、"输出机器"、"最佳辅助"等成就标签。
    - 支持手动请求 OpenDota 解析比赛以获取进阶成就数据。
- **一键部署**：提供 All-in-One Docker 镜像，NAS 用户友好。

## 🚀 快速开始 (Docker 部署)

本项目采用 **All-in-One (三合一)** 容器架构，将前端(Nginx)、后端(Node.js)和数据库(MariaDB)打包在一个容器中，极大简化了部署流程。

### 1. 准备配置文件

在项目根目录创建一个 `.env` 文件（或直接修改 `docker-compose.yml` 中的环境变量）：

```bash
# Steam API Key (必填，从 https://steamcommunity.com/dev/apikey 获取)
STEAM_API_KEY=你的SteamWebAPIKey

# 联赛 ID (默认 18365)
LEAGUE_ID=18365

# Stratz API Token (可选，用于获取更详细的解析数据)
STRATZ_API_TOKEN=你的StratzToken
```

### 2. 启动服务

使用 Docker Compose 一键启动：

```bash
docker-compose up -d
```

启动可能需要几分钟（第一次会初始化数据库）。容器启动后，访问：

**http://localhost:5173**

### 3. 数据持久化

所有数据库数据保存在 Docker 卷 `mrjz-data` 中，重启或更新容器不会丢失数据。

如果需要重置数据库（例如备份恢复失败时），可以执行：
```bash
# 停止容器
docker-compose down
# 删除数据卷
docker volume rm mrjz_mrjz-data
# 重新启动
docker-compose up -d
```

## 🛠️ 本地开发

如果你想在本地开发或贡献代码：

### 环境要求
- Node.js 18+
- MySQL 8.0+ / MariaDB 10.5+

### 安装与启动

1.  **后端**
    ```bash
    cd backend
    npm install
    npm start
    ```

2.  **前端**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

## 📂 项目结构

```
.
├── aio/                # All-in-One Docker 构建文件
├── backend/            # Node.js 后端服务 (Express + Sequelize)
├── frontend/           # React 前端应用 (Vite + Ant Design)
├── database/           # 数据库初始化 SQL 脚本
└── docker-compose.yml  # Docker 部署配置
```

## 📝 常见问题

**Q: 点击刷新没有任何反应？**
A: 请检查后端日志。如果是第一次部署，可能需要手动点击一次页面右上角的"同步"按钮来拉取历史数据。

**Q: 比赛详情页白屏？**
A: 这是一个已知问题，已在最新版修复。请确保拉取了最新的代码并重建了镜像。

**Q: 手机上表格显示不全？**
A: 最新版已经适配了移动端，表格支持左右滑动查看完整数据。

## 📄 开源协议

MIT License
