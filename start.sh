#!/bin/bash

# SimuAgent 快速启动脚本 (兼容版本)
# 注意: 推荐使用 ./scripts/start-all.sh 获得更好的体验

echo "🚀 SimuAgent 快速启动脚本"
echo "========================="
echo ""
echo "💡 提示: 现在有更好的启动选项！"
echo "  🔧 单独启动后端: ./scripts/start-backend.sh"
echo "  🎨 单独启动前端: ./scripts/start-frontend.sh"
echo "  🚀 一键启动所有: ./scripts/start-all.sh"
echo "  📊 查看服务状态: ./scripts/status.sh"
echo "  🛑 停止所有服务: ./scripts/stop-all.sh"
echo ""

read -p "是否使用新的一键启动脚本? (y/n): " use_new_script

if [[ $use_new_script =~ ^[Yy]$ ]]; then
    echo "🔄 启动新的一键启动脚本..."
    exec ./scripts/start-all.sh
fi

echo ""
echo "📝 继续使用旧版启动方式..."
echo ""

# 原有的启动逻辑 (简化版)
# 检查系统要求
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 未找到，请先安装Python3"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未找到，请先安装Node.js"
    exit 1
fi

echo "✅ 系统要求检查通过"

# 创建必要的目录
mkdir -p data/uploads data/processed database

# 启动后端 (后台)
echo "🔧 启动后端服务..."
./scripts/start-backend.sh --daemon

# 等待后端启动
sleep 3

# 启动前端 (前台)
echo "🎨 启动前端服务..."
cd frontend
npm install > /dev/null 2>&1
echo ""
echo "✅ SimuAgent 启动完成！"
echo "========================"
echo "🌐 前端访问地址: http://localhost:5173"
echo "📡 后端API地址: http://localhost:8000"
echo "📚 API文档: http://localhost:8000/docs"
echo ""
echo "⏹️  按 Ctrl+C 停止前端服务"
echo "💡 使用 './scripts/stop-all.sh' 停止所有服务"
echo ""

npm run dev
