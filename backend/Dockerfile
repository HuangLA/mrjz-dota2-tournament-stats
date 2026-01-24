# 使用 Node.js 18 Alpine 作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 安装 wget（用于健康检查）
RUN apk add --no-cache wget

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖（仅生产环境）
RUN npm ci --omit=dev

# 复制源代码
COPY . .

# 暴露端口
EXPOSE 3001

# 设置环境变量
ENV NODE_ENV=production

# 启动应用
CMD ["node", "src/server.js"]
