"""WebSocket会话管理."""
from typing import Dict, Set
from fastapi import WebSocket
from datetime import datetime

class WebSocketManager:
    """WebSocket连接管理器."""
    
    def __init__(self):
        """初始化WebSocket管理器."""
        # 活跃连接: user_id -> {connection_id -> websocket}
        self.active_connections: Dict[str, Dict[str, WebSocket]] = {}
        # 用户在线状态: user_id -> last_seen
        self.online_users: Dict[str, datetime] = {}
        
    async def connect(
        self, 
        websocket: WebSocket, 
        user_id: str,
        connection_id: str
    ) -> None:
        """建立新的WebSocket连接.
        
        Args:
            websocket: WebSocket连接
            user_id: 用户ID
            connection_id: 连接ID
        """
        await websocket.accept()
        
        if user_id not in self.active_connections:
            self.active_connections[user_id] = {}
            
        self.active_connections[user_id][connection_id] = websocket
        self.online_users[user_id] = datetime.utcnow()
        
        # 广播用户上线消息
        await self.broadcast_user_status(user_id, True)
        
    async def disconnect(self, user_id: str, connection_id: str) -> None:
        """断开WebSocket连接.
        
        Args:
            user_id: 用户ID
            connection_id: 连接ID
        """
        if user_id in self.active_connections:
            if connection_id in self.active_connections[user_id]:
                del self.active_connections[user_id][connection_id]
                
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
                del self.online_users[user_id]
                # 广播用户下线消息
                await self.broadcast_user_status(user_id, False)
                
    async def send_personal_message(
        self, 
        message: dict,
        user_id: str
    ) -> None:
        """发送个人消息.
        
        Args:
            message: 消息内容
            user_id: 目标用户ID
        """
        if user_id in self.active_connections:
            for websocket in self.active_connections[user_id].values():
                await websocket.send_json(message)
                
    async def broadcast(self, message: dict) -> None:
        """广播消息给所有连接.
        
        Args:
            message: 消息内容
        """
        for connections in self.active_connections.values():
            for websocket in connections.values():
                await websocket.send_json(message)
                
    async def broadcast_user_status(
        self,
        user_id: str,
        is_online: bool
    ) -> None:
        """广播用户在线状态.
        
        Args:
            user_id: 用户ID
            is_online: 是否在线
        """
        message = {
            "type": "user_status",
            "user_id": user_id,
            "is_online": is_online,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.broadcast(message)
        
    def get_online_users(self) -> Set[str]:
        """获取在线用户列表.
        
        Returns:
            在线用户ID集合
        """
        return set(self.online_users.keys())
        
    async def force_logout(self, user_id: str) -> None:
        """强制用户登出.
        
        Args:
            user_id: 用户ID
        """
        if user_id in self.active_connections:
            message = {
                "type": "force_logout",
                "reason": "您的账号在其他地方登录"
            }
            await self.send_personal_message(message, user_id)
            
            # 关闭所有连接
            connections = self.active_connections[user_id].copy()
            for connection_id in connections:
                await self.disconnect(user_id, connection_id)

# 全局WebSocket管理器实例
ws_manager = WebSocketManager() 