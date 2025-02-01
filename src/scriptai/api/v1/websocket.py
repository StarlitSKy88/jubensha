"""WebSocket路由处理."""
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession

from scriptai.services.auth import AuthService
from scriptai.services.websocket import ws_manager
from scriptai.db.session import get_db

router = APIRouter()

@router.websocket("/ws/{token}")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str,
    db: AsyncSession = Depends(get_db),
):
    """WebSocket连接端点.
    
    Args:
        websocket: WebSocket连接
        token: 认证令牌
        db: 数据库会话
    """
    # 验证token
    auth_service = AuthService(db)
    session = await auth_service.get_session(token)
    
    if not session:
        await websocket.close(code=4001, reason="认证失败")
        return
        
    # 生成连接ID
    connection_id = str(uuid.uuid4())
    
    try:
        await ws_manager.connect(websocket, session.user_id, connection_id)
        
        # 发送连接成功消息
        await websocket.send_json({
            "type": "connected",
            "user_id": session.user_id
        })
        
        # 等待消息
        while True:
            try:
                # 接收消息
                data = await websocket.receive_json()
                
                # 处理消息
                message_type = data.get("type")
                if message_type == "ping":
                    await websocket.send_json({"type": "pong"})
                    
            except WebSocketDisconnect:
                break
                
    except WebSocketDisconnect:
        pass
    finally:
        # 断开连接
        await ws_manager.disconnect(session.user_id, connection_id)
        
@router.get("/online-users")
async def get_online_users():
    """获取在线用户列表.
    
    Returns:
        在线用户ID列表
    """
    return list(ws_manager.get_online_users()) 