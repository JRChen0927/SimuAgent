from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from pydantic import BaseModel

from app.core.config import config_manager

router = APIRouter()

class ModelProvider(BaseModel):
    name: str
    display_name: str
    description: str
    enabled: bool

class ConfigUpdate(BaseModel):
    models: Dict[str, Any] = None
    storage: Dict[str, Any] = None
    agent: Dict[str, Any] = None

@router.get("/")
async def get_config():
    """获取完整配置"""
    return config_manager.config_data

@router.get("/models")
async def get_model_config():
    """获取模型配置"""
    return {
        "default_provider": config_manager.get_default_provider(),
        "providers": config_manager.get_model_providers()
    }

@router.get("/models/providers")
async def get_providers():
    """获取可用的模型提供商"""
    providers = config_manager.get_model_providers()
    return list(providers.keys())

@router.get("/models/{provider}")
async def get_provider_models(provider: str):
    """获取指定提供商的模型列表"""
    models = config_manager.get_available_models(provider)
    if not models:
        raise HTTPException(
            status_code=404, 
            detail=f"Provider '{provider}' not found or has no models"
        )
    return models

@router.get("/models/{provider}/enabled")
async def get_enabled_models(provider: str):
    """获取指定提供商的可用模型"""
    all_models = config_manager.get_available_models(provider)
    enabled_models = [model for model in all_models if model.get("enabled", False)]
    return enabled_models

@router.post("/models/{provider}/{model_name}/toggle")
async def toggle_model(provider: str, model_name: str):
    """启用/禁用指定模型"""
    providers = config_manager.get_model_providers()
    
    if provider not in providers:
        raise HTTPException(status_code=404, detail=f"Provider '{provider}' not found")
    
    models = providers[provider].get("models", [])
    model_found = False
    
    for model in models:
        if model.get("name") == model_name:
            model["enabled"] = not model.get("enabled", False)
            model_found = True
            break
    
    if not model_found:
        raise HTTPException(
            status_code=404, 
            detail=f"Model '{model_name}' not found in provider '{provider}'"
        )
    
    # 更新配置
    success = config_manager.update_config({
        "models": {
            "providers": providers
        }
    })
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to update configuration")
    
    return {"message": f"Model '{model_name}' toggled successfully"}

@router.get("/storage")
async def get_storage_config():
    """获取存储配置"""
    return config_manager.get_storage_config()

@router.get("/storage/formats")
async def get_supported_formats():
    """获取支持的文件格式"""
    return {
        "formats": config_manager.get_supported_formats()
    }

@router.put("/")
async def update_config(config_update: ConfigUpdate):
    """更新配置"""
    try:
        update_data = {}
        
        if config_update.models is not None:
            update_data["models"] = config_update.models
        
        if config_update.storage is not None:
            update_data["storage"] = config_update.storage
            
        if config_update.agent is not None:
            update_data["agent"] = config_update.agent
        
        success = config_manager.update_config(update_data)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to update configuration")
        
        return {"message": "Configuration updated successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Configuration update failed: {str(e)}")

@router.post("/reload")
async def reload_config():
    """重新加载配置"""
    try:
        config_manager.config_data = config_manager._load_config()
        return {"message": "Configuration reloaded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Configuration reload failed: {str(e)}")

@router.get("/agent")
async def get_agent_config():
    """获取Agent默认配置"""
    agent_config = config_manager.config_data.get("agent", {})
    return agent_config

@router.get("/evaluation")
async def get_evaluation_config():
    """获取评估配置"""
    evaluation_config = config_manager.config_data.get("evaluation", {})
    return evaluation_config
