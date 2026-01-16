# 工具脚本说明

本目录包含用于数据同步、数据库迁移和实用工具的脚本。

## 📁 目录结构

```
tools/
├── sync/           # 数据同步脚本
├── migrations/     # 数据库迁移脚本
└── utils/          # 实用工具脚本
```

## 🔄 数据同步

### 同步战队数据
从 Steam API 同步战队信息到数据库。

```bash
node tools/sync/sync-team-data.js
```

**功能**：
- 获取比赛中的战队 ID
- 调用 Steam API 获取战队名称
- 更新 matches 表中的战队信息

### 同步玩家昵称
批量同步所有玩家的 Steam 昵称和头像。

```bash
node tools/sync/sync-player-nicknames.js
```

**功能**：
- 获取所有唯一玩家 ID
- 转换为 Steam ID 64位
- 调用 Steam API 获取昵称和头像
- 更新 players 表

## 🗄️ 数据库迁移

### 赛季管理系统设置
初始化赛季管理系统（一次性执行）。

```bash
node tools/migrations/setup-edition-management.js
```

**功能**：
- 创建 editions 表
- 插入初始赛季数据
- 根据日期规则更新比赛的 edition 字段

**状态**：✅ 已执行

### 添加 Edition 字段
为 matches 表添加 edition 字段（已废弃）。

**状态**：✅ 已执行，已被 setup-edition-management.js 替代

## 🛠️ 实用工具

### 重置玩家昵称
将所有玩家昵称重置为默认格式（Player_xxxxx）。

```bash
node tools/utils/reset-nicknames.js
```

**用途**：
- 清除错误的昵称数据
- 重新同步所有玩家昵称

**警告**：此操作会清除所有已同步的昵称！

## ⚙️ 环境要求

所有脚本都需要：
- Node.js 环境
- `.env` 文件中配置的 `STEAM_API_KEY`
- 数据库连接正常

## 📝 使用建议

1. **首次部署**：
   ```bash
   # 1. 设置赛季管理（如果未执行）
   node tools/migrations/setup-edition-management.js
   
   # 2. 同步战队数据
   node tools/sync/sync-team-data.js
   
   # 3. 同步玩家昵称
   node tools/sync/sync-player-nicknames.js
   ```

2. **定期维护**：
   ```bash
   # 同步新增的玩家昵称
   node tools/sync/sync-player-nicknames.js
   ```

3. **数据清理**：
   ```bash
   # 重置并重新同步昵称
   node tools/utils/reset-nicknames.js
   node tools/sync/sync-player-nicknames.js
   ```

## 🔒 注意事项

- 所有脚本都会自动加载 `.env` 配置
- Steam API 有速率限制，大量数据同步时会自动延迟
- 迁移脚本通常只需执行一次
- 执行前建议备份数据库
