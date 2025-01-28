from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
import logging
import yaml
import json
import asyncio
from typing import Dict, Set, Optional
from datetime import datetime
import aiortc
from aiortc import RTCPeerConnection, RTCSessionDescription
from aiortc.contrib.media import MediaRelay

from models import GameSession, User
from database import get_session
from auth import get_current_user
from schemas import (
    RoomInfo,
    ParticipantInfo,
    WebRTCOffer,
    WebRTCAnswer,
    AudioSettings
)

# 加载配置
with open("config/config.yaml", "r") as f:
    config = yaml.safe_load(f)

# 配置日志
logging.basicConfig(
    level=config["logging"]["level"],
    format=config["logging"]["format"],
    filename=config["logging"]["file"]
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="语音服务",
    description="实时语音通信服务",
    version="1.0.0"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=config["server"]["cors_origins"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 全局状态
rooms: Dict[str, Set[WebSocket]] = {}
peer_connections: Dict[str, RTCPeerConnection] = {}
media_relay = MediaRelay()

class VoiceRoom:
    def __init__(self, room_id: str):
        self.room_id = room_id
        self.participants: Dict[str, ParticipantInfo] = {}
        self.peer_connections: Dict[str, RTCPeerConnection] = {}
        self.audio_tracks: Dict[str, MediaRelay] = {}

    async def add_participant(self, user_id: str, websocket: WebSocket):
        if len(self.participants) >= config["voice_service"]["max_users_per_room"]:
            raise HTTPException(status_code=400, detail="房间已满")
        
        self.participants[user_id] = ParticipantInfo(
            user_id=user_id,
            joined_at=datetime.utcnow(),
            is_muted=False
        )
        
        # 创建WebRTC连接
        pc = RTCPeerConnection()
        self.peer_connections[user_id] = pc
        
        @pc.on("track")
        async def on_track(track):
            if track.kind == "audio":
                self.audio_tracks[user_id] = media_relay.subscribe(track)
                for other_id, other_pc in self.peer_connections.items():
                    if other_id != user_id:
                        other_pc.addTrack(self.audio_tracks[user_id])
        
        return pc

    async def remove_participant(self, user_id: str):
        if user_id in self.participants:
            del self.participants[user_id]
        if user_id in self.peer_connections:
            await self.peer_connections[user_id].close()
            del self.peer_connections[user_id]
        if user_id in self.audio_tracks:
            self.audio_tracks[user_id].stop()
            del self.audio_tracks[user_id]

    async def broadcast(self, message: dict, exclude_user_id: Optional[str] = None):
        for user_id, pc in self.peer_connections.items():
            if user_id != exclude_user_id:
                try:
                    await pc.send(json.dumps(message))
                except Exception as e:
                    logger.error(f"广播消息失败: {str(e)}")

voice_rooms: Dict[str, VoiceRoom] = {}

@app.websocket("/ws/{room_id}/{user_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    room_id: str,
    user_id: str,
    db: AsyncSession = Depends(get_session)
):
    await websocket.accept()
    
    # 验证房间和用户
    session = await db.get(GameSession, room_id)
    if not session:
        await websocket.close(code=4000, reason="房间不存在")
        return
    
    user = await db.get(User, user_id)
    if not user:
        await websocket.close(code=4001, reason="用户不存在")
        return
    
    # 获取或创建房间
    if room_id not in voice_rooms:
        voice_rooms[room_id] = VoiceRoom(room_id)
    room = voice_rooms[room_id]
    
    try:
        # 添加参与者
        pc = await room.add_participant(user_id, websocket)
        
        # 通知其他参与者
        await room.broadcast({
            "type": "user_joined",
            "user_id": user_id,
            "username": user.username
        }, user_id)
        
        while True:
            data = await websocket.receive_json()
            
            if data["type"] == "offer":
                offer = RTCSessionDescription(
                    sdp=data["sdp"],
                    type=data["type"]
                )
                await pc.setRemoteDescription(offer)
                answer = await pc.createAnswer()
                await pc.setLocalDescription(answer)
                
                await websocket.send_json({
                    "type": "answer",
                    "sdp": pc.localDescription.sdp
                })
            
            elif data["type"] == "ice_candidate":
                candidate = data["candidate"]
                await pc.addIceCandidate(candidate)
            
            elif data["type"] == "mute":
                room.participants[user_id].is_muted = data["muted"]
                await room.broadcast({
                    "type": "user_muted",
                    "user_id": user_id,
                    "muted": data["muted"]
                })
    
    except WebSocketDisconnect:
        await room.remove_participant(user_id)
        await room.broadcast({
            "type": "user_left",
            "user_id": user_id
        })
        
        # 如果房间为空，清理房间
        if not room.participants:
            del voice_rooms[room_id]
    
    except Exception as e:
        logger.error(f"WebSocket错误: {str(e)}")
        await websocket.close(code=4002, reason="内部服务器错误")

@app.get("/rooms/{room_id}", response_model=RoomInfo)
async def get_room_info(
    room_id: str,
    db: AsyncSession = Depends(get_session)
):
    """获取房间信息"""
    if room_id not in voice_rooms:
        raise HTTPException(status_code=404, detail="房间不存在")
    
    room = voice_rooms[room_id]
    return {
        "room_id": room_id,
        "participant_count": len(room.participants),
        "participants": list(room.participants.values())
    }

@app.post("/rooms/{room_id}/settings")
async def update_room_settings(
    room_id: str,
    settings: AudioSettings,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """更新房间音频设置"""
    session = await db.get(GameSession, room_id)
    if not session:
        raise HTTPException(status_code=404, detail="房间不存在")
    
    if session.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="只有主持人可以修改设置")
    
    if room_id in voice_rooms:
        room = voice_rooms[room_id]
        await room.broadcast({
            "type": "settings_updated",
            "settings": settings.dict()
        })
    
    return {"status": "success"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "voice_service:app",
        host=config["voice_service"]["host"],
        port=config["voice_service"]["port"],
        reload=config["server"]["debug"]
    ) 