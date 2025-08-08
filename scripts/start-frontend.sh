#!/bin/bash

# SimuAgent 前端启动脚本

echo "🎨 启动SimuAgent前端服务..."
echo "=================================="

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未找到，请先安装Node.js"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm 未找到，请先安装npm"
    exit 1
fi

# 进入前端目录
cd "$(dirname "$0")/../frontend" || exit 1

# 安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装前端依赖..."
    npm install
else
    echo "📦 检查前端依赖..."
    npm install > /dev/null 2>&1
fi

# 启动前端
echo "🚀 启动前端开发服务器..."
echo "🌐 前端将运行在: http://localhost:5173"
echo "🌍 网络访问: http://$(hostname -I | awk '{print $1}'):5173 (如果有网络接口)"
echo ""
echo "⏹️  按 Ctrl+C 停止前端服务"
echo ""

# 根据参数决定启动方式
if [ "$1" = "--daemon" ]; then
    echo "🔄 以后台模式启动..."
    npm run dev > /dev/null 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../scripts/.frontend.pid
    echo "✅ 前端已在后台启动 (PID: $FRONTEND_PID)"
else
    npm run dev
fi
