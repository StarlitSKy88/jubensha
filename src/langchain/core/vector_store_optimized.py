from typing import List, Dict, Any, Optional, Tuple, Callable, AsyncIterator
import numpy as np
from concurrent.futures import ThreadPoolExecutor
import asyncio
from functools import lru_cache
import threading
from datetime import datetime
import psutil
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_core.documents import Document
from src.utils.logger import default_logger
from src.utils.monitor import default_monitor

class ProgressCallback:
    """进度回调类"""
    def __init__(self, total: int, description: str = "Processing"):
        self.total = total
        self.current = 0
        self.description = description
        self.start_time = datetime.now()
    
    def update(self, n: int = 1):
        """更新进度"""
        self.current += n
        elapsed = (datetime.now() - self.start_time).total_seconds()
        if self.current > 0:
            speed = self.current / elapsed
            eta = (self.total - self.current) / speed if speed > 0 else 0
        else:
            speed = 0
            eta = 0
        
        default_logger.info(
            f"{self.description}: {self.current}/{self.total} "
            f"({self.current/self.total*100:.1f}%) "
            f"Speed: {speed:.1f} items/s ETA: {eta:.1f}s"
        )

class VectorStoreOptimized:
    def __init__(self, 
                 embedding_model: str = "shibing624/text2vec-base-chinese",
                 batch_size: int = 32,
                 max_workers: int = 4,
                 cache_size: int = 1024,
                 memory_limit: float = 0.8):  # 内存使用限制(百分比)
        """初始化向量存储
        
        Args:
            embedding_model: 使用的embedding模型名称
            batch_size: 批处理大小
            max_workers: 最大工作线程数
            cache_size: 缓存大小
            memory_limit: 内存使用限制
        """
        self.embeddings = HuggingFaceEmbeddings(model_name=embedding_model)
        self.vector_store = None
        self.batch_size = batch_size
        self.max_workers = max_workers
        self.cache_size = cache_size
        self.memory_limit = memory_limit
        self._lock = threading.Lock()
        self._executor = ThreadPoolExecutor(max_workers=max_workers)
        
        # 监控初始状态
        self._log_system_status("Initialized vector store")
    
    def _log_system_status(self, operation: str):
        """记录系统状态"""
        metrics = default_monitor.get_metrics()
        if metrics:
            memory_percent = metrics['memory']['percent']
            cpu_percent = metrics['cpu']['percent']
            default_logger.info(
                f"Operation: {operation} - "
                f"Memory: {memory_percent}% CPU: {cpu_percent}% "
                f"Cache Size: {self._get_embedding.cache_info().currsize}"
            )
    
    def _check_memory(self) -> bool:
        """检查内存使用情况"""
        metrics = default_monitor.get_metrics()
        if metrics:
            return metrics['memory']['percent'] < (self.memory_limit * 100)
        return True  # 如果无法获取指标，假设内存充足
    
    async def _wait_for_memory(self):
        """等待内存可用"""
        while not self._check_memory():
            default_logger.warning("Memory usage high, waiting...")
            await asyncio.sleep(1)
    
    def _batch_texts(self, texts: List[str]) -> List[List[str]]:
        """将文本列表分批"""
        return [
            texts[i:i + self.batch_size]
            for i in range(0, len(texts), self.batch_size)
        ]
    
    @lru_cache(maxsize=1024)
    def _get_embedding(self, text: str) -> np.ndarray:
        """获取文本的向量表示（带缓存）"""
        return self.embeddings.embed_query(text)
    
    async def _process_batch(self,
                           batch: List[str],
                           metadatas: Optional[List[Dict[str, Any]]] = None,
                           callback: Optional[ProgressCallback] = None) -> List[str]:
        """异步处理一个批次的文本"""
        await self._wait_for_memory()
        
        try:
            if self.vector_store is None:
                async with asyncio.Lock():
                    if self.vector_store is None:
                        self.vector_store = FAISS.from_texts(
                            batch,
                            self.embeddings,
                            metadatas=metadatas[:len(batch)] if metadatas else None
                        )
                        if callback:
                            callback.update(len(batch))
                        return [str(i) for i in range(len(batch))]
            else:
                async with asyncio.Lock():
                    result = self.vector_store.add_texts(
                        batch,
                        metadatas=metadatas[:len(batch)] if metadatas else None
                    )
                    if callback:
                        callback.update(len(batch))
                    return result
        except Exception as e:
            default_logger.error(f"Error processing batch: {str(e)}")
            raise
    
    async def add_texts_async(self,
                            texts: List[str],
                            metadatas: Optional[List[Dict[str, Any]]] = None,
                            progress_callback: Optional[Callable[[int, int], None]] = None) -> List[str]:
        """异步添加文本到向量存储
        
        Args:
            texts: 要添加的文本列表
            metadatas: 文本对应的元数据列表
            progress_callback: 进度回调函数
            
        Returns:
            添加的文档ID列表
        """
        self._log_system_status("Starting add_texts_async")
        
        # 创建进度回调
        callback = ProgressCallback(len(texts), "Adding texts")
        
        # 分批处理
        batches = self._batch_texts(texts)
        metadata_batches = None
        if metadatas:
            metadata_batches = self._batch_texts(metadatas)
        
        # 并行处理每个批次
        tasks = [
            self._process_batch(
                batch,
                metadata_batches[i] if metadata_batches else None,
                callback
            )
            for i, batch in enumerate(batches)
        ]
        
        # 收集结果
        results = []
        for batch_result in await asyncio.gather(*tasks):
            results.extend(batch_result)
        
        self._log_system_status("Completed add_texts_async")
        return results
    
    async def similarity_search_async(self,
                                    query: str,
                                    k: int = 4,
                                    threshold: Optional[float] = None) -> List[Document]:
        """异步相似度搜索"""
        if self.vector_store is None:
            raise ValueError("Vector store is empty. Please add some texts first.")
        
        await self._wait_for_memory()
        
        try:
            # 获取查询向量（使用缓存）
            query_vector = self._get_embedding(query)
            
            # 执行搜索
            results = self.vector_store.similarity_search_with_score(query, k=k)
            
            # 应用阈值过滤
            if threshold is not None:
                results = [(doc, score) for doc, score in results if score >= threshold]
            
            return [doc for doc, _ in results]
        finally:
            self._log_system_status("Completed similarity_search_async")
    
    async def similarity_search_with_score_async(self,
                                               query: str,
                                               k: int = 4,
                                               threshold: Optional[float] = None) -> List[Tuple[Document, float]]:
        """异步带分数的相似度搜索"""
        if self.vector_store is None:
            raise ValueError("Vector store is empty. Please add some texts first.")
        
        await self._wait_for_memory()
        
        try:
            # 获取查询向量（使用缓存）
            query_vector = self._get_embedding(query)
            
            # 执行搜索
            results = self.vector_store.similarity_search_with_score(query, k=k)
            
            # 应用阈值过滤
            if threshold is not None:
                results = [(doc, score) for doc, score in results if score >= threshold]
            
            return results
        finally:
            self._log_system_status("Completed similarity_search_with_score_async")
    
    def save_local(self, path: str):
        """保存向量存储到本地"""
        if self.vector_store is None:
            raise ValueError("Vector store is empty. Nothing to save.")
        
        try:
            self.vector_store.save_local(path)
            self._log_system_status(f"Saved to {path}")
        except Exception as e:
            default_logger.error(f"Error saving vector store: {str(e)}")
            raise
    
    def load_local(self, path: str):
        """从本地加载向量存储"""
        try:
            self.vector_store = FAISS.load_local(path, self.embeddings)
            self._log_system_status(f"Loaded from {path}")
        except Exception as e:
            default_logger.error(f"Error loading vector store: {str(e)}")
            raise
    
    def clear_cache(self):
        """清空向量缓存"""
        before_size = self._get_embedding.cache_info().currsize
        self._get_embedding.cache_clear()
        default_logger.info(f"Cleared cache (size before: {before_size})")
    
    def get_stats(self) -> Dict[str, Any]:
        """获取性能统计信息
        
        Returns:
            包含各种性能指标的字典
        """
        metrics = default_monitor.get_metrics()
        cache_info = self._get_embedding.cache_info()
        
        return {
            "memory_usage": metrics['memory']['percent'] if metrics else 0,
            "cpu_usage": metrics['cpu']['percent'] if metrics else 0,
            "cache_hits": cache_info.hits,
            "cache_misses": cache_info.misses,
            "cache_size": cache_info.currsize,
            "batch_size": self.batch_size,
            "max_workers": self.max_workers
        } 