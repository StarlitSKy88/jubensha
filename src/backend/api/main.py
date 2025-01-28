from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import uvicorn
import logging
import yaml
import os

from models import *
from database import get_session
from auth import get_current_user, create_access_token
from schemas import *

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
    title="剧本游戏API",
    description="智能剧本生成与语音聊天系统API",
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

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# 认证路由
@app.post("/token", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_session)
):
    user = await authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="用户名或密码错误"
        )
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

# 用户路由
@app.post("/users", response_model=UserResponse)
async def create_user(
    user: UserCreate,
    db: AsyncSession = Depends(get_session)
):
    db_user = await get_user_by_username(db, user.username)
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="用户名已存在"
        )
    return await create_new_user(db, user)

@app.get("/users/me", response_model=UserResponse)
async def read_users_me(
    current_user: User = Depends(get_current_user)
):
    return current_user

# 房间路由
@app.post("/rooms", response_model=RoomResponse)
async def create_room(
    room: RoomCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    return await create_new_room(db, room, current_user)

@app.get("/rooms", response_model=List[RoomResponse])
async def list_rooms(
    skip: int = 0,
    limit: int = 10,
    db: AsyncSession = Depends(get_session)
):
    return await get_rooms(db, skip, limit)

@app.get("/rooms/{room_id}", response_model=RoomResponse)
async def get_room(
    room_id: str,
    db: AsyncSession = Depends(get_session)
):
    room = await get_room_by_id(db, room_id)
    if not room:
        raise HTTPException(
            status_code=404,
            detail="房间不存在"
        )
    return room

# 问卷路由
@app.post("/questionnaires", response_model=QuestionnaireResponse)
async def submit_questionnaire(
    questionnaire: QuestionnaireCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    return await create_questionnaire(db, questionnaire, current_user)

@app.get("/questionnaires/{questionnaire_id}", response_model=QuestionnaireResponse)
async def get_questionnaire(
    questionnaire_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    questionnaire = await get_questionnaire_by_id(db, questionnaire_id)
    if not questionnaire:
        raise HTTPException(
            status_code=404,
            detail="问卷不存在"
        )
    if questionnaire.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="没有权限访问此问卷"
        )
    return questionnaire

# 游戏进度路由
@app.post("/progress", response_model=GameProgressResponse)
async def update_progress(
    progress: GameProgressUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    return await update_game_progress(db, progress, current_user)

@app.get("/progress/{session_id}", response_model=GameProgressResponse)
async def get_progress(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    progress = await get_progress_by_session(db, session_id)
    if not progress:
        raise HTTPException(
            status_code=404,
            detail="游戏进度不存在"
        )
    return progress

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=config["server"]["host"],
        port=config["server"]["port"],
        reload=config["server"]["debug"]
    )
