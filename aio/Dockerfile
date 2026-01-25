# ==========================================
# All-in-One Dockerfile for MRJZ
# Contains: Node.js (Backend), Nginx (Frontend), MariaDB (Database)
# ==========================================

# --- Stage 1: Build Frontend ---
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
# 复制 package.json 并安装依赖
COPY frontend/package*.json ./
RUN npm install
# 复制源代码并构建
COPY frontend/ ./
# 设置构建时的 API URL (由于是本地反代，这里可以用 /api)
ENV VITE_API_URL=/api
RUN npm run build

# --- Stage 2: Final Image ---
FROM node:18-bullseye-slim

# 安装 Nginx, MariaDB 和 Supervisor
RUN apt-get update && apt-get install -y \
    nginx \
    mariadb-server \
    supervisor \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 1. 设置 Backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --production
COPY backend/ ./

# 2. 设置 Frontend (从构建阶段复制)
COPY --from=frontend-builder /app/frontend/dist /var/www/html
# 修复权限问题：确保 www-data (Nginx 用户) 可以读取文件
RUN chown -R www-data:www-data /var/www/html && \
    chmod -R 755 /var/www/html

# 3. 设置 Database 初始化脚本
COPY database/*.sql /docker-entrypoint-initdb.d/
COPY database/init/*.sql /docker-entrypoint-initdb.d/

# 4. 配置 Nginx
COPY aio/nginx.conf /etc/nginx/sites-available/default

# 5. 配置 Supervisor
COPY aio/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# 6. 复制启动脚本
COPY aio/entrypoint.sh /item/entrypoint.sh
RUN chmod +x /item/entrypoint.sh

# 环境变量 (默认值)
ENV PORT=3001
ENV NODE_ENV=production
ENV DB_HOST=127.0.0.1
ENV DB_USER=root
ENV DB_PASSWORD=mrjz_password
ENV DB_NAME=mrjz

# 暴露端口
EXPOSE 80

# 启动
ENTRYPOINT ["/item/entrypoint.sh"]
