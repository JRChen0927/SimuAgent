#!/bin/bash

# SimuAgent 一键启动脚本 (前后端)

echo "🚀 SimuAgent 一键启动"
echo "===================="

# 获取脚本目录
SCRIPT_DIR="$(dirname "$0")"

# 检查系统要求
echo "🔍 检查系统要求..."

if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 未找到，请先安装Python3"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未找到，请先安装Node.js"
    exit 1
fi

echo "✅ 系统要求检查通过"
echo ""

# 启动后端 (后台模式)
echo "🔧 启动后端服务..."
"$SCRIPT_DIR/start-backend.sh" --daemon

# 等待后端启动
echo "⏳ 等待后端服务启动..."
sleep 3

# 检查后端是否启动成功
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ 后端服务启动成功"
else
    echo "⚠️  后端服务可能未完全启动，但继续启动前端..."
fi

echo ""

# 启动前端 (后台模式)
echo "🎨 启动前端服务..."
"$SCRIPT_DIR/start-frontend.sh" --daemon

# 等待前端启动
echo "⏳ 等待前端服务启动..."
sleep 3

echo ""
echo "🎉 SimuAgent 启动完成！"
echo "========================"
echo ""
echo "📋 服务状态:"
echo "  🔧 后端服务: http://localhost:8000"
echo "  🎨 前端应用: http://localhost:5173"
echo "  📚 API文档: http://localhost:8000/docs"
echo ""
echo "💡 使用提示:"
echo "  - 访问前端应用开始使用SimuAgent"
echo "  - 查看API文档了解后端接口"
echo "  - 使用 './scripts/stop-all.sh' 停止所有服务"
echo "  - 使用 './scripts/status.sh' 查看服务状态"
echo ""
echo "📝 注意事项:"
echo "  - 确保已安装并启动Ollama服务 (可选)"
echo "  - 可通过 'ollama pull llama2' 下载模型"
echo ""
echo "🔍 查看日志:"
echo "  - 后端日志: tail -f backend/logs/backend.log (如果有)"
echo "  - 前端在浏览器控制台查看"
echo ""

# 提供交互选项
echo "选择操作:"
echo "  1) 查看服务状态"
echo "  2) 停止所有服务"
echo "  3) 重启所有服务"
echo "  4) 只重启后端"
echo "  5) 只重启前端"
echo "  6) 退出"
echo ""

while true; do
    read -p "请选择 (1-6): " choice
    case $choice in
        1)
            "$SCRIPT_DIR/status.sh"
            ;;
        2)
            "$SCRIPT_DIR/stop-all.sh"
            break
            ;;
        3)
            echo "🔄 重启所有服务..."
            "$SCRIPT_DIR/stop-all.sh"
            sleep 2
            "$SCRIPT_DIR/start-all.sh"
            break
            ;;
        4)
            echo "🔄 重启后端服务..."
            "$SCRIPT_DIR/stop-backend.sh"
            sleep 2
            "$SCRIPT_DIR/start-backend.sh" --daemon
            ;;
        5)
            echo "🔄 重启前端服务..."
            "$SCRIPT_DIR/stop-frontend.sh"
            sleep 2
            "$SCRIPT_DIR/start-frontend.sh" --daemon
            ;;
        6)
            echo "👋 退出管理界面"
            echo "💡 服务仍在后台运行，使用 './scripts/stop-all.sh' 停止"
            break
            ;;
        *)
            echo "❌ 无效选择，请输入 1-6"
            ;;
    esac
    echo ""
done
