from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import time
import uuid

from app.models.database import get_db, Conversation, Agent

router = APIRouter()

class ChatMessage(BaseModel):
    agent_id: int
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    session_id: str
    user_message: str
    agent_response: str
    response_time: float
    timestamp: str

class ConversationHistory(BaseModel):
    id: int
    agent_id: int
    session_id: str
    user_message: str
    agent_response: str
    response_time: Optional[float]
    timestamp: str

@router.post("/chat", response_model=ChatResponse)
async def chat_with_agent(
    chat_request: ChatMessage,
    db: Session = Depends(get_db)
):
    """与Agent对话"""
    
    # 验证Agent是否存在
    agent = db.query(Agent).filter(
        Agent.id == chat_request.agent_id,
        Agent.is_active == True
    ).first()
    
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found or inactive")
    
    # 生成session_id（如果没有提供）
    session_id = chat_request.session_id or str(uuid.uuid4())
    
    try:
        start_time = time.time()
        
        # TODO: 这里需要集成实际的LLM调用逻辑
        # 现在先返回模拟响应
        agent_response = await _generate_response(agent, chat_request.message)
        
        response_time = time.time() - start_time
        
        # 保存对话记录
        conversation = Conversation(
            agent_id=chat_request.agent_id,
            session_id=session_id,
            user_message=chat_request.message,
            agent_response=agent_response,
            response_time=response_time
        )
        
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
        
        return ChatResponse(
            session_id=session_id,
            user_message=chat_request.message,
            agent_response=agent_response,
            response_time=response_time,
            timestamp=conversation.timestamp.isoformat()
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")

async def _generate_response(agent: Agent, user_message: str) -> str:
    """生成Agent响应（模拟实现）"""
    # TODO: 集成真实的LLM调用
    # 这里应该调用Ollama或其他LLM服务
    
    # 模拟响应延迟
    import asyncio
    await asyncio.sleep(0.5)
    
    # 构建提示词
    full_prompt = f"""
{agent.prompt}

用户问题: {user_message}

请根据上述角色设定回答用户问题。
"""
    
    # 模拟响应（实际应该调用LLM）
    return f"[模拟响应] 基于 {agent.model_name} 模型，针对问题「{user_message}」的回答：这是一个模拟的Agent响应，实际应该调用{agent.model_provider}的{agent.model_name}模型来生成回答。"

@router.get("/sessions/{session_id}", response_model=List[ConversationHistory])
async def get_session_history(
    session_id: str,
    db: Session = Depends(get_db)
):
    """获取会话历史"""
    conversations = db.query(Conversation).filter(
        Conversation.session_id == session_id
    ).order_by(Conversation.timestamp.asc()).all()
    
    return [
        ConversationHistory(
            id=conv.id,
            agent_id=conv.agent_id,
            session_id=conv.session_id,
            user_message=conv.user_message,
            agent_response=conv.agent_response,
            response_time=conv.response_time,
            timestamp=conv.timestamp.isoformat()
        )
        for conv in conversations
    ]

@router.get("/agent/{agent_id}", response_model=List[ConversationHistory])
async def get_agent_conversations(
    agent_id: int,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """获取指定Agent的对话记录"""
    conversations = db.query(Conversation).filter(
        Conversation.agent_id == agent_id
    ).order_by(Conversation.timestamp.desc()).limit(limit).all()
    
    return [
        ConversationHistory(
            id=conv.id,
            agent_id=conv.agent_id,
            session_id=conv.session_id,
            user_message=conv.user_message,
            agent_response=conv.agent_response,
            response_time=conv.response_time,
            timestamp=conv.timestamp.isoformat()
        )
        for conv in conversations
    ]

@router.get("/", response_model=List[ConversationHistory])
async def list_conversations(
    skip: int = 0,
    limit: int = 100,
    agent_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """获取对话记录列表"""
    query = db.query(Conversation)
    
    if agent_id:
        query = query.filter(Conversation.agent_id == agent_id)
    
    conversations = query.order_by(
        Conversation.timestamp.desc()
    ).offset(skip).limit(limit).all()
    
    return [
        ConversationHistory(
            id=conv.id,
            agent_id=conv.agent_id,
            session_id=conv.session_id,
            user_message=conv.user_message,
            agent_response=conv.agent_response,
            response_time=conv.response_time,
            timestamp=conv.timestamp.isoformat()
        )
        for conv in conversations
    ]

@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str, db: Session = Depends(get_db)):
    """删除会话"""
    conversations = db.query(Conversation).filter(
        Conversation.session_id == session_id
    ).all()
    
    if not conversations:
        raise HTTPException(status_code=404, detail="Session not found")
    
    try:
        for conversation in conversations:
            db.delete(conversation)
        
        db.commit()
        
        return {"message": f"Session {session_id} deleted successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete session: {str(e)}")

@router.delete("/{conversation_id}")
async def delete_conversation(conversation_id: int, db: Session = Depends(get_db)):
    """删除单条对话记录"""
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    try:
        db.delete(conversation)
        db.commit()
        
        return {"message": "Conversation deleted successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete conversation: {str(e)}")

@router.get("/stats/agent/{agent_id}")
async def get_agent_stats(agent_id: int, db: Session = Depends(get_db)):
    """获取Agent统计信息"""
    from sqlalchemy import func
    
    # 验证Agent是否存在
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    # 统计信息
    total_conversations = db.query(func.count(Conversation.id)).filter(
        Conversation.agent_id == agent_id
    ).scalar()
    
    avg_response_time = db.query(func.avg(Conversation.response_time)).filter(
        Conversation.agent_id == agent_id
    ).scalar()
    
    unique_sessions = db.query(func.count(func.distinct(Conversation.session_id))).filter(
        Conversation.agent_id == agent_id
    ).scalar()
    
    return {
        "agent_id": agent_id,
        "agent_name": agent.name,
        "total_conversations": total_conversations or 0,
        "unique_sessions": unique_sessions or 0,
        "average_response_time": round(avg_response_time or 0, 3)
    }
