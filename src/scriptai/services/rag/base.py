"""RAG系统基础组件."""
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class Document(BaseModel):
    """文档模型."""

    content: str
    metadata: Dict[str, Any]


class SearchResult(BaseModel):
    """搜索结果模型."""

    content: str
    score: float
    metadata: Dict[str, Any]


class VectorStore(ABC):
    """向量存储抽象基类."""

    @abstractmethod
    async def add(
        self,
        documents: List[Document],
        embeddings: List[List[float]],
    ) -> bool:
        """添加文档."""
        pass

    @abstractmethod
    async def search(
        self,
        query_vector: List[float],
        limit: int = 5,
        filter: Optional[Dict[str, Any]] = None,
    ) -> List[SearchResult]:
        """搜索相似文档."""
        pass

    @abstractmethod
    async def delete(
        self,
        filter: Dict[str, Any],
    ) -> bool:
        """删除文档."""
        pass


class TextProcessor(ABC):
    """文本处理器抽象基类."""

    @abstractmethod
    async def split(self, text: str) -> List[str]:
        """文本分块."""
        pass

    @abstractmethod
    async def clean(self, text: str) -> str:
        """文本清理."""
        pass

    @abstractmethod
    async def extract_metadata(self, text: str) -> Dict[str, Any]:
        """提取元数据."""
        pass


class EmbeddingModel(ABC):
    """嵌入模型抽象基类."""

    @abstractmethod
    async def encode(self, texts: List[str]) -> List[List[float]]:
        """文本编码."""
        pass

    @abstractmethod
    async def encode_query(self, text: str) -> List[float]:
        """查询编码."""
        pass


class LLMModel(ABC):
    """大语言模型抽象基类."""

    @abstractmethod
    async def generate(
        self,
        prompt: str,
        context: List[str],
        **kwargs: Dict[str, Any],
    ) -> str:
        """生成文本."""
        pass

    @abstractmethod
    async def rewrite_query(self, query: str) -> str:
        """重写查询."""
        pass


class RAGService:
    """RAG服务基类."""

    def __init__(
        self,
        vector_store: VectorStore,
        text_processor: TextProcessor,
        embedding_model: EmbeddingModel,
        llm_model: LLMModel,
    ) -> None:
        """初始化RAG服务."""
        self.vector_store = vector_store
        self.text_processor = text_processor
        self.embedding_model = embedding_model
        self.llm_model = llm_model

    async def add_document(self, content: str) -> bool:
        """添加文档."""
        # 清理文本
        cleaned_text = await self.text_processor.clean(content)

        # 分块
        chunks = await self.text_processor.split(cleaned_text)

        # 提取元数据
        metadata = await self.text_processor.extract_metadata(cleaned_text)

        # 创建文档
        documents = [
            Document(content=chunk, metadata=metadata)
            for chunk in chunks
        ]

        # 生成向量
        embeddings = await self.embedding_model.encode(chunks)

        # 存储向量
        return await self.vector_store.add(documents, embeddings)

    async def search(
        self,
        query: str,
        limit: int = 5,
        filter: Optional[Dict[str, Any]] = None,
    ) -> List[SearchResult]:
        """搜索相似文档."""
        # 重写查询
        rewritten_query = await self.llm_model.rewrite_query(query)

        # 生成查询向量
        query_vector = await self.embedding_model.encode_query(rewritten_query)

        # 搜索相似文档
        return await self.vector_store.search(
            query_vector=query_vector,
            limit=limit,
            filter=filter,
        )

    async def generate(
        self,
        query: str,
        **kwargs: Dict[str, Any],
    ) -> str:
        """生成回答."""
        # 搜索相关文档
        results = await self.search(query)

        # 提取上下文
        context = [result.content for result in results]

        # 生成回答
        return await self.llm_model.generate(
            prompt=query,
            context=context,
            **kwargs,
        ) 