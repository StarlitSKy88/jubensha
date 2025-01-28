from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
import logging
import yaml
import json
import asyncio
from typing import Dict, List, Optional
from datetime import datetime

from models import GameSession, GameProgress, User
from database import get_session
from auth import get_current_user
from schemas import (
    ClueInfo,
    GamePhase,
    HostAction,
    PlayerState,
    ProgressUpdate,
    SuggestionRequest,
    SuggestionResponse
)
from ai_models.host_assistant import HostAssistant

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
    title="主持人服务",
    description="游戏主持与进度管理服务",
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

# 初始化AI助手
host_assistant = HostAssistant(
    model_path=config["ai_service"]["model_path"],
    max_tokens=config["ai_service"]["max_tokens"],
    temperature=config["ai_service"]["temperature"]
)

# 全局状态
active_sessions: Dict[str, Dict] = {}
host_connections: Dict[str, WebSocket] = {}

class HostSession:
    def __init__(self, session_id: str, script_content: dict):
        self.session_id = session_id
        self.script_content = script_content
        self.current_phase: Optional[GamePhase] = None
        self.revealed_clues: List[ClueInfo] = []
        self.player_states: Dict[str, PlayerState] = {}
        self.start_time = datetime.utcnow()
        self.phase_start_time = datetime.utcnow()

    def update_phase(self, phase: GamePhase):
        self.current_phase = phase
        self.phase_start_time = datetime.utcnow()

    def reveal_clue(self, clue: ClueInfo):
        self.revealed_clues.append(clue)

    def update_player_state(self, player_id: str, state: PlayerState):
        self.player_states[player_id] = state

@app.websocket("/ws/{session_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    session_id: str,
    db: AsyncSession = Depends(get_session)
):
    await websocket.accept()
    
    # 验证会话
    session = await db.get(GameSession, session_id)
    if not session:
        await websocket.close(code=4000, reason="会话不存在")
        return
    
    host_connections[session_id] = websocket
    
    try:
        while True:
            data = await websocket.receive_json()
            
            if data["type"] == "reveal_clue":
                clue = ClueInfo(**data["clue"])
                if session_id in active_sessions:
                    active_sessions[session_id].reveal_clue(clue)
                await broadcast_to_players(session_id, {
                    "type": "clue_revealed",
                    "clue": clue.dict()
                })
            
            elif data["type"] == "update_phase":
                phase = GamePhase(**data["phase"])
                if session_id in active_sessions:
                    active_sessions[session_id].update_phase(phase)
                await broadcast_to_players(session_id, {
                    "type": "phase_updated",
                    "phase": phase.dict()
                })
            
            elif data["type"] == "request_suggestion":
                suggestion_request = SuggestionRequest(**data["request"])
                suggestion = await host_assistant.generate_suggestion(
                    game_state=active_sessions[session_id],
                    request=suggestion_request
                )
                await websocket.send_json({
                    "type": "suggestion",
                    "suggestion": suggestion.dict()
                })
    
    except WebSocketDisconnect:
        if session_id in host_connections:
            del host_connections[session_id]
    
    except Exception as e:
        logger.error(f"WebSocket错误: {str(e)}")
        await websocket.close(code=4002, reason="内部服务器错误")

async def broadcast_to_players(session_id: str, message: dict):
    """广播消息给所有玩家"""
    # 这里需要通过消息队列或其他方式与玩家服务通信
    pass

@app.post("/sessions/{session_id}/start")
async def start_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """开始游戏会话"""
    session = await db.get(GameSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="会话不存在")
    
    if session.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="只有主持人可以开始会话")
    
    if session_id not in active_sessions:
        active_sessions[session_id] = HostSession(
            session_id=session_id,
            script_content=session.script_content
        )
    
    return {"status": "success"}

@app.post("/sessions/{session_id}/end")
async def end_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """结束游戏会话"""
    session = await db.get(GameSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="会话不存在")
    
    if session.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="只有主持人可以结束会话")
    
    if session_id in active_sessions:
        del active_sessions[session_id]
    
    session.ended_at = datetime.utcnow()
    await db.commit()
    
    return {"status": "success"}

@app.post("/sessions/{session_id}/progress")
async def update_progress(
    session_id: str,
    progress: ProgressUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """更新游戏进度"""
    session = await db.get(GameSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="会话不存在")
    
    if session.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="只有主持人可以更新进度")
    
    db_progress = GameProgress(
        session_id=session_id,
        current_phase=progress.phase,
        revealed_clues=progress.revealed_clues,
        player_states=progress.player_states,
        host_notes=progress.notes
    )
    db.add(db_progress)
    await db.commit()
    
    return {"status": "success"}

@app.post("/sessions/{session_id}/action")
async def perform_action(
    session_id: str,
    action: HostAction,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """执行主持人动作"""
    session = await db.get(GameSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="会话不存在")
    
    if session.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="只有主持人可以执行此操作")
    
    if session_id not in active_sessions:
        raise HTTPException(status_code=400, detail="会话未开始")
    
    host_session = active_sessions[session_id]
    
    if action.type == "reveal_clue":
        host_session.reveal_clue(action.clue)
        await broadcast_to_players(session_id, {
            "type": "clue_revealed",
            "clue": action.clue.dict()
        })
    
    elif action.type == "update_phase":
        host_session.update_phase(action.phase)
        await broadcast_to_players(session_id, {
            "type": "phase_updated",
            "phase": action.phase.dict()
        })
    
    elif action.type == "send_hint":
        await broadcast_to_players(session_id, {
            "type": "hint_received",
            "hint": action.hint
        })
    
    return {"status": "success"}

@app.get("/sessions/{session_id}/suggestions")
async def get_suggestions(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """获取AI助手建议"""
    session = await db.get(GameSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="会话不存在")
    
    if session.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="只有主持人可以获取建议")
    
    if session_id not in active_sessions:
        raise HTTPException(status_code=400, detail="会话未开始")
    
    host_session = active_sessions[session_id]
    
    suggestions = await host_assistant.generate_suggestions(
        game_state=host_session,
        current_time=datetime.utcnow()
    )
    
    return suggestions

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "host_service:app",
        host=config["server"]["host"],
        port=config["host_service"]["port"],
        reload=config["server"]["debug"]
    ) 