from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
import logging
import yaml
import json
from typing import List, Optional
from datetime import datetime

from models import Questionnaire, User
from database import get_session
from auth import get_current_user
from schemas import (
    QuestionnaireCreate,
    QuestionnaireResponse,
    QuestionnaireAnalysis,
    PlayerProfile,
    MatchingResult
)
from ai_models.questionnaire_analyzer import QuestionnaireAnalyzer

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
    title="问卷服务",
    description="问卷分析与玩家匹配服务",
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

# 初始化分析器
analyzer = QuestionnaireAnalyzer(
    model_path=config["ai_service"]["model_path"],
    batch_size=config["questionnaire"]["analysis_batch_size"]
)

@app.post("/questionnaires", response_model=QuestionnaireResponse)
async def create_questionnaire(
    questionnaire: QuestionnaireCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """创建新的问卷"""
    try:
        # 验证问题数量
        if len(questionnaire.questions) < config["questionnaire"]["min_questions"]:
            raise HTTPException(
                status_code=400,
                detail=f"问题数量不能少于{config['questionnaire']['min_questions']}个"
            )
        
        if len(questionnaire.questions) > config["questionnaire"]["max_questions"]:
            raise HTTPException(
                status_code=400,
                detail=f"问题数量不能超过{config['questionnaire']['max_questions']}个"
            )
        
        # 创建问卷
        db_questionnaire = Questionnaire(
            user_id=current_user.id,
            session_id=questionnaire.session_id,
            responses=questionnaire.responses,
            analysis_result={}  # 初始为空，等待分析
        )
        db.add(db_questionnaire)
        await db.commit()
        await db.refresh(db_questionnaire)
        
        # 异步分析问卷
        analysis_result = await analyzer.analyze_questionnaire(
            questionnaire.responses
        )
        
        # 更新分析结果
        db_questionnaire.analysis_result = analysis_result
        await db.commit()
        
        return db_questionnaire
    
    except Exception as e:
        logger.error(f"创建问卷失败: {str(e)}")
        raise HTTPException(status_code=500, detail="创建问卷失败")

@app.get("/questionnaires/{questionnaire_id}", response_model=QuestionnaireResponse)
async def get_questionnaire(
    questionnaire_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """获取问卷详情"""
    questionnaire = await db.get(Questionnaire, questionnaire_id)
    if not questionnaire:
        raise HTTPException(status_code=404, detail="问卷不存在")
    
    if questionnaire.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="没有权限访问此问卷")
    
    return questionnaire

@app.get("/questionnaires/{questionnaire_id}/analysis", response_model=QuestionnaireAnalysis)
async def get_analysis(
    questionnaire_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """获取问卷分析结果"""
    questionnaire = await db.get(Questionnaire, questionnaire_id)
    if not questionnaire:
        raise HTTPException(status_code=404, detail="问卷不存在")
    
    if not questionnaire.analysis_result:
        # 如果还没有分析结果，重新分析
        analysis_result = await analyzer.analyze_questionnaire(
            questionnaire.responses
        )
        questionnaire.analysis_result = analysis_result
        await db.commit()
    
    return QuestionnaireAnalysis(
        questionnaire_id=questionnaire_id,
        analysis_result=questionnaire.analysis_result,
        analyzed_at=datetime.utcnow()
    )

@app.post("/match", response_model=MatchingResult)
async def match_players(
    session_id: str,
    player_count: int,
    db: AsyncSession = Depends(get_session)
):
    """匹配玩家"""
    try:
        # 获取该会话的所有问卷
        questionnaires = await db.query(Questionnaire).filter(
            Questionnaire.session_id == session_id
        ).all()
        
        if len(questionnaires) < player_count:
            raise HTTPException(
                status_code=400,
                detail="玩家数量不足"
            )
        
        # 构建玩家画像
        player_profiles = []
        for q in questionnaires:
            profile = PlayerProfile(
                user_id=q.user_id,
                preferences=q.analysis_result.get("preferences", {}),
                personality_traits=q.analysis_result.get("personality_traits", {}),
                skill_levels=q.analysis_result.get("skill_levels", {})
            )
            player_profiles.append(profile)
        
        # 进行玩家匹配
        matches = await analyzer.match_players(
            profiles=player_profiles,
            required_count=player_count
        )
        
        return MatchingResult(
            session_id=session_id,
            matches=matches,
            matched_at=datetime.utcnow()
        )
    
    except Exception as e:
        logger.error(f"玩家匹配失败: {str(e)}")
        raise HTTPException(status_code=500, detail="玩家匹配失败")

@app.get("/statistics/{session_id}")
async def get_statistics(
    session_id: str,
    db: AsyncSession = Depends(get_session)
):
    """获取问卷统计信息"""
    try:
        questionnaires = await db.query(Questionnaire).filter(
            Questionnaire.session_id == session_id
        ).all()
        
        if not questionnaires:
            raise HTTPException(
                status_code=404,
                detail="未找到相关问卷"
            )
        
        # 统计分析
        statistics = await analyzer.generate_statistics(
            questionnaires=[q.responses for q in questionnaires]
        )
        
        return statistics
    
    except Exception as e:
        logger.error(f"获取统计信息失败: {str(e)}")
        raise HTTPException(status_code=500, detail="获取统计信息失败")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "questionnaire_service:app",
        host=config["server"]["host"],
        port=config["questionnaire"]["port"],
        reload=config["server"]["debug"]
    ) 