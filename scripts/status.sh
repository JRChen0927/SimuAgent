#!/bin/bash

# SimuAgent 服务状态检查脚本

echo "📊 SimuAgent 服务状态"
echo "===================="

# 检查后端状态
echo "🔧 后端服务状态:"
BACKEND_PID=$(lsof -ti:8000 2>/dev/null)
if [ ! -z "$BACKEND_PID" ]; then
    echo "  ✅ 运行中 (PID: $BACKEND_PID)"
    echo "  📡 地址: http://localhost:8000"
    
    # 检查健康状态
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo "  💚 健康检查: 通过"
    else
        echo "  🟡 健康检查: 未响应"
    fi
else
    echo "  ❌ 未运行"
fi

echo ""

# 检查前端状态
echo "🎨 前端服务状态:"
FRONTEND_PID=$(lsof -ti:5173 2>/dev/null)
if [ ! -z "$FRONTEND_PID" ]; then
    echo "  ✅ 运行中 (PID: $FRONTEND_PID)"
    echo "  🌐 地址: http://localhost:5173"
    
    # 检查端口响应
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        echo "  💚 连接检查: 通过"
    else
        echo "  🟡 连接检查: 未响应"
    fi
else
    echo "  ❌ 未运行"
fi

echo ""

# 检查依赖服务
echo "🔗 依赖服务状态:"

# 检查Ollama
if command -v ollama &> /dev/null; then
    echo "  📦 Ollama: 已安装"
    if curl -s http://localhost:11434 > /dev/null 2>&1; then
        echo "    ✅ 服务运行中"
    else
        echo "    ⚠️  服务未启动 (可选)"
    fi
else
    echo "  📦 Ollama: 未安装 (可选)"
fi

echo ""

# 显示端口使用情况
echo "🌐 端口使用情况:"
echo "  Port 8000 (后端): $(lsof -ti:8000 2>/dev/null || echo '空闲')"
echo "  Port 5173 (前端): $(lsof -ti:5173 2>/dev/null || echo '空闲')"
echo "  Port 11434 (Ollama): $(lsof -ti:11434 2>/dev/null || echo '空闲')"

echo ""

# 显示系统资源
echo "💻 系统资源:"
if command -v ps &> /dev/null; then
    if [ ! -z "$BACKEND_PID" ]; then
        BACKEND_MEM=$(ps -p $BACKEND_PID -o %mem --no-headers 2>/dev/null | tr -d ' ')
        echo "  🔧 后端内存使用: ${BACKEND_MEM}%"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        FRONTEND_MEM=$(ps -p $FRONTEND_PID -o %mem --no-headers 2>/dev/null | tr -d ' ')
        echo "  🎨 前端内存使用: ${FRONTEND_MEM}%"
    fi
fi

echo ""

# 显示日志文件
echo "📝 日志文件:"
BACKEND_LOG="../backend/logs/app.log"
FRONTEND_LOG="../frontend/logs/app.log"

if [ -f "$BACKEND_LOG" ]; then
    echo "  🔧 后端日志: $BACKEND_LOG"
else
    echo "  🔧 后端日志: 输出到控制台"
fi

if [ -f "$FRONTEND_LOG" ]; then
    echo "  🎨 前端日志: $FRONTEND_LOG"
else
    echo "  🎨 前端日志: 输出到控制台"
fi

echo ""
echo "💡 管理命令:"
echo "  启动: ./scripts/start-all.sh"
echo "  停止: ./scripts/stop-all.sh"
echo "  后端: ./scripts/start-backend.sh | ./scripts/stop-backend.sh"
echo "  前端: ./scripts/start-frontend.sh | ./scripts/stop-frontend.sh"
