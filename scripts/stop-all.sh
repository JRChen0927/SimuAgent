#!/bin/bash

# SimuAgent 停止所有服务脚本

echo "🛑 停止SimuAgent所有服务..."
echo "=========================="

SCRIPT_DIR="$(dirname "$0")"

# 停止后端
echo "🔧 停止后端服务..."
"$SCRIPT_DIR/stop-backend.sh"

echo ""

# 停止前端
echo "🎨 停止前端服务..."
"$SCRIPT_DIR/stop-frontend.sh"

echo ""
echo "✅ 所有服务已停止"
echo ""

# 清理PID文件
rm -f "$SCRIPT_DIR/.backend.pid"
rm -f "$SCRIPT_DIR/.frontend.pid"

echo "🧹 清理完成"
