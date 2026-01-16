-- ============================================
-- MRJZ 数据库初始化脚本
-- 用途: 创建数据库和基础配置
-- ============================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS `mrjz` 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE `mrjz`;

-- 显示创建结果
SELECT 'Database mrjz created successfully!' AS message;
SELECT 'Character set: utf8mb4, Collation: utf8mb4_unicode_ci' AS config;
