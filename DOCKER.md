# MRJZ Docker 部署指南

## 📋 前置要求

只需要安装 **Docker Desktop**：
- Windows: [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)
- macOS: [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop)
- Linux: 安装 Docker 和 Docker Compose

**不需要**安装 Node.js、MySQL 或其他依赖！

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/HuangLA/mrjz-dota2-tournament-stats.git
cd mrjz-dota2-tournament-stats
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑配置文件
nano .env  # Linux/Mac
notepad .env  # Windows
```

**必须配置的项目**：

```env
# Steam API Key (必需)
# 获取地址: https://steamcommunity.com/dev/apikey
STEAM_API_KEY=你的Steam_API_Key

# 数据库密码（建议修改）
MYSQL_ROOT_PASSWORD=设置一个强密码
MYSQL_PASSWORD=设置一个强密码
```

### 3. 启动服务

```bash
docker-compose up -d
```

首次启动会自动：
- 下载 MySQL、Node.js、Nginx 镜像
- 创建数据库
- 导入表结构
- 启动所有服务

### 4. 访问应用

- **前端**: http://localhost:5173
- **后端 API**: http://localhost:3001
- **健康检查**: http://localhost:3001/health

## 📊 端口配置

### 默认端口

| 服务 | 默认端口 | 说明 |
|------|---------|------|
| Frontend | 5173 | 前端访问端口 |
| Backend | 3001 | 后端 API 端口 |
| MySQL | 3306 | 数据库端口 |

### 自定义端口

如果默认端口被占用，编辑 `.env` 文件：

```env
FRONTEND_PORT=8080  # 改为 8080
BACKEND_PORT=3002   # 改为 3002
MYSQL_PORT=3307     # 改为 3307
```

然后重启服务：

```bash
docker-compose down
docker-compose up -d
```

## 🔧 常用命令

### 查看服务状态

```bash
docker-compose ps
```

### 查看日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

### 停止服务

```bash
docker-compose down
```

### 重启服务

```bash
docker-compose restart
```

### 完全清理（包括数据）

```bash
# ⚠️ 警告：这会删除所有数据！
docker-compose down -v
```

## 🔍 故障排查

### 端口被占用

**错误信息**：
```
Error: bind: address already in use
```

**解决方法**：

1. 查看哪个程序占用了端口：

```bash
# Windows
netstat -ano | findstr :5173

# Linux/Mac
lsof -i :5173
```

2. 修改 `.env` 中的端口配置
3. 重启服务

### 数据库连接失败

**错误信息**：
```
Error: connect ECONNREFUSED
```

**解决方法**：

1. 检查 MySQL 容器是否正常运行：
```bash
docker-compose ps mysql
```

2. 查看 MySQL 日志：
```bash
docker-compose logs mysql
```

3. 确保 `.env` 中的数据库密码配置正确

### Steam API Key 未配置

**错误信息**：
```
Steam API request failed
```

**解决方法**：

1. 编辑 `.env` 文件
2. 填写正确的 `STEAM_API_KEY`
3. 重启后端服务：
```bash
docker-compose restart backend
```

## 📦 数据管理

### 备份数据库

```bash
# 导出数据库
docker-compose exec mysql mysqldump -u root -p${MYSQL_ROOT_PASSWORD} mrjz > backup.sql

# 或使用简化命令
docker-compose exec mysql mysqldump -u root -pYOUR_PASSWORD mrjz > backup.sql
```

### 恢复数据库

```bash
# 导入数据库
docker-compose exec -T mysql mysql -u root -p${MYSQL_ROOT_PASSWORD} mrjz < backup.sql
```

### 查看数据库

```bash
# 进入 MySQL 容器
docker-compose exec mysql mysql -u root -p

# 输入密码后执行 SQL
USE mrjz;
SHOW TABLES;
SELECT COUNT(*) FROM matches;
```

## 🔄 更新应用

### 拉取最新代码

```bash
git pull origin main
```

### 重新构建镜像

```bash
docker-compose build
docker-compose up -d
```

### 仅重新构建特定服务

```bash
# 重新构建后端
docker-compose build backend
docker-compose up -d backend

# 重新构建前端
docker-compose build frontend
docker-compose up -d frontend
```

## 🌐 生产环境部署

### 使用 HTTPS

1. 获取 SSL 证书（Let's Encrypt）
2. 修改 `frontend/nginx.conf` 添加 SSL 配置
3. 在 `docker-compose.yml` 中映射证书文件

### 环境变量安全

- ✅ 使用强密码
- ✅ 不要将 `.env` 提交到 Git
- ✅ 定期更换密码
- ✅ 限制 MySQL 端口暴露（注释掉 `docker-compose.yml` 中的 MySQL ports）

### 性能优化

1. **增加资源限制**：

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
```

2. **启用日志轮转**：

```yaml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## 📝 开发模式

如果需要在 Docker 中进行开发（热重载）：

```bash
# 使用开发配置
docker-compose -f docker-compose.dev.yml up
```

## ❓ 常见问题

### Q: 首次启动需要多长时间？
A: 首次启动需要下载镜像（约 1-2GB），大约需要 5-10 分钟（取决于网络速度）。

### Q: 数据会丢失吗？
A: 不会。数据保存在 Docker Volume 中，除非执行 `docker-compose down -v`。

### Q: 可以同时运行多个实例吗？
A: 可以，但需要使用不同的端口配置。

### Q: 如何查看容器内部文件？
A: 使用 `docker-compose exec backend sh` 进入容器。

## 📞 获取帮助

如果遇到问题：

1. 查看日志：`docker-compose logs -f`
2. 检查服务状态：`docker-compose ps`
3. 提交 Issue：[GitHub Issues](https://github.com/HuangLA/mrjz-dota2-tournament-stats/issues)

## 🎉 成功部署！

如果一切正常，你应该能够：
- ✅ 访问 http://localhost:5173 看到前端界面
- ✅ 访问 http://localhost:3001/health 看到 `{"status":"ok"}`
- ✅ 在前端看到比赛数据

享受使用 MRJZ！🎮
