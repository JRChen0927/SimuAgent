from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.models.database import get_db, Agent
from app.core.config import config_manager

router = APIRouter()

class AgentCreate(BaseModel):
    name: str
    description: Optional[str] = None
    prompt: str
    model_provider: str
    model_name: str
    temperature: float = 0.7
    max_tokens: int = 1000

class AgentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    prompt: Optional[str] = None
    model_provider: Optional[str] = None
    model_name: Optional[str] = None
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None
    is_active: Optional[bool] = None

class AgentResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    prompt: str
    model_provider: str
    model_name: str
    temperature: float
    max_tokens: int
    created_time: datetime
    updated_time: datetime
    is_active: bool

@router.post("/", response_model=AgentResponse)
async def create_agent(agent: AgentCreate, db: Session = Depends(get_db)):
    """创建新的Agent"""
    
    # 验证模型是否可用
    available_models = config_manager.get_available_models(agent.model_provider)
    model_names = [model.get("name") for model in available_models if model.get("enabled", False)]
    
    if agent.model_name not in model_names:
        raise HTTPException(
            status_code=400,
            detail=f"Model '{agent.model_name}' not available in provider '{agent.model_provider}'"
        )
    
    try:
        db_agent = Agent(
            name=agent.name,
            description=agent.description,
            prompt=agent.prompt,
            model_provider=agent.model_provider,
            model_name=agent.model_name,
            temperature=agent.temperature,
            max_tokens=agent.max_tokens,
            created_time=datetime.utcnow(),
            updated_time=datetime.utcnow()
        )
        
        db.add(db_agent)
        db.commit()
        db.refresh(db_agent)
        
        return db_agent
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create agent: {str(e)}")

@router.get("/", response_model=List[AgentResponse])
async def list_agents(
    skip: int = 0, 
    limit: int = 100, 
    active_only: bool = True,
    db: Session = Depends(get_db)
):
    """获取Agent列表"""
    query = db.query(Agent)
    
    if active_only:
        query = query.filter(Agent.is_active == True)
    
    agents = query.offset(skip).limit(limit).all()
    return agents

@router.get("/{agent_id}", response_model=AgentResponse)
async def get_agent(agent_id: int, db: Session = Depends(get_db)):
    """获取指定Agent"""
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    return agent

@router.put("/{agent_id}", response_model=AgentResponse)
async def update_agent(
    agent_id: int, 
    agent_update: AgentUpdate, 
    db: Session = Depends(get_db)
):
    """更新Agent"""
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    # 如果更新了模型，验证模型是否可用
    if agent_update.model_provider and agent_update.model_name:
        available_models = config_manager.get_available_models(agent_update.model_provider)
        model_names = [model.get("name") for model in available_models if model.get("enabled", False)]
        
        if agent_update.model_name not in model_names:
            raise HTTPException(
                status_code=400,
                detail=f"Model '{agent_update.model_name}' not available in provider '{agent_update.model_provider}'"
            )
    
    try:
        # 更新字段
        update_data = agent_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(agent, field, value)
        
        agent.updated_time = datetime.utcnow()
        
        db.commit()
        db.refresh(agent)
        
        return agent
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update agent: {str(e)}")

@router.delete("/{agent_id}")
async def delete_agent(agent_id: int, db: Session = Depends(get_db)):
    """删除Agent（软删除）"""
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    try:
        agent.is_active = False
        agent.updated_time = datetime.utcnow()
        
        db.commit()
        
        return {"message": "Agent deleted successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete agent: {str(e)}")

@router.post("/{agent_id}/clone")
async def clone_agent(agent_id: int, db: Session = Depends(get_db)):
    """克隆Agent"""
    original_agent = db.query(Agent).filter(Agent.id == agent_id).first()
    
    if not original_agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    try:
        cloned_agent = Agent(
            name=f"{original_agent.name} (Copy)",
            description=original_agent.description,
            prompt=original_agent.prompt,
            model_provider=original_agent.model_provider,
            model_name=original_agent.model_name,
            temperature=original_agent.temperature,
            max_tokens=original_agent.max_tokens,
            created_time=datetime.utcnow(),
            updated_time=datetime.utcnow()
        )
        
        db.add(cloned_agent)
        db.commit()
        db.refresh(cloned_agent)
        
        return cloned_agent
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clone agent: {str(e)}")

@router.get("/{agent_id}/validate")
async def validate_agent_config(agent_id: int, db: Session = Depends(get_db)):
    """验证Agent配置是否有效"""
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    # 检查模型是否仍然可用
    available_models = config_manager.get_available_models(agent.model_provider)
    model_names = [model.get("name") for model in available_models if model.get("enabled", False)]
    
    is_valid = agent.model_name in model_names
    
    return {
        "agent_id": agent_id,
        "is_valid": is_valid,
        "model_available": agent.model_name in model_names,
        "provider_available": agent.model_provider in config_manager.get_model_providers(),
        "message": "Agent configuration is valid" if is_valid else f"Model '{agent.model_name}' is not available"
    }
