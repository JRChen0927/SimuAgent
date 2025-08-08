from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

# 数据库URL
DATABASE_URL = "sqlite:///./database/simuagent.db"

# 创建数据库引擎
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# 创建sessionmaker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 创建基础模型类
Base = declarative_base()

class KnowledgeFile(Base):
    """知识库文件表"""
    __tablename__ = "knowledge_files"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=False)
    file_type = Column(String(50), nullable=False)
    upload_time = Column(DateTime, default=datetime.utcnow)
    processed = Column(Boolean, default=False)
    processed_time = Column(DateTime, nullable=True)
    status = Column(String(50), default="uploaded")  # uploaded, processing, processed, error
    error_message = Column(Text, nullable=True)

class Agent(Base):
    """Agent配置表"""
    __tablename__ = "agents"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    prompt = Column(Text, nullable=False)
    model_provider = Column(String(100), nullable=False)
    model_name = Column(String(100), nullable=False)
    temperature = Column(Float, default=0.7)
    max_tokens = Column(Integer, default=1000)
    created_time = Column(DateTime, default=datetime.utcnow)
    updated_time = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

class Conversation(Base):
    """对话记录表"""
    __tablename__ = "conversations"
    
    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, nullable=False)
    session_id = Column(String(100), nullable=False)
    user_message = Column(Text, nullable=False)
    agent_response = Column(Text, nullable=False)
    response_time = Column(Float, nullable=True)  # 响应时间（秒）
    timestamp = Column(DateTime, default=datetime.utcnow)

class Evaluation(Base):
    """评估记录表"""
    __tablename__ = "evaluations"
    
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, nullable=False)
    user_rating = Column(Integer, nullable=True)  # 1-5星评分
    user_feedback = Column(Text, nullable=True)
    accuracy_score = Column(Float, nullable=True)
    relevance_score = Column(Float, nullable=True)
    helpfulness_score = Column(Float, nullable=True)
    created_time = Column(DateTime, default=datetime.utcnow)

class TestCase(Base):
    """测试用例表"""
    __tablename__ = "test_cases"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    input_text = Column(Text, nullable=False)
    expected_output = Column(Text, nullable=True)
    category = Column(String(100), nullable=True)
    created_time = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

class ABTest(Base):
    """A/B测试记录表"""
    __tablename__ = "ab_tests"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    agent_a_id = Column(Integer, nullable=False)
    agent_b_id = Column(Integer, nullable=False)
    test_case_id = Column(Integer, nullable=False)
    agent_a_response = Column(Text, nullable=True)
    agent_b_response = Column(Text, nullable=True)
    agent_a_score = Column(Float, nullable=True)
    agent_b_score = Column(Float, nullable=True)
    winner = Column(String(10), nullable=True)  # 'A', 'B', 'tie'
    created_time = Column(DateTime, default=datetime.utcnow)

def create_tables():
    """创建所有数据库表"""
    # 确保数据库目录存在
    os.makedirs("./database", exist_ok=True)
    Base.metadata.create_all(bind=engine)

def get_db():
    """获取数据库会话"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
