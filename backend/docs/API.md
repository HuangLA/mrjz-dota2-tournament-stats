# MRJZ API 文档

**版本**: v1.0  
**基础URL**: `http://localhost:3001/api`  
**最后更新**: 2026-01-13

---

## 目录

1. [通用说明](#通用说明)
2. [比赛相关 API](#比赛相关-api)
3. [选手相关 API](#选手相关-api)
4. [英雄相关 API](#英雄相关-api)
5. [成就相关 API](#成就相关-api)
6. [统计相关 API](#统计相关-api)
7. [错误处理](#错误处理)

---

## 通用说明

### 响应格式

所有成功的 API 响应都遵循以下格式：

```json
{
  "success": true,
  "data": { ... },
  "pagination": {  // 仅分页接口返回
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 分页参数

支持分页的接口接受以下查询参数：

- `page`: 页码（默认: 1）
- `limit`: 每页数量（默认: 10，最大: 100）

**示例**: `GET /api/matches?page=2&limit=20`

---

## 比赛相关 API

### 1. 获取比赛列表

**端点**: `GET /api/matches`

**描述**: 获取比赛列表，支持分页和联赛过滤

**查询参数**:
- `page` (可选): 页码，默认 1
- `limit` (可选): 每页数量，默认 10
- `league_id` (可选): 联赛ID过滤

**请求示例**:
```bash
curl "http://localhost:3001/api/matches?page=1&limit=5&league_id=17485"
```

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "match_id": 8329062663,
      "league_id": 17485,
      "start_time": "2024-12-15T10:30:00.000Z",
      "duration": 2145,
      "radiant_win": true,
      "radiant_score": 32,
      "dire_score": 18,
      "game_mode": 2,
      "analysis_status": "completed"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 26,
    "totalPages": 6,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### 2. 获取比赛详情

**端点**: `GET /api/matches/:id`

**描述**: 获取指定比赛的详细信息，包括选手数据

**路径参数**:
- `id`: 比赛ID

**请求示例**:
```bash
curl "http://localhost:3001/api/matches/8329062663"
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "match_id": 8329062663,
    "league_id": 17485,
    "start_time": "2024-12-15T10:30:00.000Z",
    "duration": 2145,
    "radiant_win": true,
    "radiant_score": 32,
    "dire_score": 18,
    "game_mode": 2,
    "players": [
      {
        "id": 1,
        "match_id": 8329062663,
        "player_id": 82,
        "hero_id": 1,
        "team": "radiant",
        "kills": 12,
        "deaths": 3,
        "assists": 15,
        "gpm": 650,
        "xpm": 720,
        "Player": {
          "player_id": 82,
          "steam_id": "76561198123456789",
          "nickname": "PlayerName",
          "avatar_url": "https://..."
        }
      }
    ]
  }
}
```

---

### 3. 获取比赛选手列表

**端点**: `GET /api/matches/:id/players`

**描述**: 获取指定比赛的所有选手详情

**路径参数**:
- `id`: 比赛ID

**请求示例**:
```bash
curl "http://localhost:3001/api/matches/8329062663/players"
```

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "match_id": 8329062663,
      "player_id": 82,
      "hero_id": 1,
      "team": "radiant",
      "kills": 12,
      "deaths": 3,
      "assists": 15,
      "gpm": 650,
      "xpm": 720,
      "items": ["item_blink", "item_black_king_bar"],
      "hero_damage": 25000,
      "tower_damage": 5000,
      "hero_healing": 1200,
      "Player": {
        "player_id": 82,
        "steam_id": "76561198123456789",
        "nickname": "PlayerName",
        "avatar_url": "https://..."
      }
    }
  ]
}
```

---

### 4. 获取比赛成就列表

**端点**: `GET /api/matches/:id/achievements`

**描述**: 获取指定比赛中获得的所有成就

**路径参数**:
- `id`: 比赛ID

**请求示例**:
```bash
curl "http://localhost:3001/api/matches/8329062663/achievements"
```

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "match_id": 8329062663,
      "player_id": 82,
      "achievement_type": "perfect_game",
      "achievement_name": "完美演出",
      "achievement_desc": "在获胜的比赛中0死亡",
      "team": null,
      "value": null,
      "created_at": "2024-12-15T12:00:00.000Z",
      "Player": {
        "player_id": 82,
        "steam_id": "76561198123456789",
        "nickname": "PlayerName",
        "avatar_url": "https://..."
      }
    }
  ]
}
```

---

## 选手相关 API

### 5. 获取选手列表

**端点**: `GET /api/players`

**描述**: 获取所有选手列表，按比赛数量排序

**查询参数**:
- `page` (可选): 页码，默认 1
- `limit` (可选): 每页数量，默认 10

**请求示例**:
```bash
curl "http://localhost:3001/api/players?page=1&limit=10"
```

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "player_id": 82,
      "steam_id": "76561198123456789",
      "nickname": "PlayerName",
      "avatar_url": "https://...",
      "total_matches": 15,
      "total_wins": 9,
      "avg_kda": 3.5
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 49,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### 6. 获取选手详情

**端点**: `GET /api/players/:id`

**描述**: 获取指定选手的详细信息

**路径参数**:
- `id`: 选手ID

**请求示例**:
```bash
curl "http://localhost:3001/api/players/82"
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "player_id": 82,
    "steam_id": "76561198123456789",
    "nickname": "PlayerName",
    "avatar_url": "https://...",
    "total_matches": 15,
    "total_wins": 9,
    "avg_kda": 3.5,
    "created_at": "2024-12-15T10:00:00.000Z",
    "updated_at": "2024-12-15T12:00:00.000Z"
  }
}
```

---

### 7. 获取选手比赛历史

**端点**: `GET /api/players/:id/matches`

**描述**: 获取指定选手的比赛历史记录

**路径参数**:
- `id`: 选手ID

**查询参数**:
- `page` (可选): 页码，默认 1
- `limit` (可选): 每页数量，默认 10

**请求示例**:
```bash
curl "http://localhost:3001/api/players/82/matches?page=1&limit=5"
```

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "match_id": 8329062663,
      "player_id": 82,
      "hero_id": 1,
      "team": "radiant",
      "kills": 12,
      "deaths": 3,
      "assists": 15,
      "gpm": 650,
      "xpm": 720,
      "Match": {
        "match_id": 8329062663,
        "league_id": 17485,
        "start_time": "2024-12-15T10:30:00.000Z",
        "duration": 2145,
        "radiant_win": true,
        "radiant_score": 32,
        "dire_score": 18
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 15,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### 8. 获取选手成就列表

**端点**: `GET /api/players/:id/achievements`

**描述**: 获取指定选手获得的所有成就

**路径参数**:
- `id`: 选手ID

**请求示例**:
```bash
curl "http://localhost:3001/api/players/82/achievements"
```

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "match_id": 8329062663,
      "player_id": 82,
      "achievement_type": "perfect_game",
      "achievement_name": "完美演出",
      "achievement_desc": "在获胜的比赛中0死亡",
      "created_at": "2024-12-15T12:00:00.000Z",
      "Match": {
        "match_id": 8329062663,
        "start_time": "2024-12-15T10:30:00.000Z"
      }
    }
  ]
}
```

---

### 9. 获取选手统计数据

**端点**: `GET /api/players/:id/stats`

**描述**: 获取指定选手的统计数据，包括平均KDA、GPM等

**路径参数**:
- `id`: 选手ID

**请求示例**:
```bash
curl "http://localhost:3001/api/players/82/stats"
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "player": {
      "player_id": 82,
      "steam_id": "76561198123456789",
      "nickname": "PlayerName",
      "total_matches": 15,
      "total_wins": 9
    },
    "matchStats": {
      "avg_kills": 8.5,
      "avg_deaths": 4.2,
      "avg_assists": 12.3,
      "avg_gpm": 580,
      "avg_xpm": 650,
      "max_kills": 18,
      "total_games": 15
    },
    "achievements": [
      {
        "achievement_type": "perfect_game",
        "count": 3
      },
      {
        "achievement_type": "carry_game",
        "count": 2
      }
    ]
  }
}
```

---

## 英雄相关 API

### 10. 获取英雄列表

**端点**: `GET /api/heroes`

**描述**: 获取所有英雄列表

**请求示例**:
```bash
curl "http://localhost:3001/api/heroes"
```

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "hero_id": 1,
      "name": "Anti-Mage",
      "localized_name": "敌法师",
      "primary_attr": "agi",
      "attack_type": "Melee",
      "roles": ["Carry", "Escape"]
    }
  ]
}
```

---

### 11. 获取英雄详情

**端点**: `GET /api/heroes/:id`

**描述**: 获取指定英雄的详细信息

**路径参数**:
- `id`: 英雄ID

**请求示例**:
```bash
curl "http://localhost:3001/api/heroes/1"
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "hero_id": 1,
    "name": "Anti-Mage",
    "localized_name": "敌法师",
    "primary_attr": "agi",
    "attack_type": "Melee",
    "roles": ["Carry", "Escape"],
    "created_at": "2024-12-15T10:00:00.000Z",
    "updated_at": "2024-12-15T10:00:00.000Z"
  }
}
```

---

## 成就相关 API

### 12. 获取成就列表

**端点**: `GET /api/achievements`

**描述**: 获取所有成就列表，支持类型过滤

**查询参数**:
- `page` (可选): 页码，默认 1
- `limit` (可选): 每页数量，默认 10
- `type` (可选): 成就类型过滤

**成就类型**:
- `rampage`: 暴虐成狂
- `first_blood`: 旗开得胜
- `aegis_snatch`: 虎口夺食
- `triple_double`: 你也是威少粉丝
- `godlike`: 位列仙班
- `carry_game`: 对不起这把比赛我要赢
- `perfect_game`: 完美演出
- `aegis_victory`: 让让你们的呀

**请求示例**:
```bash
curl "http://localhost:3001/api/achievements?page=1&limit=10&type=perfect_game"
```

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "match_id": 8329062663,
      "player_id": 82,
      "achievement_type": "perfect_game",
      "achievement_name": "完美演出",
      "achievement_desc": "在获胜的比赛中0死亡",
      "team": null,
      "value": null,
      "created_at": "2024-12-15T12:00:00.000Z",
      "Player": {
        "player_id": 82,
        "steam_id": "76561198123456789",
        "nickname": "PlayerName",
        "avatar_url": "https://..."
      },
      "Match": {
        "match_id": 8329062663,
        "start_time": "2024-12-15T10:30:00.000Z",
        "league_id": 17485
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 12,
    "totalPages": 2,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### 13. 获取成就统计

**端点**: `GET /api/achievements/stats`

**描述**: 获取成就的统计信息，包括各类型数量和最近成就

**请求示例**:
```bash
curl "http://localhost:3001/api/achievements/stats"
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "total": 12,
    "byType": [
      {
        "achievement_type": "perfect_game",
        "achievement_name": "完美演出",
        "count": 7
      },
      {
        "achievement_type": "carry_game",
        "achievement_name": "对不起这把比赛我要赢",
        "count": 4
      },
      {
        "achievement_type": "triple_double",
        "achievement_name": "你也是威少粉丝",
        "count": 1
      }
    ],
    "recent": [
      {
        "id": 12,
        "match_id": 8329062663,
        "player_id": 82,
        "achievement_type": "perfect_game",
        "achievement_name": "完美演出",
        "created_at": "2024-12-15T12:00:00.000Z",
        "Player": {
          "player_id": 82,
          "steam_id": "76561198123456789",
          "nickname": "PlayerName"
        },
        "Match": {
          "match_id": 8329062663,
          "start_time": "2024-12-15T10:30:00.000Z"
        }
      }
    ]
  }
}
```

---

## 统计相关 API

### 14. 获取总体统计

**端点**: `GET /api/stats/overview`

**描述**: 获取系统的总体统计数据

**请求示例**:
```bash
curl "http://localhost:3001/api/stats/overview"
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "totalMatches": 26,
    "totalPlayers": 49,
    "totalAchievements": 12,
    "radiantWinRate": "53.85",
    "recentMatches": [
      {
        "match_id": 8329062663,
        "league_id": 17485,
        "start_time": "2024-12-15T10:30:00.000Z",
        "duration": 2145,
        "radiant_win": true,
        "radiant_score": 32,
        "dire_score": 18
      }
    ]
  }
}
```

---

### 15. 获取联赛统计

**端点**: `GET /api/stats/league/:id`

**描述**: 获取指定联赛的统计数据

**路径参数**:
- `id`: 联赛ID

**请求示例**:
```bash
curl "http://localhost:3001/api/stats/league/17485"
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "leagueId": "17485",
    "totalMatches": 26,
    "achievements": [
      {
        "achievement_type": "perfect_game",
        "achievement_name": "完美演出",
        "count": 7
      }
    ],
    "topPlayers": [
      {
        "player_id": 82,
        "games": 15,
        "avg_kills": 8.5,
        "avg_deaths": 4.2,
        "avg_assists": 12.3,
        "Player": {
          "player_id": 82,
          "steam_id": "76561198123456789",
          "nickname": "PlayerName"
        }
      }
    ]
  }
}
```

---

## 错误处理

### 错误响应格式

所有错误响应都遵循以下格式：

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述"
  }
}
```

### 常见错误码

| HTTP状态码 | 错误码 | 说明 |
|-----------|--------|------|
| 400 | VALIDATION_ERROR | 请求参数验证失败 |
| 404 | NOT_FOUND | 资源不存在 |
| 409 | DUPLICATE_ERROR | 数据重复 |
| 500 | INTERNAL_ERROR | 服务器内部错误 |

### 错误示例

**404 Not Found**:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "比赛不存在"
  }
}
```

**400 Validation Error**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid page parameter"
  }
}
```

---

## JavaScript 调用示例

### 使用 Fetch API

```javascript
// 获取比赛列表
async function getMatches(page = 1, limit = 10) {
  const response = await fetch(`http://localhost:3001/api/matches?page=${page}&limit=${limit}`);
  const data = await response.json();
  
  if (data.success) {
    console.log('比赛列表:', data.data);
    console.log('分页信息:', data.pagination);
  } else {
    console.error('错误:', data.error);
  }
}

// 获取选手详情
async function getPlayerById(playerId) {
  const response = await fetch(`http://localhost:3001/api/players/${playerId}`);
  const data = await response.json();
  
  if (data.success) {
    console.log('选手信息:', data.data);
  } else {
    console.error('错误:', data.error);
  }
}
```

### 使用 Axios

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

// 获取比赛详情
async function getMatchDetails(matchId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/matches/${matchId}`);
    console.log('比赛详情:', response.data.data);
  } catch (error) {
    console.error('请求失败:', error.response?.data || error.message);
  }
}

// 获取成就统计
async function getAchievementStats() {
  try {
    const response = await axios.get(`${API_BASE_URL}/achievements/stats`);
    console.log('成就统计:', response.data.data);
  } catch (error) {
    console.error('请求失败:', error.response?.data || error.message);
  }
}
```

---

## 注意事项

1. **CORS**: API 已配置 CORS，允许跨域请求
2. **分页限制**: 每页最多返回 100 条记录
3. **ID 类型**: 所有 ID 参数都应该是数字类型
4. **时间格式**: 所有时间字段都使用 ISO 8601 格式
5. **性能**: 建议使用分页参数避免一次性获取大量数据

---

**文档版本**: v1.0  
**最后更新**: 2026-01-13  
**联系方式**: 如有问题请联系开发团队
