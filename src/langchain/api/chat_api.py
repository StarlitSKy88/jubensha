from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from ..core.chat_manager import ChatManager
import os

app = FastAPI()
chat_manager = ChatManager()

class ChatMessage(BaseModel):
    message: str
    context: Optional[str] = None

class HistoryPath(BaseModel):
    path: str

@app.post("/chat")
async def chat(chat_message: ChatMessage):
    """进行对话
    
    Args:
        chat_message: 包含用户消息和可选上下文
        
    Returns:
        AI的回复
    """
    try:
        if chat_message.context:
            chat_manager.update_context(chat_message.context)
        response = chat_manager.chat(chat_message.message)
        return {"status": "success", "response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history")
async def get_history():
    """获取对话历史
    
    Returns:
        对话历史列表
    """
    try:
        history = chat_manager.get_history()
        return {"status": "success", "history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/history/clear")
async def clear_history():
    """清空对话历史"""
    try:
        chat_manager.clear_history()
        return {"status": "success", "message": "对话历史已清空"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/history/save")
async def save_history(path_info: HistoryPath):
    """保存对话历史
    
    Args:
        path_info: 保存路径信息
    """
    try:
        chat_manager.save_history(path_info.path)
        return {"status": "success", "message": f"对话历史已保存到 {path_info.path}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/history/load")
async def load_history(path_info: HistoryPath):
    """加载对话历史
    
    Args:
        path_info: 加载路径信息
    """
    try:
        if not os.path.exists(path_info.path):
            raise HTTPException(status_code=404, detail=f"文件 {path_info.path} 不存在")
        chat_manager.load_history(path_info.path)
        return {"status": "success", "message": f"对话历史已从 {path_info.path} 加载"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 