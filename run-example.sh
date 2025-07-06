#!/bin/bash

echo "文件管理器 Docker 部署示例"
echo "========================="

# 创建示例数据目录
echo "创建示例数据目录..."
mkdir -p example-data
echo "示例文件" > example-data/test.txt
echo "Hello World" > example-data/hello.txt
mkdir -p example-data/子目录

echo "数据目录已创建: $(pwd)/example-data"

# 构建Docker镜像
echo -e "\n构建Docker镜像..."
docker build -t file-manager .

# 启动容器
echo -e "\n启动容器..."
docker run -d \
  --name file-manager \
  -p 8000:8000 \
  -v $(pwd)/example-data:/data \
  file-manager

echo -e "\n容器已启动！"
echo "访问地址: http://localhost:8000"
echo "数据目录: $(pwd)/example-data"
echo ""
echo "停止容器命令: docker stop file-manager"
echo "删除容器命令: docker rm file-manager"
echo "查看日志命令: docker logs file-manager" 