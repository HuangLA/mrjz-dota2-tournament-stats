-- ============================================
-- MRJZ 测试数据脚本
-- 用途: 插入初始测试数据
-- 注意: 请根据实际情况修改API Key
-- ============================================

USE `mrjz`;

-- 插入测试 API Key
-- 注意: 请将 YOUR_STEAM_API_KEY_HERE 替换为实际的 Steam API Key
INSERT INTO `api_keys` (`key_value`, `is_active`) VALUES
('YOUR_STEAM_API_KEY_HERE', TRUE)
ON DUPLICATE KEY UPDATE `is_active` = TRUE;

-- 显示插入结果
SELECT 'Test data inserted successfully!' AS message;
SELECT 'Please update YOUR_STEAM_API_KEY_HERE with your actual Steam API key' AS reminder;
SELECT * FROM `api_keys`;
