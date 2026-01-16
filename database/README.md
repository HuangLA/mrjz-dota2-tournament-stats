# 数据库脚本说明

本目录包含 MRJZ 项目的数据库初始化和管理脚本。

## 文件说明

### 1. init.sql
**用途**: 创建数据库

**执行命令**:
```bash
mysql -u root -p < init.sql
```

**功能**:
- 创建 `mrjz` 数据库
- 设置字符集为 `utf8mb4`
- 设置排序规则为 `utf8mb4_unicode_ci`

---

### 2. tables.sql
**用途**: 创建所有数据表

**执行命令**:
```bash
mysql -u root -p mrjz < tables.sql
```

**包含的表**:
1. **matches** - 比赛表
   - 基础信息: match_id, league_id, start_time, duration
   - 比赛结果: radiant_win, radiant_score, dire_score
   - 队伍信息: radiant_team_id/name, dire_team_id/name

2. **players** - 选手表
   - 基础信息: player_id, steam_id, nickname, avatar_url
   - 统计数据: total_matches, total_wins, avg_kda

3. **match_players** - 比赛选手详情表
   - 基础数据: hero_id, team, kills, deaths, assists
   - 经济数据: gpm, xpm, net_worth, last_hits, denies
   - 装备信息: items (JSON), item_backpack_0-2, item_neutral
   - 其他数据: lane, hero_damage, tower_damage, hero_healing

4. **heroes** - 英雄表
   - 英雄信息: hero_id, name, localized_name, icon_url

5. **achievements** - 成就记录表
   - 成就信息: achievement_type, achievement_name, achievement_desc
   - 关联信息: match_id, player_id, team

6. **api_keys** - Steam API Key 管理表
   - Key 管理: key_value, is_active, usage_count

7. **sync_logs** - 数据同步记录表
   - 同步记录: sync_type, status, synced_count, error_message

---

### 3. seed.sql
**用途**: 插入测试数据

**执行命令**:
```bash
mysql -u root -p mrjz < seed.sql
```

**注意**: 
- 请先修改 `YOUR_STEAM_API_KEY_HERE` 为实际的 Steam API Key
- 此脚本仅用于开发测试环境

---

## 完整初始化流程

### 方法一: 分步执行

```bash
# 1. 创建数据库
mysql -u root -p < init.sql

# 2. 创建表结构
mysql -u root -p mrjz < tables.sql

# 3. 插入测试数据 (可选)
mysql -u root -p mrjz < seed.sql
```

### 方法二: 一键执行

```bash
# Windows PowerShell
Get-Content init.sql, tables.sql, seed.sql | mysql -u root -p

# Linux/Mac
cat init.sql tables.sql seed.sql | mysql -u root -p
```

---

## 数据库结构更新记录

### 2026-01-15
- ✅ 添加 `match_players` 表新字段:
  - `item_backpack_0`, `item_backpack_1`, `item_backpack_2` - 背包装备
  - `item_neutral` - 中立装备
  - `lane` - 路线信息
  - `net_worth` - 净值
  - `last_hits` - 正补
  - `denies` - 反补

- ✅ 添加 `matches` 表新字段:
  - `radiant_team_id`, `radiant_team_name` - 天辉队伍信息
  - `dire_team_id`, `dire_team_name` - 夜魇队伍信息

### 2026-01-16
- ✅ 数据库完整备份已导出
  - 文件: `database/mrjz_full_backup.sql`
  - 大小: 78.62 KB
  - 总记录数: 474
  - 包含: 34场比赛，57名选手，340条玩家记录

---

## 注意事项

1. **字符集**: 所有表使用 `utf8mb4` 字符集，支持 emoji 和特殊字符
2. **外键约束**: 
   - `match_players.match_id` → `matches.match_id` (CASCADE DELETE)
   - `match_players.player_id` → `players.player_id` (CASCADE DELETE)
   - `achievements.match_id` → `matches.match_id` (CASCADE DELETE)
3. **索引**: 已为常用查询字段添加索引，提升查询性能
4. **时间戳**: 所有表包含 `created_at` 字段，部分表包含 `updated_at` 字段

---

## 数据迁移

如果需要更新现有数据库结构，请使用 Sequelize 迁移脚本：

```bash
cd backend
node migrations/add-enhanced-match-data.js
```

---

## 备份与恢复

### 备份数据库

```bash
mysqldump -u root -p mrjz > backup_$(date +%Y%m%d).sql
```

### 恢复数据库

```bash
mysql -u root -p mrjz < backup_20260115.sql
```

---

## 技术支持

如有问题，请查看:
- 项目 README: `../README.md`
- API 文档: `../README.md#api-文档`
- 模型定义: `../backend/src/models/`
