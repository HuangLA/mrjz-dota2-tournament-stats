-- 添加唯一成就支持的字段
-- 2026-02-02: 为"乐邦詹士"隐藏成就添加唯一性标记

ALTER TABLE achievements 
ADD COLUMN is_unique BOOLEAN DEFAULT FALSE COMMENT '是否为唯一成就（每届比赛只有第一个完成的人获得）';

ALTER TABLE achievements 
ADD COLUMN league_id INT DEFAULT NULL COMMENT '联赛ID（用于唯一成就的范围判定）';

-- 为 league_id 添加索引以提高查询性能
CREATE INDEX idx_achievements_league_unique ON achievements(league_id, is_unique, achievement_type);
