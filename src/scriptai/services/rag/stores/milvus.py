"""Milvus向量存储实现."""
from typing import Any, Dict, List, Optional

from scriptai.core.milvus import MilvusManager
from scriptai.services.rag.base import Document, SearchResult, VectorStore


class MilvusVectorStore(VectorStore):
    """Milvus向量存储实现."""

    def __init__(self, manager: Optional[MilvusManager] = None) -> None:
        """初始化Milvus向量存储."""
        self.manager = manager or MilvusManager()

    async def connect(self) -> None:
        """连接到Milvus."""
        await self.manager.connect()

    async def close(self) -> None:
        """关闭连接."""
        await self.manager.close()

    async def add(
        self,
        documents: List[Document],
        embeddings: List[List[float]],
    ) -> bool:
        """添加文档."""
        try:
            # 准备数据
            contents = [doc.content for doc in documents]
            metadata_list = [doc.metadata for doc in documents]

            # 确定分区
            partition_name = (
                documents[0].metadata.get("type", "default")
                if documents
                else "default"
            )

            # 插入数据
            return await self.manager.insert(
                contents=contents,
                embeddings=embeddings,
                metadata_list=metadata_list,
                partition_name=partition_name,
            )
        except Exception as e:
            print(f"添加文档失败: {e}")
            return False

    async def search(
        self,
        query_vector: List[float],
        limit: int = 5,
        filter: Optional[Dict[str, Any]] = None,
    ) -> List[SearchResult]:
        """搜索相似文档."""
        try:
            # 确定分区
            partition_names = None
            if filter and "type" in filter:
                partition_names = [filter["type"]]

            # 执行搜索
            results = await self.manager.search(
                vector=query_vector,
                limit=limit,
                partition_names=partition_names,
            )

            # 转换结果
            return [
                SearchResult(
                    content=result["content"],
                    score=1.0 - result["distance"],  # 将距离转换为相似度分数
                    metadata=result["metadata"],
                )
                for result in results
            ]
        except Exception as e:
            print(f"搜索文档失败: {e}")
            return []

    async def delete(
        self,
        filter: Dict[str, Any],
    ) -> bool:
        """删除文档."""
        # TODO: 实现删除功能
        return False 