from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime

from ...models import ContentSource, CollectionTask
from .content_collector import ContentCollectorFactory

class SourceService:
    def __init__(self, db: Session):
        self.db = db

    def create_source(self,
                     name: str,
                     source_type: str,
                     config: Dict[str, Any],
                     schedule: Optional[Dict[str, Any]] = None,
                     user_id: str = None) -> ContentSource:
        """创建内容源"""
        source = ContentSource(
            name=name,
            source_type=source_type,
            config=config,
            schedule=schedule,
            created_by=user_id
        )
        self.db.add(source)
        self.db.commit()
        self.db.refresh(source)
        return source

    def get_source(self, source_id: str) -> Optional[ContentSource]:
        """获取指定内容源"""
        return self.db.query(ContentSource).filter(ContentSource.id == source_id).first()

    def update_source(self,
                     source_id: str,
                     name: Optional[str] = None,
                     config: Optional[Dict[str, Any]] = None,
                     schedule: Optional[Dict[str, Any]] = None,
                     is_active: Optional[bool] = None) -> Optional[ContentSource]:
        """更新内容源"""
        source = self.get_source(source_id)
        if not source:
            return None

        if name is not None:
            source.name = name
        if config is not None:
            source.config = config
        if schedule is not None:
            source.schedule = schedule
        if is_active is not None:
            source.is_active = is_active

        source.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(source)
        return source

    def delete_source(self, source_id: str) -> bool:
        """删除内容源"""
        source = self.get_source(source_id)
        if not source:
            return False

        self.db.delete(source)
        self.db.commit()
        return True

    def list_sources(self,
                    user_id: Optional[str] = None,
                    source_type: Optional[str] = None,
                    is_active: Optional[bool] = None,
                    limit: int = 10,
                    offset: int = 0) -> List[ContentSource]:
        """列出内容源"""
        query = self.db.query(ContentSource)

        if user_id:
            query = query.filter(ContentSource.created_by == user_id)
        if source_type:
            query = query.filter(ContentSource.source_type == source_type)
        if is_active is not None:
            query = query.filter(ContentSource.is_active == is_active)

        return query.offset(offset).limit(limit).all()

    async def run_collection(self, source_id: str) -> Optional[CollectionTask]:
        """运行内容采集任务"""
        source = self.get_source(source_id)
        if not source or not source.is_active:
            return None

        collector = ContentCollectorFactory.get_collector(source.source_type, self.db, source)
        if not collector:
            return None

        return await collector.run()

    def get_task(self, task_id: str) -> Optional[CollectionTask]:
        """获取采集任务"""
        return self.db.query(CollectionTask).filter(CollectionTask.id == task_id).first()

    def list_tasks(self,
                  source_id: Optional[str] = None,
                  status: Optional[str] = None,
                  limit: int = 10,
                  offset: int = 0) -> List[CollectionTask]:
        """列出采集任务"""
        query = self.db.query(CollectionTask)

        if source_id:
            query = query.filter(CollectionTask.source_id == source_id)
        if status:
            query = query.filter(CollectionTask.status == status)

        return query.order_by(CollectionTask.created_at.desc()).offset(offset).limit(limit).all() 