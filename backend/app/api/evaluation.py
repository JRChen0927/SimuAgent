from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import json
import csv
import io
from datetime import datetime

from app.models.database import get_db, Evaluation, Conversation, Agent, TestCase, ABTest

router = APIRouter()

class EvaluationCreate(BaseModel):
    conversation_id: int
    user_rating: Optional[int] = None
    user_feedback: Optional[str] = None
    accuracy_score: Optional[float] = None
    relevance_score: Optional[float] = None
    helpfulness_score: Optional[float] = None

class TestCaseCreate(BaseModel):
    name: str
    description: Optional[str] = None
    input_text: str
    expected_output: Optional[str] = None
    category: Optional[str] = None

class ABTestCreate(BaseModel):
    name: str
    description: Optional[str] = None
    agent_a_id: int
    agent_b_id: int
    test_case_id: int

@router.post("/evaluate")
async def create_evaluation(
    evaluation: EvaluationCreate,
    db: Session = Depends(get_db)
):
    """创建评估记录"""
    
    # 验证对话是否存在
    conversation = db.query(Conversation).filter(
        Conversation.id == evaluation.conversation_id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # 验证评分范围
    if evaluation.user_rating is not None and (evaluation.user_rating < 1 or evaluation.user_rating > 5):
        raise HTTPException(status_code=400, detail="User rating must be between 1 and 5")
    
    try:
        db_evaluation = Evaluation(
            conversation_id=evaluation.conversation_id,
            user_rating=evaluation.user_rating,
            user_feedback=evaluation.user_feedback,
            accuracy_score=evaluation.accuracy_score,
            relevance_score=evaluation.relevance_score,
            helpfulness_score=evaluation.helpfulness_score
        )
        
        db.add(db_evaluation)
        db.commit()
        db.refresh(db_evaluation)
        
        return db_evaluation
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create evaluation: {str(e)}")

@router.get("/conversation/{conversation_id}")
async def get_conversation_evaluation(
    conversation_id: int,
    db: Session = Depends(get_db)
):
    """获取对话的评估记录"""
    evaluation = db.query(Evaluation).filter(
        Evaluation.conversation_id == conversation_id
    ).first()
    
    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    
    return evaluation

@router.get("/agent/{agent_id}/stats")
async def get_agent_evaluation_stats(
    agent_id: int,
    db: Session = Depends(get_db)
):
    """获取Agent的评估统计"""
    from sqlalchemy import func
    
    # 验证Agent是否存在
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    # 获取该Agent的所有评估记录
    evaluations = db.query(Evaluation).join(Conversation).filter(
        Conversation.agent_id == agent_id
    ).all()
    
    if not evaluations:
        return {
            "agent_id": agent_id,
            "agent_name": agent.name,
            "total_evaluations": 0,
            "average_rating": 0,
            "average_accuracy": 0,
            "average_relevance": 0,
            "average_helpfulness": 0
        }
    
    # 计算统计数据
    ratings = [e.user_rating for e in evaluations if e.user_rating is not None]
    accuracy_scores = [e.accuracy_score for e in evaluations if e.accuracy_score is not None]
    relevance_scores = [e.relevance_score for e in evaluations if e.relevance_score is not None]
    helpfulness_scores = [e.helpfulness_score for e in evaluations if e.helpfulness_score is not None]
    
    return {
        "agent_id": agent_id,
        "agent_name": agent.name,
        "total_evaluations": len(evaluations),
        "average_rating": round(sum(ratings) / len(ratings), 2) if ratings else 0,
        "average_accuracy": round(sum(accuracy_scores) / len(accuracy_scores), 2) if accuracy_scores else 0,
        "average_relevance": round(sum(relevance_scores) / len(relevance_scores), 2) if relevance_scores else 0,
        "average_helpfulness": round(sum(helpfulness_scores) / len(helpfulness_scores), 2) if helpfulness_scores else 0,
        "rating_distribution": {
            str(i): ratings.count(i) for i in range(1, 6)
        } if ratings else {}
    }

# 测试用例管理
@router.post("/test-cases", response_model=dict)
async def create_test_case(
    test_case: TestCaseCreate,
    db: Session = Depends(get_db)
):
    """创建测试用例"""
    try:
        db_test_case = TestCase(
            name=test_case.name,
            description=test_case.description,
            input_text=test_case.input_text,
            expected_output=test_case.expected_output,
            category=test_case.category
        )
        
        db.add(db_test_case)
        db.commit()
        db.refresh(db_test_case)
        
        return {
            "id": db_test_case.id,
            "name": db_test_case.name,
            "description": db_test_case.description,
            "input_text": db_test_case.input_text,
            "expected_output": db_test_case.expected_output,
            "category": db_test_case.category,
            "created_time": db_test_case.created_time.isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create test case: {str(e)}")

@router.get("/test-cases")
async def list_test_cases(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """获取测试用例列表"""
    query = db.query(TestCase).filter(TestCase.is_active == True)
    
    if category:
        query = query.filter(TestCase.category == category)
    
    test_cases = query.offset(skip).limit(limit).all()
    
    return [
        {
            "id": tc.id,
            "name": tc.name,
            "description": tc.description,
            "input_text": tc.input_text,
            "expected_output": tc.expected_output,
            "category": tc.category,
            "created_time": tc.created_time.isoformat()
        }
        for tc in test_cases
    ]

# A/B测试
@router.post("/ab-tests")
async def create_ab_test(
    ab_test: ABTestCreate,
    db: Session = Depends(get_db)
):
    """创建A/B测试"""
    
    # 验证Agent和测试用例是否存在
    agent_a = db.query(Agent).filter(Agent.id == ab_test.agent_a_id).first()
    agent_b = db.query(Agent).filter(Agent.id == ab_test.agent_b_id).first()
    test_case = db.query(TestCase).filter(TestCase.id == ab_test.test_case_id).first()
    
    if not agent_a:
        raise HTTPException(status_code=404, detail="Agent A not found")
    if not agent_b:
        raise HTTPException(status_code=404, detail="Agent B not found")
    if not test_case:
        raise HTTPException(status_code=404, detail="Test case not found")
    
    try:
        db_ab_test = ABTest(
            name=ab_test.name,
            description=ab_test.description,
            agent_a_id=ab_test.agent_a_id,
            agent_b_id=ab_test.agent_b_id,
            test_case_id=ab_test.test_case_id
        )
        
        db.add(db_ab_test)
        db.commit()
        db.refresh(db_ab_test)
        
        return {
            "id": db_ab_test.id,
            "name": db_ab_test.name,
            "description": db_ab_test.description,
            "agent_a": {"id": agent_a.id, "name": agent_a.name},
            "agent_b": {"id": agent_b.id, "name": agent_b.name},
            "test_case": {"id": test_case.id, "name": test_case.name},
            "created_time": db_ab_test.created_time.isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create A/B test: {str(e)}")

@router.post("/ab-tests/{ab_test_id}/run")
async def run_ab_test(ab_test_id: int, db: Session = Depends(get_db)):
    """运行A/B测试"""
    ab_test = db.query(ABTest).filter(ABTest.id == ab_test_id).first()
    
    if not ab_test:
        raise HTTPException(status_code=404, detail="A/B test not found")
    
    # 获取相关数据
    agent_a = db.query(Agent).filter(Agent.id == ab_test.agent_a_id).first()
    agent_b = db.query(Agent).filter(Agent.id == ab_test.agent_b_id).first()
    test_case = db.query(TestCase).filter(TestCase.id == ab_test.test_case_id).first()
    
    try:
        # TODO: 运行实际的Agent测试
        # 现在使用模拟响应
        from app.api.conversations import _generate_response
        
        response_a = await _generate_response(agent_a, test_case.input_text)
        response_b = await _generate_response(agent_b, test_case.input_text)
        
        # 更新A/B测试结果
        ab_test.agent_a_response = response_a
        ab_test.agent_b_response = response_b
        
        db.commit()
        
        return {
            "ab_test_id": ab_test_id,
            "test_case": test_case.input_text,
            "agent_a_response": response_a,
            "agent_b_response": response_b,
            "message": "A/B test completed successfully"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to run A/B test: {str(e)}")

@router.get("/export/rl-data")
async def export_rl_data(
    format: str = "json",
    agent_id: Optional[int] = None,
    min_rating: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """导出强化学习训练数据"""
    
    # 构建查询
    query = db.query(Conversation, Evaluation).join(
        Evaluation, Conversation.id == Evaluation.conversation_id
    )
    
    if agent_id:
        query = query.filter(Conversation.agent_id == agent_id)
    
    if min_rating:
        query = query.filter(Evaluation.user_rating >= min_rating)
    
    results = query.all()
    
    # 准备数据
    rl_data = []
    for conversation, evaluation in results:
        data_point = {
            "input": conversation.user_message,
            "output": conversation.agent_response,
            "rating": evaluation.user_rating,
            "feedback": evaluation.user_feedback,
            "accuracy": evaluation.accuracy_score,
            "relevance": evaluation.relevance_score,
            "helpfulness": evaluation.helpfulness_score,
            "response_time": conversation.response_time,
            "timestamp": conversation.timestamp.isoformat()
        }
        rl_data.append(data_point)
    
    if format.lower() == "json":
        return {"data": rl_data, "count": len(rl_data)}
    elif format.lower() == "jsonl":
        jsonl_content = "\n".join([json.dumps(item, ensure_ascii=False) for item in rl_data])
        return {"content": jsonl_content, "count": len(rl_data)}
    elif format.lower() == "csv":
        if not rl_data:
            return {"content": "", "count": 0}
        
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=rl_data[0].keys())
        writer.writeheader()
        writer.writerows(rl_data)
        
        return {"content": output.getvalue(), "count": len(rl_data)}
    else:
        raise HTTPException(status_code=400, detail="Unsupported format. Use 'json', 'jsonl', or 'csv'")
