# SimuAgent 启动脚本使用指南

## 📋 脚本概览

这个目录包含了SimuAgent项目的完整启动管理脚本，提供了灵活的服务启动、停止和管理功能。

## 🚀 快速启动

### 一键启动 (推荐)
```bash
# 启动所有服务 (前后端)
./scripts/start-all.sh
```

### 分别启动
```bash
# 只启动后端
./scripts/start-backend.sh

# 只启动前端
./scripts/start-frontend.sh
```

### 后台启动
```bash
# 后端后台启动
./scripts/start-backend.sh --daemon

# 前端后台启动  
./scripts/start-frontend.sh --daemon
```

## 🛑 停止服务

```bash
# 停止所有服务
./scripts/stop-all.sh

# 只停止后端
./scripts/stop-backend.sh

# 只停止前端
./scripts/stop-frontend.sh
```

## 📊 服务管理

```bash
# 查看服务状态
./scripts/status.sh
```

## 📁 脚本说明

| 脚本文件 | 功能 | 说明 |
|---------|------|------|
| `start-all.sh` | 一键启动所有服务 | 后台启动前后端，提供交互管理界面 |
| `start-backend.sh` | 启动后端服务 | 支持前台/后台模式 |
| `start-frontend.sh` | 启动前端服务 | 支持前台/后台模式 |
| `stop-all.sh` | 停止所有服务 | 优雅停止前后端服务 |
| `stop-backend.sh` | 停止后端服务 | 通过PID或端口停止 |
| `stop-frontend.sh` | 停止前端服务 | 通过PID或端口停止 |
| `status.sh` | 查看服务状态 | 显示详细的服务运行状态 |

## 🔧 使用场景

### 开发场景
```bash
# 开发时分别启动，便于查看日志
./scripts/start-backend.sh    # 终端1
./scripts/start-frontend.sh   # 终端2
```

### 演示场景
```bash
# 一键启动，后台运行
./scripts/start-all.sh
# 选择后台模式，然后可以关闭终端
```

### 测试场景
```bash
# 快速重启测试
./scripts/stop-all.sh && ./scripts/start-all.sh
```

## 📝 特性说明

### 智能检测
- 自动检测系统要求 (Python3, Node.js)
- 自动创建必要目录
- 智能PID管理和端口检测

### 进程管理
- 支持优雅停止和强制停止
- PID文件管理 (`.backend.pid`, `.frontend.pid`)
- 端口占用检测和清理

### 用户友好
- 彩色输出和图标提示
- 详细的状态信息
- 交互式管理界面

### 健壮性
- 错误处理和恢复
- 多种停止方式 (PID/端口)
- 依赖检查和提示

## 🔍 故障排除

### 端口被占用
```bash
# 查看端口使用情况
./scripts/status.sh

# 强制停止占用端口的进程
./scripts/stop-all.sh
```

### 启动失败
```bash
# 检查系统要求
which python3 node npm

# 查看详细错误信息
./scripts/start-backend.sh  # 前台模式查看错误
```

### 进程残留
```bash
# 手动清理
killall -9 uvicorn node

# 或使用停止脚本
./scripts/stop-all.sh
```

## 💡 最佳实践

1. **开发时**: 使用分别启动，便于调试
2. **演示时**: 使用一键启动，简单快捷
3. **部署时**: 考虑使用后台模式
4. **问题排查**: 先查看 `./scripts/status.sh`

## 🔗 相关命令

```bash
# 兼容性启动 (旧版本)
./start.sh

# 直接使用npm/uvicorn
cd frontend && npm run dev
cd backend && source venv/bin/activate && uvicorn app.main:app --reload

# 健康检查
curl http://localhost:8000/health
curl http://localhost:5173
```

## 📚 更多信息

- 查看 [DEVELOPMENT.md](../DEVELOPMENT.md) 了解详细开发指南
- 查看 [README.md](../README.md) 了解项目概览
