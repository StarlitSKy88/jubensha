from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime

from ..database import get_db
from ..services.content.content_service import ContentService
from ..services.content.content_processor import ContentProcessorFactory

router = APIRouter(prefix="/api/content", tags=["content"])

class ContentBase(BaseModel):
    title: str
    content_type: str
    source_url: Optional[str] = None
    raw_content: dict
    metadata: Optional[dict] = None

class ContentCreate(ContentBase):
    pass

class ContentUpdate(BaseModel):
    processed_content: Optional[dict] = None
    status: Optional[str] = None
    metadata: Optional[dict] = None

class ContentResponse(ContentBase):
    id: str
    processed_content: Optional[dict] = None
    status: str
    created_at: datetime
    updated_at: datetime
    created_by: str

    class Config:
        orm_mode = True

class CollectionBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_public: bool = False

class CollectionCreate(CollectionBase):
    pass

class CollectionResponse(CollectionBase):
    id: str
    created_by: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

@router.post("/", response_model=ContentResponse)
def create_content(
    content: ContentCreate,
    db: Session = Depends(get_db),
    current_user_id: str = "test_user"  # 临时使用，实际应该从认证中获取
):
    """创建新内容"""
    content_service = ContentService(db)
    
    # 创建内容
    new_content = content_service.create_content(
        title=content.title,
        content_type=content.content_type,
        raw_content=content.raw_content,
        source_url=content.source_url,
        metadata=content.metadata,
        user_id=current_user_id
    )
    
    # 处理内容
    processor = ContentProcessorFactory.get_processor(content.content_type)
    if processor:
        processed_content = processor.process(content.raw_content)
        content_service.update_content(
            content_id=new_content.id,
            processed_content=processed_content,
            status="completed"
        )
    
    return new_content

@router.get("/{content_id}", response_model=ContentResponse)
def get_content(content_id: str, db: Session = Depends(get_db)):
    """获取指定内容"""
    content_service = ContentService(db)
    content = content_service.get_content(content_id)
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    return content

@router.put("/{content_id}", response_model=ContentResponse)
def update_content(
    content_id: str,
    content_update: ContentUpdate,
    db: Session = Depends(get_db)
):
    """更新内容"""
    content_service = ContentService(db)
    content = content_service.update_content(
        content_id=content_id,
        processed_content=content_update.processed_content,
        status=content_update.status,
        metadata=content_update.metadata
    )
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    return content

@router.delete("/{content_id}")
def delete_content(content_id: str, db: Session = Depends(get_db)):
    """删除内容"""
    content_service = ContentService(db)
    if not content_service.delete_content(content_id):
        raise HTTPException(status_code=404, detail="Content not found")
    return {"status": "success"}

@router.post("/{content_id}/tags")
def add_tags(
    content_id: str,
    tags: List[str],
    db: Session = Depends(get_db)
):
    """为内容添加标签"""
    content_service = ContentService(db)
    added_tags = content_service.add_tags(content_id, tags)
    if not added_tags:
        raise HTTPException(status_code=404, detail="Content not found")
    return {"status": "success", "added_tags": [tag.name for tag in added_tags]}

@router.post("/collections", response_model=CollectionResponse)
def create_collection(
    collection: CollectionCreate,
    db: Session = Depends(get_db),
    current_user_id: str = "test_user"  # 临时使用，实际应该从认证中获取
):
    """创建内容集合"""
    content_service = ContentService(db)
    return content_service.create_collection(
        name=collection.name,
        description=collection.description,
        user_id=current_user_id,
        is_public=collection.is_public
    )

@router.post("/collections/{collection_id}/contents")
def add_to_collection(
    collection_id: str,
    content_ids: List[str],
    db: Session = Depends(get_db)
):
    """将内容添加到集合"""
    content_service = ContentService(db)
    added_contents = content_service.add_to_collection(collection_id, content_ids)
    if not added_contents:
        raise HTTPException(status_code=404, detail="Collection not found")
    return {"status": "success", "added_count": len(added_contents)}

@router.get("/search", response_model=List[ContentResponse])
def search_contents(
    keyword: Optional[str] = None,
    content_type: Optional[str] = None,
    tags: Optional[List[str]] = Query(None),
    status: Optional[str] = None,
    limit: int = 10,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """搜索内容"""
    content_service = ContentService(db)
    return content_service.search_contents(
        keyword=keyword,
        content_type=content_type,
        tags=tags,
        status=status,
        limit=limit,
        offset=offset
    ) 