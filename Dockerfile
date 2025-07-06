FROM docker.io/denoland/deno:2.4.0

# 设置工作目录
WORKDIR /app

# 复制依赖文件
COPY deno.json .
COPY fresh.config.ts .
COPY config.ts .

# 复制源代码
COPY . .

# 设置权限
RUN chmod -R 755 /app

# 预编译和缓存依赖
RUN deno cache main.ts

# 预编译 Tailwind 样式
RUN deno task build

# 创建非root用户
RUN groupadd -r appuser && useradd -r -g appuser appuser

# 设置环境变量
ENV DENO_DIR=/app/.deno
ENV PORT=8000

# 创建必要的目录并设置权限
RUN mkdir -p /data && \
    mkdir -p /home/appuser/.cache && \
    chown -R appuser:appuser /data /app /home/appuser

# 切换到非root用户
USER appuser

# 暴露端口
EXPOSE 8000

# 创建数据卷
VOLUME ["/data"]

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD deno eval "await fetch('http://localhost:8000/').then(r => r.ok ? Deno.exit(0) : Deno.exit(1)).catch(() => Deno.exit(1))"

# 启动应用
CMD ["deno", "run", "--allow-net", "--allow-read", "--allow-write", "--allow-env", "main.ts"] 