#!/bin/bash

# SimuAgent 停止前端服务脚本

echo "🛑 停止SimuAgent前端服务..."

SCRIPT_DIR="$(dirname "$0")"
PID_FILE="$SCRIPT_DIR/.frontend.pid"

if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p $PID > /dev/null 2>&1; then
        echo "🔄 停止前端进程 (PID: $PID)..."
        kill $PID
        sleep 2
        
        # 强制杀死如果还在运行
        if ps -p $PID > /dev/null 2>&1; then
            echo "🔨 强制停止前端进程..."
            kill -9 $PID
        fi
        
        echo "✅ 前端服务已停止"
    else
        echo "⚠️  前端进程已经不存在"
    fi
    rm -f "$PID_FILE"
else
    # 尝试通过端口查找进程
    FRONTEND_PID=$(lsof -ti:5173)
    if [ ! -z "$FRONTEND_PID" ]; then
        echo "🔄 发现运行在5173端口的进程 (PID: $FRONTEND_PID)，正在停止..."
        kill $FRONTEND_PID
        sleep 2
        
        # 检查是否还在运行
        if lsof -ti:5173 > /dev/null 2>&1; then
            echo "🔨 强制停止进程..."
            kill -9 $FRONTEND_PID
        fi
        echo "✅ 前端服务已停止"
    else
        echo "ℹ️  没有发现运行中的前端服务"
    fi
fi
