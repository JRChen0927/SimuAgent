# SimuAgent 开发指南

## 快速开始

### 1. 环境要求

- **Python**: 3.8+
- **Node.js**: 16+
- **Ollama**: 用于本地LLM推理

### 2. 一键启动

```bash
# 克隆项目（如果是新环境）
git clone <your-repo-url>
cd SimuAgent

# 运行启动脚本
./start.sh
```

启动脚本会自动：
- 创建必要的目录
- 设置Python虚拟环境
- 安装所有依赖
- 启动后端和前端服务

### 3. 手动启动（推荐开发时使用）

#### 后端启动
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### 前端启动
```bash
cd frontend
npm install
npm run dev
```

### 4. Ollama模型准备

```bash
# 安装Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# 启动Ollama服务
ollama serve

# 拉取推荐模型
ollama pull llama2
ollama pull codellama
```

## 项目架构

### 后端架构 (FastAPI)

```
backend/
├── app/
│   ├── api/              # API路由层
│   │   ├── files.py      # 文件管理API
│   │   ├── agents.py     # Agent管理API
│   │   ├── conversations.py # 对话API
│   │   ├── config.py     # 配置管理API
│   │   └── evaluation.py # 评估API
│   ├── core/             # 核心配置
│   │   └── config.py     # 配置管理器
│   ├── models/           # 数据模型
│   │   └── database.py   # SQLAlchemy模型
│   ├── services/         # 业务逻辑层（待扩展）
│   └── main.py           # 应用入口
└── requirements.txt      # Python依赖
```

### 前端架构 (React + TypeScript)

```
frontend/
├── src/
│   ├── components/       # UI组件
│   │   └── Layout.tsx    # 布局组件
│   ├── pages/            # 页面组件
│   │   ├── DataManagement.tsx
│   │   ├── SimulationConfig.tsx
│   │   ├── SimulationResults.tsx
│   │   └── Settings.tsx
│   ├── hooks/            # 自定义Hooks（待扩展）
│   ├── services/         # API服务（待扩展）
│   ├── App.tsx           # 应用根组件
│   ├── main.tsx          # 应用入口
│   └── index.css         # 全局样式
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

## API文档

启动后端后，访问 `http://localhost:8000/docs` 查看完整的API文档。

### 主要API端点

#### 文件管理
- `POST /api/files/upload` - 上传文件
- `GET /api/files/` - 获取文件列表
- `GET /api/files/{id}/preview` - 预览文件
- `DELETE /api/files/{id}` - 删除文件

#### Agent管理
- `POST /api/agents/` - 创建Agent
- `GET /api/agents/` - 获取Agent列表
- `PUT /api/agents/{id}` - 更新Agent
- `DELETE /api/agents/{id}` - 删除Agent

#### 对话管理
- `POST /api/conversations/chat` - 发送对话
- `GET /api/conversations/` - 获取对话历史
- `GET /api/conversations/stats/agent/{id}` - 获取Agent统计

#### 配置管理
- `GET /api/config/` - 获取配置
- `PUT /api/config/` - 更新配置
- `GET /api/config/models` - 获取模型配置

## 开发工作流

### 1. 添加新功能

1. **后端开发**:
   - 在 `app/models/database.py` 中添加新的数据模型
   - 在 `app/api/` 中创建新的API路由
   - 在 `app/services/` 中添加业务逻辑（如果需要）

2. **前端开发**:
   - 在 `src/pages/` 中创建新页面
   - 在 `src/components/` 中创建可复用组件
   - 更新路由配置

### 2. 数据库迁移

项目使用SQLite，数据库文件位于 `database/simuagent.db`。
如果修改了数据模型，删除数据库文件重启应用即可重新创建。

### 3. 配置管理

项目的可插拔配置在根目录的 `config.json` 中管理。
- 添加新的模型提供商
- 修改支持的文件格式
- 调整默认参数

## 待实现功能

### 高优先级
1. **LlamaIndex集成** - 真实的知识库处理
2. **Ollama集成** - 真实的LLM调用
3. **文件处理服务** - PDF/DOCX等格式的内容提取

### 中优先级
1. **A/B测试完善** - 完整的对比测试流程
2. **评估系统** - 用户评分和自动评估
3. **RL数据导出优化** - 更多格式和筛选选项

### 低优先级
1. **用户管理** - 多用户支持
2. **批量测试** - 自动化测试套件
3. **可视化图表** - 性能趋势和分析

## 故障排除

### 常见问题

1. **后端启动失败**
   - 检查Python版本 (3.8+)
   - 确保已激活虚拟环境
   - 检查端口8000是否被占用

2. **前端启动失败**
   - 检查Node.js版本 (16+)
   - 删除 `node_modules` 重新安装
   - 检查端口5173是否被占用

3. **文件上传失败**
   - 检查 `data/uploads` 目录权限
   - 确认文件大小不超过50MB
   - 检查文件格式是否支持

4. **模型调用失败**
   - 确认Ollama服务正在运行
   - 检查模型是否已下载
   - 确认配置中的模型URL正确

### 日志查看

- **后端日志**: 终端输出或使用 `--log-level debug`
- **前端日志**: 浏览器开发者工具Console
- **网络请求**: 浏览器开发者工具Network

## 贡献指南

1. Fork项目
2. 创建功能分支 (`git checkout -b feature/new-feature`)
3. 提交更改 (`git commit -am 'Add new feature'`)
4. 推送到分支 (`git push origin feature/new-feature`)
5. 创建Pull Request

## 技术栈说明

### 为什么选择这些技术？

- **FastAPI**: 现代、快速的Python Web框架，自动生成API文档
- **React + TypeScript**: 类型安全的前端开发，组件化架构
- **Tailwind CSS**: 实用的CSS框架，快速UI开发
- **SQLite**: 轻量级数据库，零配置，适合原型开发
- **Vite**: 快速的前端构建工具
- **LlamaIndex**: 专业的RAG框架
- **Ollama**: 本地LLM推理，隐私安全

这个技术栈提供了：
- **快速开发**: 最小化配置，专注业务逻辑
- **可扩展性**: 模块化架构，易于添加新功能
- **可维护性**: 类型安全，清晰的代码结构
- **可部署性**: 支持本地部署和云端部署
