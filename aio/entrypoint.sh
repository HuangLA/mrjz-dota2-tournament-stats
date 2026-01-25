#!/bin/bash
set -e

echo "=========================================="
echo "🚀 MRJZ All-in-One Container Starting..."
echo "=========================================="

# 1. 启动 MariaDB (后台运行) 以便进行初始化
echo "🛠️  Starting MariaDB for initialization..."
service mariadb start

# 等待 MariaDB 启动并检测密码状态
echo "⏳ Waiting for MariaDB to be ready..."
MYSQL_CMD="mysql -u root"
MYSQLADMIN_CMD="mysqladmin -u root"

count=0
while true; do
    if mysqladmin ping >/dev/null 2>&1; then
        echo "   ✅ MariaDB is online (no password)."
        break
    fi
    if mysqladmin -u root -pmrjz_password ping >/dev/null 2>&1; then
        echo "   ✅ MariaDB is online (with password)."
        MYSQL_CMD="mysql -u root -pmrjz_password"
        MYSQLADMIN_CMD="mysqladmin -u root -pmrjz_password"
        break
    fi
    echo -n "."
    sleep 1
    count=$((count+1))
    if [ $count -gt 60 ]; then
        echo "❌ Timeout waiting for MariaDB"
        exit 1
    fi
done
echo ""

# 2. 初始化数据库
echo "📦 Checking database status..."

# 尝试创建数据库（使用检测到的命令）
$MYSQL_CMD -e "CREATE DATABASE IF NOT EXISTS mrjz DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 检查是否存在特定表，如果不存在则运行 init 脚本
if ! $MYSQL_CMD -D mrjz -e "DESCRIBE matches;" >/dev/null 2>&1; then
    echo "✨ Database empty. Initializing schema..."
    
    # 如果当前是没有密码状态，必须设置密码供后端使用
    if [ "$MYSQL_CMD" == "mysql -u root" ]; then
        echo "🔒 Setting root password..."
        $MYSQL_CMD -e "ALTER USER 'root'@'localhost' IDENTIFIED VIA mysql_native_password USING PASSWORD('mrjz_password'); FLUSH PRIVILEGES;"
        # 更新后续命令使用的密码
        MYSQL_CMD="mysql -u root -pmrjz_password"
        MYSQLADMIN_CMD="mysqladmin -u root -pmrjz_password"
    fi
    
    # 导入数据
    echo "   - Running init.sql..."
    $MYSQL_CMD mrjz < /docker-entrypoint-initdb.d/init.sql || echo "   (init.sql skipped or failed)"
    
    echo "   - Running tables.sql..."
    $MYSQL_CMD mrjz < /docker-entrypoint-initdb.d/tables.sql
    
    # 导入其他 sql 文件
    for f in /docker-entrypoint-initdb.d/*.sql; do
        if [ "$f" != "/docker-entrypoint-initdb.d/init.sql" ] && [ "$f" != "/docker-entrypoint-initdb.d/tables.sql" ]; then
            echo "   - Running $f..."
            $MYSQL_CMD mrjz < "$f"
        fi
    done
    
    echo "✅ Database Configured!"
else
    echo "✅ Database already initialized."
fi

# 停止 MariaDB，把控制权交给 Supervisor
echo "🛑 Stopping temporary MariaDB..."
$MYSQLADMIN_CMD shutdown
echo "✅ MariaDB stopped."

# 3. 启动 Supervisor
echo "🔥 Starting Supervisor to manage all services..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
