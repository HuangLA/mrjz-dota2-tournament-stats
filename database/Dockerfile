FROM mysql:8.0

# 将初始化脚本复制到镜像中
# 这避免了在不同宿主机（如 NAS、Windows）上的卷挂载权限问题
COPY init /docker-entrypoint-initdb.d/

# 确保脚本有正确的权限
RUN chmod -R 755 /docker-entrypoint-initdb.d/
