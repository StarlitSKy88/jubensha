from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from ..core.knowledge_base import KnowledgeBase
import os

app = FastAPI()
knowledge_base = KnowledgeBase()

class Document(BaseModel):
    content: str
    doc_id: str
    doc_type: Optional[str] = "text"
    metadata: Optional[Dict[str, Any]] = None

class UpdateDocument(BaseModel):
    content: str
    metadata: Optional[Dict[str, Any]] = None

class SearchQuery(BaseModel):
    query: str
    limit: Optional[int] = 5

@app.post("/documents/add")
async def add_document(document: Document):
    """添加文档
    
    Args:
        document: 文档信息
        
    Returns:
        文档ID
    """
    try:
        doc_id = knowledge_base.add_document(
            content=document.content,
            doc_id=document.doc_id,
            doc_type=document.doc_type,
            metadata=document.metadata
        )
        return {"status": "success", "doc_id": doc_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/documents/{doc_id}")
async def update_document(doc_id: str, document: UpdateDocument):
    """更新文档
    
    Args:
        doc_id: 文档ID
        document: 更新的文档信息
    """
    try:
        knowledge_base.update_document(
            doc_id=doc_id,
            content=document.content,
            metadata=document.metadata
        )
        return {"status": "success", "message": f"Document {doc_id} updated"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/documents/{doc_id}")
async def delete_document(doc_id: str):
    """删除文档
    
    Args:
        doc_id: 文档ID
    """
    try:
        knowledge_base.delete_document(doc_id)
        return {"status": "success", "message": f"Document {doc_id} deleted"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/documents/{doc_id}/versions")
async def get_document_versions(doc_id: str):
    """获取文档版本历史
    
    Args:
        doc_id: 文档ID
        
    Returns:
        版本列表
    """
    try:
        versions = knowledge_base.get_document_versions(doc_id)
        return {"status": "success", "versions": versions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/documents/{doc_id}/versions/{timestamp}")
async def get_document_version(doc_id: str, timestamp: str):
    """获取文档特定版本
    
    Args:
        doc_id: 文档ID
        timestamp: 版本时间戳
        
    Returns:
        版本数据
    """
    try:
        version = knowledge_base.get_document_version(doc_id, timestamp)
        return {"status": "success", "version": version}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/search")
async def search(query: SearchQuery):
    """搜索知识库
    
    Args:
        query: 搜索查询
        
    Returns:
        搜索结果
    """
    try:
        results = knowledge_base.search(query.query, limit=query.limit)
        return {"status": "success", "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/statistics")
async def get_statistics():
    """获取知识库统计信息
    
    Returns:
        统计信息
    """
    try:
        stats = knowledge_base.get_statistics()
        return {"status": "success", "statistics": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 