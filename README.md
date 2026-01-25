# MRJZ - 节奏英雄勺大赛数据统计平台

## 项目简介

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
- MySQL 8.0

## 项目结构

```
MRJZ/
├── backend/              # Node.js 后端
│   ├── src/
│   │   ├── config/      # 配置文件
│   │   ├── models/      # Sequelize 模型
│   │   ├── controllers/ # 控制器
│   │   ├── routes/      # 路由
│   │   ├── services/    # 业务逻辑
│   │   ├── jobs/        # 定时任务
│   │   └── middleware/  # 中间件
│   ├── migrations/      # 数据库迁移
│   └── tests/           # 测试脚本
└── frontend/            # React 前端
    ├── src/
    │   ├── components/  # 通用组件
    │   ├── pages/       # 页面组件
    │   ├── services/    # API 服务
    │   └── utils/       # 工具函数
    └── public/          # 静态资源
```

## 快速开始

### 🐳 方式 1: Docker 部署（推荐）

**前置要求**: 只需安装 [Docker Desktop](https://www.docker.com/products/docker-desktop)

```bash
# 1. 克隆项目
git clone https://github.com/HuangLA/mrjz-dota2-tournament-stats.git
cd mrjz-dota2-tournament-stats

# 2. 配置环境变量
cp .env.example .env
nano .env  # 填写 STEAM_API_KEY 和数据库密码

# 3. 启动所有服务
docker-compose up -d

# 4. 访问应用
# 前端: http://localhost:5173
# 后端: http://localhost:3001
```

**详细说明**: 查看 [DOCKER.md](DOCKER.md)

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
> 或者使用 DBeaver / Navicat 等工具运行 `database/init.sql` 和 `database/tables.sql`。

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

#### 环境变量配置

在 `backend/.env` 文件中配置：

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
LEAGUE_ID=18365

# 定时任务 (Cron 表达式: 每天晚上10点)
SYNC_CRON=0 22 * * *

# Stratz API (用于详细成就数据)
STRATZ_API_TOKEN=your_stratz_token
```

---

## API 文档

### 基础信息

**Base URL**: `http://localhost:3001/api`

**响应格式**: JSON

**成功响应**:
```json
{
  "success": true,
  "data": { ... }
}
```

**错误响应**:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述"
  }
}
```

---

### 比赛相关 API

#### 1. 获取比赛列表

```
GET /api/matches?league_id={leagueId}&page={page}&pageSize={pageSize}
```

**查询参数**:
- `league_id` (可选): 联赛ID (例如: 17485, 18365)
- `page` (可选): 页码，默认1
- `pageSize` (可选): 每页数量，默认10

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "match_id": 8649037382,
      "league_id": 18365,
      "start_time": 1736933400,
      "duration": 2156,
      "radiant_win": true,
      "radiant_score": 40,
      "dire_score": 19,
      "radiant_team_name": "天辉队伍",
      "dire_team_name": "夜魇队伍",
      "game_mode": 2,
      "players": [...]
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 34,
    "totalPages": 4
  }
}
```

#### 2. 获取比赛详情

```
GET /api/matches/:matchId
```

**路径参数**:
- `matchId`: 比赛ID

**响应示例**:
```json
{
  "success": true,
  "data": {
    "match_id": 8649037382,
    "league_id": 18365,
    "start_time": 1736933400,
    "duration": 2156,
    "radiant_win": true,
    "players": [
      {
        "player_id": 1,
        "hero_id": 1,
        "team": "radiant",
        "kills": 8,
        "deaths": 4,
        "assists": 12,
        "gpm": 456,
        "xpm": 589,
        "last_hits": 403,
        "denies": 15,
        "net_worth": 28603,
        "lane": 1,
        "items": [1, 63, 108, 123, 145, 232],
        "item_backpack_0": 77,
        "item_backpack_1": 41,
        "item_backpack_2": null,
        "item_neutral": 1158,
        "hero_damage": 25678,
        "tower_damage": 3456,
        "hero_healing": 1234,
        "Player": {
          "player_id": 1,
          "nickname": "玩家昵称",
          "avatar_url": "https://..."
        }
      }
    ]
  }
}
```

#### 3. 强制刷新比赛数据 (管理功能)

```
POST /api/matches/force-refresh?league_id={leagueId}
```

**查询参数**:
- `league_id` (必需): 联赛ID

**功能**: 删除指定联赛的所有现有比赛数据，然后从OpenDota API重新拉取

**响应示例**:
```json
{
  "success": true,
  "data": {
    "message": "强制刷新完成",
    "deleted": 4,
    "synced": 4,
    "total": 4,
    "duration": 15.63
  }
}
```

**错误响应**:
```json
{
  "success": false,
  "error": {
    "code": "MISSING_PARAMETER",
    "message": "league_id 参数是必需的"
  }
}
```

---

### 选手相关 API

#### 1. 获取选手列表

```
GET /api/players?page={page}&pageSize={pageSize}
```

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "player_id": 1,
      "steam_id": 123456789,
      "nickname": "玩家昵称",
      "avatar_url": "https://...",
      "total_matches": 25,
      "total_wins": 15,
      "win_rate": 60.0
    }
  ],
  "pagination": { ... }
}
```

#### 2. 获取选手详情

```
GET /api/players/:playerId
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "player_id": 1,
    "steam_id": 123456789,
    "nickname": "玩家昵称",
    "avatar_url": "https://...",
    "stats": {
      "total_matches": 25,
      "total_wins": 15,
      "win_rate": 60.0,
      "avg_kills": 8.5,
      "avg_deaths": 5.2,
      "avg_assists": 12.3,
      "avg_gpm": 456,
      "avg_xpm": 589
    },
    "recent_matches": [...]
  }
}
```

#### 3. 获取选手比赛历史

```
GET /api/players/:playerId/matches?page={page}&pageSize={pageSize}
```

#### 4. 获取选手英雄统计

```
GET /api/players/:playerId/heroes
```

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "hero_id": 1,
      "hero_name": "Anti-Mage",
      "matches_played": 5,
      "wins": 3,
      "win_rate": 60.0,
      "avg_kills": 10.2,
      "avg_deaths": 4.5,
      "avg_assists": 8.3
    }
  ]
}
```

---

### 英雄相关 API

#### 1. 获取英雄列表

```
GET /api/heroes
```

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "hero_id": 1,
      "name": "npc_dota_hero_antimage",
      "localized_name": "Anti-Mage",
      "icon_url": "https://cdn.dota2.com/apps/dota2/images/heroes/antimage_lg.png"
    }
  ]
}
```

#### 2. 获取英雄统计

```
GET /api/heroes/:heroId/stats
```

---

### 成就相关 API

#### 1. 获取成就列表

```
GET /api/achievements?match_id={matchId}&player_id={playerId}
```

**查询参数**:
- `match_id` (可选): 比赛ID
- `player_id` (可选): 选手ID

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "achievement_id": 1,
      "match_id": 8649037382,
      "player_id": 1,
      "achievement_type": "rampage",
      "achievement_name": "暴虐成狂",
      "achievement_desc": "完成暴走",
      "created_at": "2026-01-15T10:30:00.000Z",
      "Player": {
        "nickname": "玩家昵称"
      }
    }
  ]
}
```

**成就类型**:

**个人成就** (7种):
- `rampage`: 暴虐成狂 - 完成5连杀或以上
- `first_blood`: 旗开得胜 - 获得首杀
- `aegis_snatch`: 虎口夺食 - 夺取不朽之守护
- `triple_double`: 你也是威少粉丝 - 击杀、助攻、死亡都≥10
- `godlike`: 位列仙班 - 完成超神杀戮（连续击杀不死）
- `carry_game`: 对不起这把比赛我要赢 - 获胜的比赛中击杀数超过全队的1/2
- `perfect_game`: 完美演出 - 在获胜的比赛中0死亡

**队伍成就** (1种):
- `aegis_victory`: 让让你们的呀 - 摧毁不朽之守护且获得胜利的队伍

---

### 统计相关 API

#### 1. 获取总体统计

```
GET /api/stats/overview?league_id={leagueId}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "total_matches": 34,
    "total_players": 50,
    "total_achievements": 156,
    "avg_match_duration": 2345,
    "radiant_win_rate": 52.9
  }
}
```

#### 2. 获取英雄胜率统计

```
GET /api/stats/heroes?league_id={leagueId}
```

---

### 数据同步 API

#### 1. 手动触发同步

```
POST /api/sync/matches?league_id={leagueId}
```

**功能**: 增量同步新比赛（不删除现有数据）

**响应示例**:
```json
{
  "success": true,
  "data": {
    "synced": 2,
    "total": 34,
    "message": "同步完成"
  }
}
```

---

## 使用示例

### JavaScript (Axios)

```javascript
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

// 获取比赛列表
const getMatches = async (leagueId, page = 1) => {
  const response = await axios.get(`${API_BASE}/matches`, {
    params: { league_id: leagueId, page, pageSize: 10 }
  });
  return response.data;
};

// 获取比赛详情
const getMatchDetail = async (matchId) => {
  const response = await axios.get(`${API_BASE}/matches/${matchId}`);
  return response.data;
};

// 强制刷新比赛数据
const forceRefreshMatches = async (leagueId) => {
  const response = await axios.post(
    `${API_BASE}/matches/force-refresh?league_id=${leagueId}`
  );
  return response.data;
};

// 获取选手详情
const getPlayerDetail = async (playerId) => {
  const response = await axios.get(`${API_BASE}/players/${playerId}`);
  return response.data;
};
```

### cURL

```bash
# 获取比赛列表
curl "http://localhost:3001/api/matches?league_id=18365&page=1&pageSize=10"

# 获取比赛详情
curl "http://localhost:3001/api/matches/8649037382"

# 强制刷新比赛数据
curl -X POST "http://localhost:3001/api/matches/force-refresh?league_id=18365"

# 获取选手详情
curl "http://localhost:3001/api/players/1"

# 获取成就列表
curl "http://localhost:3001/api/achievements?match_id=8649037382"
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
- ✅ 多届赛事管理
  - 第一届 (League ID: 17485) - 30场比赛
  - 第二届 (League ID: 18365) - 4场比赛

---

## 测试

### 测试强制刷新功能

```bash
cd backend
node test-force-refresh.js
```

### 完整API测试

```bash
cd backend
node tests/test-api-complete.js
```

---

## 开发状态

**后端**: ✅ 已完成
- Phase 1: 基础设施 ✅
- Phase 2: 核心功能 ✅
- Phase 3: API 路由 ✅ (所有端点正常工作)
- Phase 4: 数据增强 ✅ (经济数据、装备、路线)

**前端**: ✅ 已完成
- 比赛列表页面 ✅
- 比赛详情页面 ✅
- 选手详情页面 ✅
- 响应式设计 ✅

---

## 维护与更新

### 英雄资源更新

当 Dota 2 发布新英雄时，使用以下脚本更新英雄头像和映射：

```bash
cd frontend
node scripts/update-hero-assets.js
```

或者使用 npm 脚本：

```bash
npm run update-heroes
```

**功能：**
- 自动从 OpenDota API 获取最新英雄列表
- 检测并下载缺失的英雄头像
- 自动更新英雄 ID 到名称的映射文件
- 显示详细的下载进度和结果

**运行时机：**
- 🆕 Dota 2 发布新英雄后
- 🔄 定期检查（建议每月一次）
- 🐛 发现缺失头像时

### 资源完整性检查

检查物品和技能图标的完整性：

```bash
cd frontend
node check-assets.cjs
```

### 数据库维护

#### 清空数据库

```bash
cd backend
node clear-database.js
```

#### 运行数据库迁移

```bash
cd backend
node migrations/add-parse-status-fields.js
```

### 比赛解析管理

对于未完全解析的比赛（缺少 objectives 数据），可以：

1. **前端操作**：在比赛详情页点击"请求解析"按钮
2. **API 调用**：
   ```bash
   # 请求解析
   POST /api/matches/:matchId/request-parse
   
   # 刷新比赛数据
   POST /api/matches/:matchId/refresh
   ```

---

## 贡献

欢迎提交 Issue 和 Pull Request！

---

## 许可证

MIT
