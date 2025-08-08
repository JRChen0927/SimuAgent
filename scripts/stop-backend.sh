#!/bin/bash

# SimuAgent 停止后端服务脚本

echo "🛑 停止SimuAgent后端服务..."

SCRIPT_DIR="$(dirname "$0")"
PID_FILE="$SCRIPT_DIR/.backend.pid"

if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p $PID > /dev/null 2>&1; then
        echo "🔄 停止后端进程 (PID: $PID)..."
        kill $PID
        sleep 2
        
        # 强制杀死如果还在运行
        if ps -p $PID > /dev/null 2>&1; then
            echo "🔨 强制停止后端进程..."
            kill -9 $PID
        fi
        
        echo "✅ 后端服务已停止"
    else
        echo "⚠️  后端进程已经不存在"
    fi
    rm -f "$PID_FILE"
else
    # 尝试通过端口查找进程
    BACKEND_PID=$(lsof -ti:8000)
    if [ ! -z "$BACKEND_PID" ]; then
        echo "🔄 发现运行在8000端口的进程 (PID: $BACKEND_PID)，正在停止..."
        kill $BACKEND_PID
        sleep 2
        
        # 检查是否还在运行
        if lsof -ti:8000 > /dev/null 2>&1; then
            echo "🔨 强制停止进程..."
            kill -9 $BACKEND_PID
        fi
        echo "✅ 后端服务已停止"
    else
        echo "ℹ️  没有发现运行中的后端服务"
    fi
fi
