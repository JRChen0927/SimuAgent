import json
import os
from pathlib import Path
from typing import Dict, List, Any
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """应用配置管理"""
    
    # 项目基础配置
    PROJECT_NAME: str = "SimuAgent"
    VERSION: str = "0.1.0"
    DEBUG: bool = True
    
    # 服务器配置
    HOST: str = "localhost"
    PORT: int = 8000
    
    # 数据库配置
    DATABASE_URL: str = "sqlite:///./database/simuagent.db"
    
    # 文件存储配置
    UPLOAD_DIR: str = "./data/uploads"
    PROCESSED_DIR: str = "./data/processed"
    MAX_FILE_SIZE: int = 50 * 1024 * 1024  # 50MB
    
    # Ollama配置
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    
    # CORS配置
    CORS_ORIGINS: List[str] = ["http://localhost:5173"]
    
    class Config:
        env_file = ".env"

# 全局配置实例
settings = Settings()

class ConfigManager:
    """配置管理器 - 处理config.json的可插拔配置"""
    
    def __init__(self, config_path: str = "../../config.json"):
        self.config_path = Path(config_path)
        self.config_data = self._load_config()
    
    def _load_config(self) -> Dict[str, Any]:
        """加载配置文件"""
        try:
            if self.config_path.exists():
                with open(self.config_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            else:
                return self._get_default_config()
        except Exception as e:
            print(f"加载配置文件失败: {e}")
            return self._get_default_config()
    
    def _get_default_config(self) -> Dict[str, Any]:
        """默认配置"""
        return {
            "models": {
                "default_provider": "ollama",
                "providers": {
                    "ollama": {
                        "base_url": "http://localhost:11434",
                        "models": []
                    }
                }
            },
            "storage": {
                "upload_dir": "./data/uploads",
                "processed_dir": "./data/processed",
                "supported_formats": ["txt", "json", "pdf", "csv", "md"]
            }
        }
    
    def get_model_providers(self) -> Dict[str, Any]:
        """获取模型提供商配置"""
        return self.config_data.get("models", {}).get("providers", {})
    
    def get_default_provider(self) -> str:
        """获取默认模型提供商"""
        return self.config_data.get("models", {}).get("default_provider", "ollama")
    
    def get_available_models(self, provider: str = None) -> List[Dict[str, Any]]:
        """获取可用模型列表"""
        if provider is None:
            provider = self.get_default_provider()
        
        providers = self.get_model_providers()
        provider_config = providers.get(provider, {})
        return provider_config.get("models", [])
    
    def get_storage_config(self) -> Dict[str, Any]:
        """获取存储配置"""
        return self.config_data.get("storage", {})
    
    def get_supported_formats(self) -> List[str]:
        """获取支持的文件格式"""
        storage_config = self.get_storage_config()
        return storage_config.get("supported_formats", ["txt", "json", "pdf"])
    
    def update_config(self, new_config: Dict[str, Any]) -> bool:
        """更新配置"""
        try:
            self.config_data.update(new_config)
            with open(self.config_path, 'w', encoding='utf-8') as f:
                json.dump(self.config_data, f, ensure_ascii=False, indent=2)
            return True
        except Exception as e:
            print(f"更新配置失败: {e}")
            return False

# 全局配置管理器实例
config_manager = ConfigManager()
