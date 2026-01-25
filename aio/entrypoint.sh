#!/bin/bash
set -e

echo "=========================================="
echo "🚀 MRJZ All-in-One Container Starting..."
echo "=========================================="

# 1. 启动 MariaDB (后台运行) 以便进行初始化
echo "🛠️  Starting MariaDB for initialization..."
service mariadb start

# 等待 MariaDB 启动
echo "⏳ Waiting for MariaDB to be ready..."
until mysqladmin ping >/dev/null 2>&1; do
  echo -n "."
  sleep 1
done
echo ""

# 2. 初始化数据库 (如果 data 目录看起来是空的或者系统表需要初始化)
# 注意：在 Docker 中 /var/lib/mysql 可能是挂载卷。
# 这里我们需要一种幂等的初始化方式。

echo "📦 Checking database status..."

# 尝试创建数据库（如果不存在）
mysql -u root -e "CREATE DATABASE IF NOT EXISTS mrjz DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 检查是否存在特定表，如果不存在则运行 init 脚本
if ! mysql -u root -D mrjz -e "DESCRIBE matches;" >/dev/null 2>&1; then
    echo "✨ Database empty. Initializing schema..."
    
    # 设置 root 密码 (仅在第一次有效，后续可能需要根据情况调整，这里假设是用无密码root连进去设置)
    # 注意：mariadb 默认 root 无密码 (socket auth)。为了 backend 连接，我们需要设置密码。
    # 为了保险起见，我们先用 ALTER USER 设置密码
    mysql -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED VIA mysql_native_password USING PASSWORD('mrjz_password');"
    mysql -u root -e "FLUSH PRIVILEGES;"
    
    # 使用新密码导入数据
    echo "   - Running init.sql..."
    mysql -u root -pmrjz_password mrjz < /docker-entrypoint-initdb.d/init.sql || echo "   (init.sql skipped or failed)"
    
    echo "   - Running tables.sql..."
    mysql -u root -pmrjz_password mrjz < /docker-entrypoint-initdb.d/tables.sql
    
    # 导入所有 init 目录下的 sql
    for f in /docker-entrypoint-initdb.d/*.sql; do
        if [ "$f" != "/docker-entrypoint-initdb.d/init.sql" ] && [ "$f" != "/docker-entrypoint-initdb.d/tables.sql" ]; then
            echo "   - Running $f..."
            mysql -u root -pmrjz_password mrjz < "$f"
        fi
    done
    
    echo "✅ Database Configured!"
else
    echo "✅ Database already initialized."
    # 确保密码正确 (防止重启后 auth plugin 变回 socket)
    mysql -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED VIA mysql_native_password USING PASSWORD('mrjz_password'); FLUSH PRIVILEGES;" || true
fi

# 停止 MariaDB，把控制权交给 Supervisor
echo "🛑 Stopping temporary MariaDB..."
mysqladmin -u root -pmrjz_password shutdown
echo "✅ MariaDB stopped."

# 3. 启动 Supervisor
echo "🔥 Starting Supervisor to manage all services..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
