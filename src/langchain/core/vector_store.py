from typing import List, Optional, Dict, Any, Tuple
import numpy as np
from concurrent.futures import ThreadPoolExecutor
from functools import lru_cache
import threading
from langchain.vectorstores import FAISS
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.docstore.document import Document

class VectorStore:
    def __init__(self, 
                 embedding_model: str = "shibing624/text2vec-base-chinese",
                 batch_size: int = 32,
                 max_workers: int = 4,
                 cache_size: int = 1024):
        """初始化向量存储
        
        Args:
            embedding_model: 使用的embedding模型名称
            batch_size: 批处理大小
            max_workers: 最大工作线程数
            cache_size: 缓存大小
        """
        self.embeddings = HuggingFaceEmbeddings(model_name=embedding_model)
        self.vector_store = None
        self.batch_size = batch_size
        self.max_workers = max_workers
        self.cache_size = cache_size
        self._lock = threading.Lock()
    
    def _batch_texts(self, texts: List[str]) -> List[List[str]]:
        """将文本列表分批
        
        Args:
            texts: 文本列表
            
        Returns:
            批次列表
        """
        return [
            texts[i:i + self.batch_size]
            for i in range(0, len(texts), self.batch_size)
        ]
    
    @lru_cache(maxsize=1024)
    def _get_embedding(self, text: str) -> np.ndarray:
        """获取文本的向量表示（带缓存）
        
        Args:
            text: 输入文本
            
        Returns:
            向量表示
        """
        return self.embeddings.embed_query(text)
    
    def _process_batch(self, 
                      batch: List[str],
                      metadatas: Optional[List[Dict[str, Any]]] = None) -> List[str]:
        """处理一个批次的文本
        
        Args:
            batch: 文本批次
            metadatas: 元数据列表
            
        Returns:
            文档ID列表
        """
        if self.vector_store is None:
            with self._lock:
                if self.vector_store is None:
                    self.vector_store = FAISS.from_texts(
                        batch,
                        self.embeddings,
                        metadatas=metadatas[:len(batch)] if metadatas else None
                    )
                    return [str(i) for i in range(len(batch))]
        else:
            with self._lock:
                return self.vector_store.add_texts(
                    batch,
                    metadatas=metadatas[:len(batch)] if metadatas else None
                )
    
    def add_texts(self,
                 texts: List[str],
                 metadatas: Optional[List[Dict[str, Any]]] = None) -> List[str]:
        """添加文本到向量存储（并行处理）
        
        Args:
            texts: 要添加的文本列表
            metadatas: 文本对应的元数据列表
            
        Returns:
            添加的文档ID列表
        """
        # 分批处理
        batches = self._batch_texts(texts)
        metadata_batches = None
        if metadatas:
            metadata_batches = self._batch_texts(metadatas)
        
        # 并行处理每个批次
        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            futures = [
                executor.submit(
                    self._process_batch,
                    batch,
                    metadata_batches[i] if metadata_batches else None
                )
                for i, batch in enumerate(batches)
            ]
            
            # 收集结果
            results = []
            for future in futures:
                results.extend(future.result())
            
            return results
    
    def similarity_search(self,
                        query: str,
                        k: int = 4,
                        threshold: Optional[float] = None) -> List[Document]:
        """相似度搜索
        
        Args:
            query: 查询文本
            k: 返回最相似的k个结果
            threshold: 相似度阈值
            
        Returns:
            相似文档列表
        """
        if self.vector_store is None:
            raise ValueError("Vector store is empty. Please add some texts first.")
        
        # 获取查询向量（使用缓存）
        query_vector = self._get_embedding(query)
        
        # 执行搜索
        results = self.vector_store.similarity_search_with_score(query, k=k)
        
        # 应用阈值过滤
        if threshold is not None:
            results = [(doc, score) for doc, score in results if score >= threshold]
        
        return [doc for doc, _ in results]
    
    def similarity_search_with_score(self,
                                   query: str,
                                   k: int = 4,
                                   threshold: Optional[float] = None) -> List[Tuple[Document, float]]:
        """带分数的相似度搜索
        
        Args:
            query: 查询文本
            k: 返回最相似的k个结果
            threshold: 相似度阈值
            
        Returns:
            (文档,相似度分数)元组列表
        """
        if self.vector_store is None:
            raise ValueError("Vector store is empty. Please add some texts first.")
        
        # 获取查询向量（使用缓存）
        query_vector = self._get_embedding(query)
        
        # 执行搜索
        results = self.vector_store.similarity_search_with_score(query, k=k)
        
        # 应用阈值过滤
        if threshold is not None:
            results = [(doc, score) for doc, score in results if score >= threshold]
        
        return results
    
    def save_local(self, path: str):
        """保存向量存储到本地
        
        Args:
            path: 保存路径
        """
        if self.vector_store is None:
            raise ValueError("Vector store is empty. Nothing to save.")
        self.vector_store.save_local(path)
    
    def load_local(self, path: str):
        """从本地加载向量存储
        
        Args:
            path: 加载路径
        """
        self.vector_store = FAISS.load_local(path, self.embeddings)
        
    def clear_cache(self):
        """清空向量缓存"""
        self._get_embedding.cache_clear() 