from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
from ..core.version_manager import VersionManager
import os

app = FastAPI()
version_manager = VersionManager(os.path.join(os.getcwd(), "data", "versions"))

class VersionCreate(BaseModel):
    content: str
    metadata: Optional[Dict[str, Any]] = None

class VersionCompare(BaseModel):
    version_id1: str
    version_id2: str

@app.post("/version/create")
async def create_version(version: VersionCreate):
    """创建新版本
    
    Args:
        version: 版本内容和元数据
        
    Returns:
        版本ID
    """
    try:
        version_id = version_manager.create_version(version.content, version.metadata)
        return {"status": "success", "version_id": version_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/version/{version_id}")
async def get_version(version_id: str):
    """获取指定版本
    
    Args:
        version_id: 版本ID
        
    Returns:
        版本数据
    """
    try:
        version_data = version_manager.get_version(version_id)
        return {"status": "success", "version": version_data}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/version/diff")
async def get_diff(compare: VersionCompare):
    """获取版本差异
    
    Args:
        compare: 要比较的两个版本ID
        
    Returns:
        差异列表
    """
    try:
        diff = version_manager.get_diff(compare.version_id1, compare.version_id2)
        return {"status": "success", "diff": diff}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/version/history")
async def get_history():
    """获取版本历史
    
    Returns:
        版本历史列表
    """
    try:
        history = version_manager.get_history()
        return {"status": "success", "history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/version/rollback/{version_id}")
async def rollback(version_id: str):
    """回滚到指定版本
    
    Args:
        version_id: 目标版本ID
        
    Returns:
        回滚后的版本数据
    """
    try:
        version_data = version_manager.rollback(version_id)
        return {"status": "success", "version": version_data}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 