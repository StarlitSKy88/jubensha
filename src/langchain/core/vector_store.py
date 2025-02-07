from typing import List, Optional, Dict, Any
import numpy as np
from langchain.vectorstores import FAISS
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.docstore.document import Document

class VectorStore:
    def __init__(self, embedding_model: str = "shibing624/text2vec-base-chinese"):
        """初始化向量存储
        
        Args:
            embedding_model: 使用的embedding模型名称
        """
        self.embeddings = HuggingFaceEmbeddings(model_name=embedding_model)
        self.vector_store = None

    def add_texts(self, texts: List[str], metadatas: Optional[List[Dict[str, Any]]] = None) -> List[str]:
        """添加文本到向量存储
        
        Args:
            texts: 要添加的文本列表
            metadatas: 文本对应的元数据列表
            
        Returns:
            添加的文档ID列表
        """
        if self.vector_store is None:
            self.vector_store = FAISS.from_texts(texts, self.embeddings, metadatas=metadatas)
            return [str(i) for i in range(len(texts))]
        else:
            return self.vector_store.add_texts(texts, metadatas=metadatas)

    def similarity_search(self, query: str, k: int = 4) -> List[Document]:
        """相似度搜索
        
        Args:
            query: 查询文本
            k: 返回最相似的k个结果
            
        Returns:
            相似文档列表
        """
        if self.vector_store is None:
            raise ValueError("Vector store is empty. Please add some texts first.")
        return self.vector_store.similarity_search(query, k=k)

    def similarity_search_with_score(self, query: str, k: int = 4) -> List[tuple[Document, float]]:
        """带分数的相似度搜索
        
        Args:
            query: 查询文本
            k: 返回最相似的k个结果
            
        Returns:
            (文档,相似度分数)元组列表
        """
        if self.vector_store is None:
            raise ValueError("Vector store is empty. Please add some texts first.")
        return self.vector_store.similarity_search_with_score(query, k=k)

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