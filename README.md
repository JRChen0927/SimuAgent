# SimuAgent - Agent Platform Simulation

## 项目概述
SimuAgent是一个智能Agent平台仿真项目，支持多种知识库格式导入，自适应生成对话Agent，并提供RL数据生成功能。

## 核心特性
- 🗂️ **多格式知识库支持**: JSON, TXT, PDF等文件格式
- 🤖 **智能Agent生成**: 基于LlamaIndex的自适应Agent创建
- 🔧 **可插拔模型**: 支持Ollama等多种LLM模型切换
- 💬 **对话测试**: 实时Agent对话能力测试
- 📊 **A/B测试**: 多Agent横向对比
- 🎯 **RL数据生成**: 格式化的强化学习训练数据输出

## 技术栈
- **Agent框架**: LlamaIndex
- **大模型**: Ollama (可插拔)
- **后端**: FastAPI
- **前端**: React + Vite + Tailwind CSS
- **数据库**: SQLite
- **知识库**: 本地文件 (RAG)

## 项目结构
```
SimuAgent/
├── backend/                 # FastAPI后端
│   ├── app/
│   │   ├── api/            # API路由
│   │   ├── core/           # 核心配置
│   │   ├── models/         # 数据模型
│   │   ├── services/       # 业务逻辑
│   │   └── main.py         # 应用入口
│   ├── requirements.txt    # Python依赖
│   └── config.json         # 可插拔配置
├── frontend/               # React前端
│   ├── src/
│   │   ├── components/     # UI组件
│   │   ├── pages/          # 页面组件
│   │   ├── hooks/          # 自定义Hooks
│   │   ├── services/       # API服务
│   │   └── main.tsx        # 应用入口
│   ├── package.json
│   └── vite.config.ts
├── data/                   # 知识库存储
│   ├── uploads/            # 上传文件
│   └── processed/          # 处理后的文件
├── database/               # SQLite数据库
└── config.json            # 全局配置
```

## 🚀 快速开始

### 一键启动 (推荐)
```bash
# 启动所有服务
./scripts/start-all.sh

# 查看服务状态
./scripts/status.sh

# 停止所有服务
./scripts/stop-all.sh
```

### 分别启动
```bash
# 启动后端
./scripts/start-backend.sh

# 启动前端
./scripts/start-frontend.sh

# 后台启动
./scripts/start-backend.sh --daemon
./scripts/start-frontend.sh --daemon
```

### 传统方式启动
```bash
# 兼容性启动脚本
./start.sh

# 手动启动
cd backend && source venv/bin/activate && uvicorn app.main:app --reload
cd frontend && npm run dev
```

### Ollama模型准备 (可选)
```bash
# 安装Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# 启动服务
ollama serve

# 拉取推荐模型
ollama pull llama2
ollama pull codellama
```

### 📋 管理命令速查

| 命令 | 功能 |
|------|------|
| `./scripts/start-all.sh` | 一键启动所有服务 |
| `./scripts/stop-all.sh` | 停止所有服务 |
| `./scripts/status.sh` | 查看服务状态 |
| `./scripts/start-backend.sh` | 单独启动后端 |
| `./scripts/start-frontend.sh` | 单独启动前端 |

## 开发路线图
- [x] 项目架构设计
- [ ] 基础后端API
- [ ] 前端UI框架
- [ ] 知识库处理
- [ ] Agent生成逻辑
- [ ] 对话测试功能
- [ ] A/B测试模块
- [ ] RL数据导出

## 贡献指南
欢迎提交Issue和Pull Request来改进这个项目。

## 许可证
MIT License
