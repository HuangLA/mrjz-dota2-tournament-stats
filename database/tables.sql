-- ============================================
-- MRJZ 数据库表结构脚本
-- 最后更新: 2026-01-15
-- ============================================

USE `mrjz`;

-- 1. 比赛表
CREATE TABLE IF NOT EXISTS `matches` (
  `match_id` BIGINT PRIMARY KEY COMMENT '比赛ID',
  `league_id` INT NOT NULL COMMENT '联赛ID',
  `start_time` INT NOT NULL COMMENT '开始时间(Unix时间戳)',
  `duration` INT NOT NULL COMMENT '比赛时长(秒)',
  `radiant_win` BOOLEAN NOT NULL COMMENT '天辉是否获胜',
  `radiant_score` INT NOT NULL COMMENT '天辉击杀数',
  `dire_score` INT NOT NULL COMMENT '夜魇击杀数',
  `radiant_team_id` INT NULL COMMENT '天辉队伍ID',
  `radiant_team_name` VARCHAR(255) NULL COMMENT '天辉队伍名称',
  `dire_team_id` INT NULL COMMENT '夜魇队伍ID',
  `dire_team_name` VARCHAR(255) NULL COMMENT '夜魇队伍名称',
  `game_mode` INT COMMENT '游戏模式',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_league_id` (`league_id`),
  INDEX `idx_start_time` (`start_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='比赛表';

-- 2. 选手表
CREATE TABLE IF NOT EXISTS `players` (
  `player_id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '选手ID',
  `steam_id` BIGINT UNIQUE NOT NULL COMMENT 'Steam ID (64位)',
  `nickname` VARCHAR(100) NOT NULL COMMENT '昵称',
  `avatar_url` VARCHAR(255) COMMENT '头像URL',
  `total_matches` INT DEFAULT 0 COMMENT '总场次',
  `total_wins` INT DEFAULT 0 COMMENT '胜场',
  `avg_kda` DECIMAL(5,2) DEFAULT 0 COMMENT '平均KDA',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_steam_id` (`steam_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='选手表';

-- 3. 比赛选手详情表
CREATE TABLE IF NOT EXISTS `match_players` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  `match_id` BIGINT NOT NULL COMMENT '比赛ID',
  `player_id` BIGINT NOT NULL COMMENT '选手ID',
  `hero_id` INT NOT NULL COMMENT '英雄ID',
  `team` ENUM('radiant', 'dire') NOT NULL COMMENT '队伍',
  `kills` INT DEFAULT 0 COMMENT '击杀',
  `deaths` INT DEFAULT 0 COMMENT '死亡',
  `assists` INT DEFAULT 0 COMMENT '助攻',
  `gpm` INT DEFAULT 0 COMMENT '每分钟金钱',
  `xpm` INT DEFAULT 0 COMMENT '每分钟经验',
  `items` JSON COMMENT '物品列表',
  `ability_upgrades` JSON COMMENT '技能加点',
  `hero_damage` INT DEFAULT 0 COMMENT '英雄伤害',
  `tower_damage` INT DEFAULT 0 COMMENT '建筑伤害',
  `hero_healing` INT DEFAULT 0 COMMENT '英雄治疗',
  -- 新增字段: 背包装备
  `item_backpack_0` INT NULL COMMENT '背包装备1',
  `item_backpack_1` INT NULL COMMENT '背包装备2',
  `item_backpack_2` INT NULL COMMENT '背包装备3',
  -- 新增字段: 中立装备
  `item_neutral` INT NULL COMMENT '中立装备',
  -- 新增字段: 路线信息
  `lane` TINYINT NULL COMMENT '路线 (1=安全路, 2=中路, 3=优势路, 4=游走)',
  -- 新增字段: 经济数据
  `net_worth` INT DEFAULT 0 COMMENT '净值',
  `last_hits` INT DEFAULT 0 COMMENT '正补',
  `denies` INT DEFAULT 0 COMMENT '反补',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_match_id` (`match_id`),
  INDEX `idx_player_id` (`player_id`),
  INDEX `idx_hero_id` (`hero_id`),
  FOREIGN KEY (`match_id`) REFERENCES `matches`(`match_id`) ON DELETE CASCADE,
  FOREIGN KEY (`player_id`) REFERENCES `players`(`player_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='比赛选手详情表';

-- 4. 英雄表
CREATE TABLE IF NOT EXISTS `heroes` (
  `hero_id` INT PRIMARY KEY COMMENT '英雄ID',
  `name` VARCHAR(100) NOT NULL COMMENT '英雄英文名',
  `localized_name` VARCHAR(100) NOT NULL COMMENT '英雄中文名',
  `icon_url` VARCHAR(255) COMMENT '头像URL',
  `attribute` ENUM('strength', 'agility', 'intelligence') COMMENT '主属性',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='英雄表';

-- 5. 成就记录表
CREATE TABLE IF NOT EXISTS `achievements` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  `match_id` BIGINT NOT NULL COMMENT '比赛ID',
  `player_id` BIGINT NULL COMMENT '选手ID（队伍成就为NULL）',
  `achievement_type` VARCHAR(50) NOT NULL COMMENT '成就类型',
  `achievement_name` VARCHAR(100) NOT NULL COMMENT '成就名称',
  `achievement_desc` VARCHAR(255) COMMENT '成就描述',
  `team` ENUM('radiant', 'dire') NULL COMMENT '队伍（队伍成就用）',
  `value` JSON COMMENT '成就相关数据',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_match_id` (`match_id`),
  INDEX `idx_player_id` (`player_id`),
  INDEX `idx_achievement_type` (`achievement_type`),
  FOREIGN KEY (`match_id`) REFERENCES `matches`(`match_id`) ON DELETE CASCADE,
  FOREIGN KEY (`player_id`) REFERENCES `players`(`player_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='成就记录表';

-- 6. Steam API Key 管理表
CREATE TABLE IF NOT EXISTS `api_keys` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  `key_value` VARCHAR(100) UNIQUE NOT NULL COMMENT 'API Key值',
  `is_active` BOOLEAN DEFAULT TRUE COMMENT '是否启用',
  `usage_count` INT DEFAULT 0 COMMENT '使用次数',
  `last_used_at` TIMESTAMP NULL COMMENT '最后使用时间',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Steam API Key管理表';

-- 7. 数据同步记录表
CREATE TABLE IF NOT EXISTS `sync_logs` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  `sync_type` ENUM('match', 'player', 'hero') NOT NULL COMMENT '同步类型',
  `status` ENUM('success', 'failed') NOT NULL COMMENT '同步状态',
  `error_message` TEXT COMMENT '错误信息',
  `synced_count` INT DEFAULT 0 COMMENT '同步数量',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_sync_type` (`sync_type`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='数据同步记录表';

-- 显示创建结果
SELECT 'All tables created successfully!' AS message;
SELECT 'Updated: 2026-01-15 - Added backpack, neutral items, lane, and economy fields to match_players table' AS update_info;
