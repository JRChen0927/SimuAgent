from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
import os
import uuid
import shutil
from datetime import datetime

from app.models.database import get_db, KnowledgeFile
from app.core.config import settings, config_manager

router = APIRouter()

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """上传知识库文件"""
    
    # 检查文件格式
    file_extension = file.filename.split('.')[-1].lower()
    supported_formats = config_manager.get_supported_formats()
    
    if file_extension not in supported_formats:
        raise HTTPException(
            status_code=400,
            detail=f"不支持的文件格式: {file_extension}. 支持的格式: {', '.join(supported_formats)}"
        )
    
    # 检查文件大小
    file_size = 0
    content = await file.read()
    file_size = len(content)
    
    if file_size > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"文件大小超出限制: {file_size} bytes. 最大允许: {settings.MAX_FILE_SIZE} bytes"
        )
    
    # 生成唯一文件名
    file_id = str(uuid.uuid4())
    filename = f"{file_id}.{file_extension}"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    
    try:
        # 保存文件
        with open(file_path, "wb") as buffer:
            buffer.write(content)
        
        # 保存到数据库
        db_file = KnowledgeFile(
            filename=filename,
            original_filename=file.filename,
            file_path=file_path,
            file_size=file_size,
            file_type=file_extension,
            upload_time=datetime.utcnow(),
            status="uploaded"
        )
        db.add(db_file)
        db.commit()
        db.refresh(db_file)
        
        return {
            "id": db_file.id,
            "filename": db_file.original_filename,
            "size": db_file.file_size,
            "type": db_file.file_type,
            "upload_time": db_file.upload_time,
            "status": db_file.status
        }
    
    except Exception as e:
        # 删除已上传的文件（如果存在）
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"文件上传失败: {str(e)}")

@router.get("/")
async def list_files(db: Session = Depends(get_db)):
    """获取文件列表"""
    files = db.query(KnowledgeFile).order_by(KnowledgeFile.upload_time.desc()).all()
    
    return [
        {
            "id": file.id,
            "filename": file.original_filename,
            "size": file.file_size,
            "type": file.file_type,
            "upload_time": file.upload_time,
            "status": file.status,
            "processed": file.processed
        }
        for file in files
    ]

@router.get("/{file_id}")
async def get_file_info(file_id: int, db: Session = Depends(get_db)):
    """获取文件详细信息"""
    file = db.query(KnowledgeFile).filter(KnowledgeFile.id == file_id).first()
    
    if not file:
        raise HTTPException(status_code=404, detail="文件不存在")
    
    return {
        "id": file.id,
        "filename": file.original_filename,
        "size": file.file_size,
        "type": file.file_type,
        "upload_time": file.upload_time,
        "processed_time": file.processed_time,
        "status": file.status,
        "processed": file.processed,
        "error_message": file.error_message
    }

@router.get("/{file_id}/preview")
async def preview_file(file_id: int, db: Session = Depends(get_db)):
    """预览文件内容"""
    file = db.query(KnowledgeFile).filter(KnowledgeFile.id == file_id).first()
    
    if not file:
        raise HTTPException(status_code=404, detail="文件不存在")
    
    if not os.path.exists(file.file_path):
        raise HTTPException(status_code=404, detail="文件已被删除")
    
    try:
        # 根据文件类型读取内容
        if file.file_type in ['txt', 'md']:
            with open(file.file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                # 限制预览长度
                preview_content = content[:1000] + "..." if len(content) > 1000 else content
        elif file.file_type == 'json':
            import json
            with open(file.file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                preview_content = json.dumps(data, ensure_ascii=False, indent=2)[:1000]
        else:
            preview_content = f"文件类型 {file.file_type} 不支持预览"
        
        return {
            "filename": file.original_filename,
            "content": preview_content,
            "full_size": file.file_size
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"文件预览失败: {str(e)}")

@router.delete("/{file_id}")
async def delete_file(file_id: int, db: Session = Depends(get_db)):
    """删除文件"""
    file = db.query(KnowledgeFile).filter(KnowledgeFile.id == file_id).first()
    
    if not file:
        raise HTTPException(status_code=404, detail="文件不存在")
    
    try:
        # 删除物理文件
        if os.path.exists(file.file_path):
            os.remove(file.file_path)
        
        # 删除数据库记录
        db.delete(file)
        db.commit()
        
        return {"message": "文件删除成功"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"文件删除失败: {str(e)}")

@router.post("/{file_id}/process")
async def process_file(file_id: int, db: Session = Depends(get_db)):
    """处理文件（准备用于LlamaIndex）"""
    file = db.query(KnowledgeFile).filter(KnowledgeFile.id == file_id).first()
    
    if not file:
        raise HTTPException(status_code=404, detail="文件不存在")
    
    if file.processed:
        return {"message": "文件已经处理过了", "status": "processed"}
    
    try:
        # 更新状态为处理中
        file.status = "processing"
        db.commit()
        
        # TODO: 在这里集成LlamaIndex处理逻辑
        # 现在先简单标记为已处理
        file.processed = True
        file.processed_time = datetime.utcnow()
        file.status = "processed"
        db.commit()
        
        return {"message": "文件处理成功", "status": "processed"}
    
    except Exception as e:
        file.status = "error"
        file.error_message = str(e)
        db.commit()
        raise HTTPException(status_code=500, detail=f"文件处理失败: {str(e)}")
