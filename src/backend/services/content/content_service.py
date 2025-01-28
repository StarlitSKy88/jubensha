from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime

from ...models import Content, Tag, ContentCollection, ContentTag, CollectionContent
from ...database import get_db

class ContentService:
    def __init__(self, db: Session):
        self.db = db

    def create_content(self, 
                      title: str,
                      content_type: str,
                      raw_content: Dict[str, Any],
                      source_url: Optional[str] = None,
                      metadata: Optional[Dict[str, Any]] = None,
                      user_id: str = None) -> Content:
        """创建新的内容"""
        content = Content(
            title=title,
            content_type=content_type,
            raw_content=raw_content,
            source_url=source_url,
            metadata=metadata or {},
            created_by=user_id
        )
        self.db.add(content)
        self.db.commit()
        self.db.refresh(content)
        return content

    def get_content(self, content_id: str) -> Optional[Content]:
        """获取指定内容"""
        return self.db.query(Content).filter(Content.id == content_id).first()

    def update_content(self,
                      content_id: str,
                      processed_content: Optional[Dict[str, Any]] = None,
                      status: Optional[str] = None,
                      metadata: Optional[Dict[str, Any]] = None) -> Optional[Content]:
        """更新内容"""
        content = self.get_content(content_id)
        if not content:
            return None

        if processed_content is not None:
            content.processed_content = processed_content
        if status is not None:
            content.status = status
        if metadata is not None:
            content.metadata.update(metadata)
        
        content.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(content)
        return content

    def delete_content(self, content_id: str) -> bool:
        """删除内容"""
        content = self.get_content(content_id)
        if not content:
            return False
        
        self.db.delete(content)
        self.db.commit()
        return True

    def add_tags(self, content_id: str, tag_names: List[str]) -> List[Tag]:
        """为内容添加标签"""
        content = self.get_content(content_id)
        if not content:
            return []

        tags = []
        for name in tag_names:
            tag = self.db.query(Tag).filter(Tag.name == name).first()
            if not tag:
                tag = Tag(name=name)
                self.db.add(tag)
                self.db.commit()
            
            content_tag = ContentTag(content_id=content_id, tag_id=tag.id)
            self.db.add(content_tag)
            tags.append(tag)

        self.db.commit()
        return tags

    def create_collection(self,
                         name: str,
                         description: Optional[str] = None,
                         user_id: str = None,
                         is_public: bool = False) -> ContentCollection:
        """创建内容集合"""
        collection = ContentCollection(
            name=name,
            description=description,
            created_by=user_id,
            is_public=is_public
        )
        self.db.add(collection)
        self.db.commit()
        self.db.refresh(collection)
        return collection

    def add_to_collection(self,
                         collection_id: str,
                         content_ids: List[str],
                         order_start: int = 0) -> List[CollectionContent]:
        """将内容添加到集合"""
        collection = self.db.query(ContentCollection).filter(
            ContentCollection.id == collection_id).first()
        if not collection:
            return []

        collection_contents = []
        for i, content_id in enumerate(content_ids):
            cc = CollectionContent(
                collection_id=collection_id,
                content_id=content_id,
                order=order_start + i
            )
            self.db.add(cc)
            collection_contents.append(cc)

        self.db.commit()
        return collection_contents

    def search_contents(self,
                       keyword: Optional[str] = None,
                       content_type: Optional[str] = None,
                       tags: Optional[List[str]] = None,
                       status: Optional[str] = None,
                       limit: int = 10,
                       offset: int = 0) -> List[Content]:
        """搜索内容"""
        query = self.db.query(Content)

        if keyword:
            query = query.filter(Content.title.ilike(f"%{keyword}%"))
        if content_type:
            query = query.filter(Content.content_type == content_type)
        if status:
            query = query.filter(Content.status == status)
        if tags:
            for tag in tags:
                query = query.join(ContentTag).join(Tag).filter(Tag.name == tag)

        return query.offset(offset).limit(limit).all() 