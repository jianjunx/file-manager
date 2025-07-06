#!/bin/bash

echo "测试文件管理器部署"
echo "=================="

# 检查Docker是否已安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

echo "✅ Docker 已安装"

# 检查端口是否被占用
if netstat -tuln | grep -q :8000; then
    echo "❌ 端口 8000 已被占用"
    exit 1
fi

echo "✅ 端口 8000 可用"

# 停止并删除已存在的容器
if docker ps -a --format '{{.Names}}' | grep -q "^file-manager$"; then
    echo "🔄 停止并删除已存在的容器..."
    docker stop file-manager >/dev/null 2>&1
    docker rm file-manager >/dev/null 2>&1
fi

# 创建测试数据目录
echo "📁 创建测试数据目录..."
mkdir -p test-data
echo "测试文件 - $(date)" > test-data/test.txt
echo "Hello World" > test-data/hello.txt
mkdir -p test-data/测试目录

# 构建镜像
echo "🏗️  构建 Docker 镜像..."
if ! docker build -t file-manager . -q; then
    echo "❌ 构建 Docker 镜像失败"
    exit 1
fi

echo "✅ Docker 镜像构建成功"

# 启动容器
echo "🚀 启动容器..."
if ! docker run -d \
    --name file-manager \
    -p 8000:8000 \
    -v $(pwd)/test-data:/data \
    file-manager >/dev/null 2>&1; then
    echo "❌ 容器启动失败"
    exit 1
fi

echo "✅ 容器启动成功"

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 5

# 测试健康检查
echo "🏥 检查服务状态..."
for i in {1..10}; do
    if curl -sf http://localhost:8000/ >/dev/null 2>&1; then
        echo "✅ 服务正常运行"
        break
    fi
    if [ $i -eq 10 ]; then
        echo "❌ 服务启动失败"
        echo "查看日志:"
        docker logs file-manager
        exit 1
    fi
    sleep 2
done

echo ""
echo "🎉 部署测试成功！"
echo "📍 访问地址: http://localhost:8000"
echo "📂 测试数据目录: $(pwd)/test-data"
echo ""
echo "管理命令:"
echo "  查看日志: docker logs file-manager"
echo "  停止容器: docker stop file-manager"
echo "  删除容器: docker rm file-manager"
echo "  清理数据: rm -rf test-data" 