from typing import List, Dict, Any, Optional
from datetime import datetime
import json
import os
from .vector_store import VectorStore
from ..utils.text_splitter import TextSplitter

class KnowledgeBase:
    def __init__(self, 
                 storage_path: str = "data/knowledge",
                 chunk_size: int = 500,
                 chunk_overlap: int = 50):
        """初始化知识库
        
        Args:
            storage_path: 知识库存储路径
            chunk_size: 文本块大小
            chunk_overlap: 文本块重叠大小
        """
        self.storage_path = storage_path
        self.vector_store = VectorStore()
        self.text_splitter = TextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap
        )
        self.metadata_path = os.path.join(storage_path, "metadata.json")
        self.version_path = os.path.join(storage_path, "versions")
        
        os.makedirs(storage_path, exist_ok=True)
        os.makedirs(self.version_path, exist_ok=True)
        self._init_metadata()
    
    def _init_metadata(self):
        """初始化或加载元数据"""
        if os.path.exists(self.metadata_path):
            with open(self.metadata_path, "r", encoding="utf-8") as f:
                self.metadata = json.load(f)
        else:
            self.metadata = {
                "version": "0.1.0",
                "last_update": datetime.now().isoformat(),
                "document_count": 0,
                "chunk_count": 0,
                "documents": {}
            }
            self._save_metadata()
    
    def _save_metadata(self):
        """保存元数据"""
        with open(self.metadata_path, "w", encoding="utf-8") as f:
            json.dump(self.metadata, f, ensure_ascii=False, indent=2)
    
    def add_document(self, 
                    content: str,
                    doc_id: str,
                    doc_type: str = "text",
                    metadata: Optional[Dict[str, Any]] = None) -> str:
        """添加文档到知识库
        
        Args:
            content: 文档内容
            doc_id: 文档ID
            doc_type: 文档类型
            metadata: 文档元数据
            
        Returns:
            文档ID
        """
        # 分割文本
        chunks = self.text_splitter.split_text(content)
        
        # 准备元数据
        doc_metadata = metadata or {}
        doc_metadata.update({
            "doc_id": doc_id,
            "doc_type": doc_type,
            "timestamp": datetime.now().isoformat()
        })
        
        # 添加到向量存储
        chunk_ids = self.vector_store.add_texts(chunks, [doc_metadata] * len(chunks))
        
        # 更新元数据
        self.metadata["documents"][doc_id] = {
            "type": doc_type,
            "metadata": doc_metadata,
            "chunk_count": len(chunks),
            "chunk_ids": chunk_ids,
            "timestamp": doc_metadata["timestamp"]
        }
        self.metadata["document_count"] = len(self.metadata["documents"])
        self.metadata["chunk_count"] += len(chunks)
        self.metadata["last_update"] = datetime.now().isoformat()
        
        # 保存元数据
        self._save_metadata()
        
        # 创建版本备份
        self._create_version(doc_id, content, doc_metadata)
        
        return doc_id
    
    def update_document(self,
                       doc_id: str,
                       content: str,
                       metadata: Optional[Dict[str, Any]] = None) -> str:
        """更新文档
        
        Args:
            doc_id: 文档ID
            content: 新的文档内容
            metadata: 新的元数据
            
        Returns:
            文档ID
        """
        if doc_id not in self.metadata["documents"]:
            raise ValueError(f"Document {doc_id} not found")
        
        # 获取原文档信息
        doc_info = self.metadata["documents"][doc_id]
        
        # 更新元数据
        if metadata:
            doc_info["metadata"].update(metadata)
        
        # 删除旧的向量
        self.metadata["chunk_count"] -= doc_info["chunk_count"]
        
        # 添加新的文档
        return self.add_document(
            content=content,
            doc_id=doc_id,
            doc_type=doc_info["type"],
            metadata=doc_info["metadata"]
        )
    
    def delete_document(self, doc_id: str):
        """删除文档
        
        Args:
            doc_id: 文档ID
        """
        if doc_id not in self.metadata["documents"]:
            raise ValueError(f"Document {doc_id} not found")
        
        # 更新元数据
        doc_info = self.metadata["documents"][doc_id]
        self.metadata["chunk_count"] -= doc_info["chunk_count"]
        self.metadata["document_count"] -= 1
        del self.metadata["documents"][doc_id]
        
        # 保存元数据
        self._save_metadata()
    
    def _create_version(self, doc_id: str, content: str, metadata: Dict[str, Any]):
        """创建文档版本
        
        Args:
            doc_id: 文档ID
            content: 文档内容
            metadata: 文档元数据
        """
        version_data = {
            "content": content,
            "metadata": metadata,
            "timestamp": datetime.now().isoformat()
        }
        
        version_file = os.path.join(
            self.version_path,
            f"{doc_id}_{metadata['timestamp']}.json"
        )
        
        with open(version_file, "w", encoding="utf-8") as f:
            json.dump(version_data, f, ensure_ascii=False, indent=2)
    
    def get_document_versions(self, doc_id: str) -> List[Dict[str, Any]]:
        """获取文档的所有版本
        
        Args:
            doc_id: 文档ID
            
        Returns:
            版本列表
        """
        versions = []
        for filename in os.listdir(self.version_path):
            if filename.startswith(f"{doc_id}_") and filename.endswith(".json"):
                with open(os.path.join(self.version_path, filename), "r", encoding="utf-8") as f:
                    version_data = json.load(f)
                    versions.append(version_data)
        
        return sorted(versions, key=lambda x: x["timestamp"], reverse=True)
    
    def get_document_version(self, doc_id: str, timestamp: str) -> Dict[str, Any]:
        """获取文档的特定版本
        
        Args:
            doc_id: 文档ID
            timestamp: 版本时间戳
            
        Returns:
            版本数据
        """
        version_file = os.path.join(self.version_path, f"{doc_id}_{timestamp}.json")
        if not os.path.exists(version_file):
            raise ValueError(f"Version not found: {doc_id}_{timestamp}")
        
        with open(version_file, "r", encoding="utf-8") as f:
            return json.load(f)
    
    def search(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """搜索知识库
        
        Args:
            query: 查询文本
            limit: 返回结果数量
            
        Returns:
            搜索结果列表
        """
        results = self.vector_store.similarity_search_with_score(query, k=limit)
        return [
            {
                "content": doc.page_content,
                "metadata": doc.metadata,
                "score": score
            }
            for doc, score in results
        ]
    
    def get_statistics(self) -> Dict[str, Any]:
        """获取知识库统计信息
        
        Returns:
            统计信息
        """
        return {
            "version": self.metadata["version"],
            "last_update": self.metadata["last_update"],
            "document_count": self.metadata["document_count"],
            "chunk_count": self.metadata["chunk_count"]
        } 