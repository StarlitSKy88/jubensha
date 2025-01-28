from typing import Dict, Any, List, Optional
from abc import ABC, abstractmethod
from datetime import datetime
import aiohttp
import asyncio
import feedparser
import os
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session

from ...models import ContentSource, CollectionTask, Content
from .content_service import ContentService

class ContentCollector(ABC):
    """内容采集器基类"""
    def __init__(self, db: Session, source: ContentSource):
        self.db = db
        self.source = source
        self.content_service = ContentService(db)
        self.task = None

    @abstractmethod
    async def collect(self) -> List[Dict[str, Any]]:
        """采集内容的抽象方法"""
        pass

    async def run(self) -> CollectionTask:
        """运行采集任务"""
        # 创建任务记录
        self.task = CollectionTask(
            source_id=self.source.id,
            status="running"
        )
        self.db.add(self.task)
        self.db.commit()

        try:
            # 执行采集
            contents = await self.collect()
            
            # 保存采集结果
            collected_count = 0
            for content_data in contents:
                content = self.content_service.create_content(
                    title=content_data['title'],
                    content_type=content_data['type'],
                    raw_content=content_data['content'],
                    source_url=content_data.get('url'),
                    metadata=content_data.get('metadata'),
                    user_id=self.source.created_by
                )
                collected_count += 1

            # 更新任务状态
            self.task.status = "completed"
            self.task.end_time = datetime.utcnow()
            self.task.result = {
                "total": collected_count,
                "success": collected_count
            }

        except Exception as e:
            # 处理错误
            self.task.status = "failed"
            self.task.end_time = datetime.utcnow()
            self.task.error = str(e)
            self.task.result = {
                "total": 0,
                "success": 0,
                "error": str(e)
            }

        finally:
            # 更新源最后运行时间
            self.source.last_run_at = datetime.utcnow()
            self.db.commit()

        return self.task

class WebCollector(ContentCollector):
    """网页内容采集器"""
    async def collect(self) -> List[Dict[str, Any]]:
        config = self.source.config
        urls = config.get('urls', [])
        selectors = config.get('selectors', {})
        contents = []

        async with aiohttp.ClientSession() as session:
            for url in urls:
                try:
                    async with session.get(url) as response:
                        if response.status == 200:
                            html = await response.text()
                            soup = BeautifulSoup(html, 'html.parser')
                            
                            # 提取内容
                            title = soup.select_one(selectors.get('title', 'title')).text.strip()
                            content = soup.select_one(selectors.get('content', 'body')).text.strip()
                            
                            contents.append({
                                'title': title,
                                'type': 'text',
                                'content': {'text': content},
                                'url': url,
                                'metadata': {
                                    'source_type': 'web',
                                    'collected_at': datetime.utcnow().isoformat()
                                }
                            })
                except Exception as e:
                    print(f"Error collecting from {url}: {str(e)}")

        return contents

class RSSCollector(ContentCollector):
    """RSS源采集器"""
    async def collect(self) -> List[Dict[str, Any]]:
        config = self.source.config
        feed_urls = config.get('feed_urls', [])
        contents = []

        for url in feed_urls:
            try:
                feed = feedparser.parse(url)
                for entry in feed.entries:
                    contents.append({
                        'title': entry.title,
                        'type': 'text',
                        'content': {
                            'text': entry.description,
                            'full_content': entry.get('content', [{'value': ''}])[0]['value']
                        },
                        'url': entry.link,
                        'metadata': {
                            'source_type': 'rss',
                            'author': entry.get('author'),
                            'published': entry.get('published'),
                            'collected_at': datetime.utcnow().isoformat()
                        }
                    })
            except Exception as e:
                print(f"Error collecting from RSS {url}: {str(e)}")

        return contents

class FileSystemCollector(ContentCollector):
    """文件系统采集器"""
    async def collect(self) -> List[Dict[str, Any]]:
        config = self.source.config
        paths = config.get('paths', [])
        file_types = config.get('file_types', ['*'])
        contents = []

        for path in paths:
            try:
                for root, _, files in os.walk(path):
                    for file in files:
                        if any(file.endswith(ft) for ft in file_types):
                            file_path = os.path.join(root, file)
                            content_type = self._get_content_type(file)
                            
                            contents.append({
                                'title': file,
                                'type': content_type,
                                'content': await self._read_file_content(file_path, content_type),
                                'url': file_path,
                                'metadata': {
                                    'source_type': 'file_system',
                                    'file_size': os.path.getsize(file_path),
                                    'created_time': datetime.fromtimestamp(os.path.getctime(file_path)).isoformat(),
                                    'modified_time': datetime.fromtimestamp(os.path.getmtime(file_path)).isoformat(),
                                    'collected_at': datetime.utcnow().isoformat()
                                }
                            })
            except Exception as e:
                print(f"Error collecting from path {path}: {str(e)}")

        return contents

    def _get_content_type(self, filename: str) -> str:
        """根据文件扩展名确定内容类型"""
        ext = filename.lower().split('.')[-1]
        type_mapping = {
            'txt': 'text',
            'md': 'text',
            'jpg': 'image',
            'jpeg': 'image',
            'png': 'image',
            'gif': 'image',
            'mp4': 'video',
            'avi': 'video',
            'mp3': 'audio',
            'wav': 'audio'
        }
        return type_mapping.get(ext, 'unknown')

    async def _read_file_content(self, file_path: str, content_type: str) -> Dict[str, Any]:
        """读取文件内容"""
        if content_type == 'text':
            with open(file_path, 'r', encoding='utf-8') as f:
                return {'text': f.read()}
        else:
            # 对于二进制文件，只返回文件路径
            return {'file_path': file_path}

class ContentCollectorFactory:
    """内容采集器工厂"""
    _collectors = {
        'web': WebCollector,
        'rss': RSSCollector,
        'file_system': FileSystemCollector
    }

    @classmethod
    def get_collector(cls, source_type: str, db: Session, source: ContentSource) -> Optional[ContentCollector]:
        """获取对应类型的内容采集器"""
        collector_class = cls._collectors.get(source_type)
        if collector_class:
            return collector_class(db, source)
        return None 