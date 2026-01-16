# 数据库导出统计

**导出时间**: 2026/1/16 12:40:00  
**数据库**: mrjz  
**总记录数**: 474

## 表统计

| 表名 | 记录数 |
|------|--------|
| achievements | 16 |
| api_keys | 1 |
| editions | 2 |
| heroes | 0 |
| match_players | 340 |
| matches | 34 |
| players | 57 |
| sync_logs | 24 |

## 文件信息

- **备份文件**: mrjz_full_backup.sql
- **文件大小**: 78.62 KB
- **导出方式**: Node.js + mysql2

## 使用方法

### 恢复数据库

```bash
# 方法1: 使用mysql命令
mysql -u root -p mrjz < mrjz_full_backup.sql

# 方法2: 使用source命令
mysql -u root -p
USE mrjz;
SOURCE mrjz_full_backup.sql;
```

### 注意事项

- 恢复前请确保数据库表结构已创建
- 此备份会清空现有数据（TRUNCATE）
- 外键检查已临时禁用以避免导入错误
