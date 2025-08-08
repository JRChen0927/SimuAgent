#!/bin/bash

# SimuAgent 后端启动脚本

echo "🔧 启动SimuAgent后端服务..."
echo "=================================="

# 检查Python是否安装
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 未找到，请先安装Python3"
    exit 1
fi

# 进入后端目录
cd "$(dirname "$0")/../backend" || exit 1

# 检查虚拟环境
if [ ! -d "venv" ]; then
    echo "🔄 创建Python虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境
echo "📦 激活虚拟环境..."
source venv/bin/activate

# 安装依赖
echo "📦 检查并安装Python依赖..."
pip install -r requirements-minimal.txt > /dev/null 2>&1

# 创建必要的目录
echo "📁 创建必要的目录..."
mkdir -p ../data/uploads ../data/processed ../database

# 启动后端
echo "🚀 启动FastAPI后端服务器..."
echo "📡 后端将运行在: http://localhost:8000"
echo "📚 API文档地址: http://localhost:8000/docs"
echo ""
echo "⏹️  按 Ctrl+C 停止后端服务"
echo ""

# 根据参数决定启动方式
if [ "$1" = "--daemon" ]; then
    echo "🔄 以后台模式启动..."
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > /dev/null 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../scripts/.backend.pid
    echo "✅ 后端已在后台启动 (PID: $BACKEND_PID)"
else
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
fi
