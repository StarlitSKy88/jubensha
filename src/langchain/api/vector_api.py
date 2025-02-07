from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from ..core.vector_store import VectorStore
import os

app = FastAPI()
vector_store = VectorStore()

class TextItem(BaseModel):
    text: str
    metadata: Optional[Dict[str, Any]] = None

class TextItems(BaseModel):
    texts: List[TextItem]

class SearchQuery(BaseModel):
    query: str
    k: Optional[int] = 4

@app.post("/texts/add")
async def add_texts(items: TextItems):
    """添加文本到向量存储
    
    Args:
        items: 包含文本和元数据的列表
        
    Returns:
        添加的文档ID列表
    """
    try:
        texts = [item.text for item in items.texts]
        metadatas = [item.metadata for item in items.texts]
        ids = vector_store.add_texts(texts, metadatas)
        return {"status": "success", "ids": ids}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/search")
async def search(query: SearchQuery):
    """相似度搜索
    
    Args:
        query: 查询文本和参数
        
    Returns:
        相似文档列表
    """
    try:
        docs = vector_store.similarity_search(query.query, k=query.k)
        results = []
        for doc in docs:
            results.append({
                "text": doc.page_content,
                "metadata": doc.metadata,
            })
        return {"status": "success", "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/search/with_score")
async def search_with_score(query: SearchQuery):
    """带分数的相似度搜索
    
    Args:
        query: 查询文本和参数
        
    Returns:
        (文档,相似度分数)列表
    """
    try:
        docs = vector_store.similarity_search_with_score(query.query, k=query.k)
        results = []
        for doc, score in docs:
            results.append({
                "text": doc.page_content,
                "metadata": doc.metadata,
                "score": float(score)
            })
        return {"status": "success", "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/save")
async def save(path: str):
    """保存向量存储到本地
    
    Args:
        path: 保存路径
    """
    try:
        vector_store.save_local(path)
        return {"status": "success", "message": f"Vector store saved to {path}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/load")
async def load(path: str):
    """从本地加载向量存储
    
    Args:
        path: 加载路径
    """
    try:
        if not os.path.exists(path):
            raise HTTPException(status_code=404, detail=f"Path {path} not found")
        vector_store.load_local(path)
        return {"status": "success", "message": f"Vector store loaded from {path}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 