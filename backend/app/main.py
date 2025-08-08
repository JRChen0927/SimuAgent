from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings
from app.models.database import create_tables
from app.api import files, agents, conversations, config, evaluation

# 创建FastAPI应用
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="SimuAgent - Agent Platform Simulation",
    debug=settings.DEBUG
)

# 添加CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 创建必要的目录
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.PROCESSED_DIR, exist_ok=True)
os.makedirs("./database", exist_ok=True)

# 静态文件服务
if os.path.exists(settings.UPLOAD_DIR):
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

@app.on_event("startup")
async def startup_event():
    """应用启动时执行"""
    print(f"🚀 {settings.PROJECT_NAME} v{settings.VERSION} starting up...")
    print(f"📊 Database: {settings.DATABASE_URL}")
    print(f"📁 Upload directory: {settings.UPLOAD_DIR}")
    print(f"🤖 Ollama URL: {settings.OLLAMA_BASE_URL}")
    
    # 创建数据库表
    create_tables()
    print("✅ Database tables created/verified")

@app.get("/")
async def root():
    """根路径 - API信息"""
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API",
        "version": settings.VERSION,
        "status": "running",
        "docs": "/docs",
        "endpoints": {
            "files": "/api/files",
            "agents": "/api/agents", 
            "conversations": "/api/conversations",
            "config": "/api/config",
            "evaluation": "/api/evaluation"
        }
    }

@app.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy", "version": settings.VERSION}

# 包含API路由
app.include_router(files.router, prefix="/api/files", tags=["files"])
app.include_router(agents.router, prefix="/api/agents", tags=["agents"])
app.include_router(conversations.router, prefix="/api/conversations", tags=["conversations"])
app.include_router(config.router, prefix="/api/config", tags=["config"])
app.include_router(evaluation.router, prefix="/api/evaluation", tags=["evaluation"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    )
