from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime

from ..database import get_db
from ..services.content.source_service import SourceService

router = APIRouter(prefix="/api/sources", tags=["sources"])

class SourceBase(BaseModel):
    name: str
    source_type: str
    config: dict
    schedule: Optional[dict] = None
    is_active: bool = True

class SourceCreate(SourceBase):
    pass

class SourceUpdate(BaseModel):
    name: Optional[str] = None
    config: Optional[dict] = None
    schedule: Optional[dict] = None
    is_active: Optional[bool] = None

class SourceResponse(SourceBase):
    id: str
    created_by: str
    last_run_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class TaskBase(BaseModel):
    source_id: str
    status: str
    start_time: datetime
    end_time: Optional[datetime] = None
    result: Optional[dict] = None
    error: Optional[str] = None

class TaskResponse(TaskBase):
    id: str
    created_at: datetime

    class Config:
        orm_mode = True

@router.post("/", response_model=SourceResponse)
async def create_source(
    source: SourceCreate,
    db: Session = Depends(get_db),
    current_user_id: str = "test_user"  # 临时使用，实际应该从认证中获取
):
    """创建内容源"""
    source_service = SourceService(db)
    return source_service.create_source(
        name=source.name,
        source_type=source.source_type,
        config=source.config,
        schedule=source.schedule,
        user_id=current_user_id
    )

@router.get("/{source_id}", response_model=SourceResponse)
async def get_source(source_id: str, db: Session = Depends(get_db)):
    """获取指定内容源"""
    source_service = SourceService(db)
    source = source_service.get_source(source_id)
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    return source

@router.put("/{source_id}", response_model=SourceResponse)
async def update_source(
    source_id: str,
    source_update: SourceUpdate,
    db: Session = Depends(get_db)
):
    """更新内容源"""
    source_service = SourceService(db)
    source = source_service.update_source(
        source_id=source_id,
        name=source_update.name,
        config=source_update.config,
        schedule=source_update.schedule,
        is_active=source_update.is_active
    )
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    return source

@router.delete("/{source_id}")
async def delete_source(source_id: str, db: Session = Depends(get_db)):
    """删除内容源"""
    source_service = SourceService(db)
    if not source_service.delete_source(source_id):
        raise HTTPException(status_code=404, detail="Source not found")
    return {"status": "success"}

@router.get("/", response_model=List[SourceResponse])
async def list_sources(
    user_id: Optional[str] = None,
    source_type: Optional[str] = None,
    is_active: Optional[bool] = None,
    limit: int = 10,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """列出内容源"""
    source_service = SourceService(db)
    return source_service.list_sources(
        user_id=user_id,
        source_type=source_type,
        is_active=is_active,
        limit=limit,
        offset=offset
    )

@router.post("/{source_id}/collect", response_model=TaskResponse)
async def run_collection(source_id: str, db: Session = Depends(get_db)):
    """运行内容采集任务"""
    source_service = SourceService(db)
    task = await source_service.run_collection(source_id)
    if not task:
        raise HTTPException(status_code=404, detail="Source not found or inactive")
    return task

@router.get("/tasks/{task_id}", response_model=TaskResponse)
async def get_task(task_id: str, db: Session = Depends(get_db)):
    """获取采集任务"""
    source_service = SourceService(db)
    task = source_service.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.get("/tasks", response_model=List[TaskResponse])
async def list_tasks(
    source_id: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 10,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """列出采集任务"""
    source_service = SourceService(db)
    return source_service.list_tasks(
        source_id=source_id,
        status=status,
        limit=limit,
        offset=offset
    ) 