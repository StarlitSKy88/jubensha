from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import logging
import yaml
import json
import asyncio
from datetime import datetime

from models import ScriptTemplate, TemplateVariant
from database import get_session
from schemas import (
    ScriptTemplateCreate,
    ScriptTemplateResponse,
    VariantCreate,
    VariantResponse,
    GenerationRequest,
    GenerationResponse
)
from ai_models.script_generator import ScriptGenerator
from ai_models.role_assigner import RoleAssigner

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
    title="剧本生成服务",
    description="智能剧本生成与变体生成服务",
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

# 初始化AI模型
script_generator = ScriptGenerator(
    model_path=config["ai_service"]["model_path"],
    max_tokens=config["ai_service"]["max_tokens"],
    temperature=config["ai_service"]["temperature"]
)

role_assigner = RoleAssigner(
    model_path=config["ai_service"]["model_path"]
)

# 剧本模板路由
@app.post("/templates", response_model=ScriptTemplateResponse)
async def create_template(
    template: ScriptTemplateCreate,
    db: AsyncSession = Depends(get_session)
):
    """创建新的剧本模板"""
    try:
        db_template = ScriptTemplate(
            name=template.name,
            type=template.type,
            difficulty=template.difficulty,
            min_players=template.min_players,
            max_players=template.max_players,
            estimated_duration=template.estimated_duration,
            core_plot=template.core_plot,
            role_templates=template.role_templates,
            clue_graph=template.clue_graph,
            relationship_matrix=template.relationship_matrix
        )
        db.add(db_template)
        await db.commit()
        await db.refresh(db_template)
        return db_template
    except Exception as e:
        logger.error(f"创建模板失败: {str(e)}")
        raise HTTPException(status_code=500, detail="创建模板失败")

@app.get("/templates", response_model=List[ScriptTemplateResponse])
async def list_templates(
    skip: int = 0,
    limit: int = 10,
    type: Optional[str] = None,
    min_players: Optional[int] = None,
    max_players: Optional[int] = None,
    difficulty: Optional[int] = None,
    db: AsyncSession = Depends(get_session)
):
    """获取剧本模板列表，支持筛选"""
    query = db.query(ScriptTemplate)
    
    if type:
        query = query.filter(ScriptTemplate.type == type)
    if min_players:
        query = query.filter(ScriptTemplate.min_players >= min_players)
    if max_players:
        query = query.filter(ScriptTemplate.max_players <= max_players)
    if difficulty:
        query = query.filter(ScriptTemplate.difficulty == difficulty)
    
    templates = await query.offset(skip).limit(limit).all()
    return templates

@app.get("/templates/{template_id}", response_model=ScriptTemplateResponse)
async def get_template(
    template_id: str,
    db: AsyncSession = Depends(get_session)
):
    """获取特定剧本模板"""
    template = await db.get(ScriptTemplate, template_id)
    if not template:
        raise HTTPException(status_code=404, detail="模板不存在")
    return template

# 变体生成路由
@app.post("/variants", response_model=VariantResponse)
async def create_variant(
    variant: VariantCreate,
    db: AsyncSession = Depends(get_session)
):
    """基于模板创建新的变体"""
    template = await db.get(ScriptTemplate, variant.template_id)
    if not template:
        raise HTTPException(status_code=404, detail="模板不存在")
    
    try:
        # 生成变体
        modified_roles = await script_generator.adapt_roles(
            template.role_templates,
            variant.player_count
        )
        modified_clues = await script_generator.adapt_clues(
            template.clue_graph,
            variant.player_count,
            variant.difficulty_level
        )
        modified_relations = await script_generator.adapt_relations(
            template.relationship_matrix,
            modified_roles
        )
        
        # 保存变体
        db_variant = TemplateVariant(
            template_id=variant.template_id,
            player_count=variant.player_count,
            difficulty_level=variant.difficulty_level,
            modified_roles=modified_roles,
            modified_clues=modified_clues,
            modified_relations=modified_relations
        )
        db.add(db_variant)
        await db.commit()
        await db.refresh(db_variant)
        return db_variant
    except Exception as e:
        logger.error(f"创建变体失败: {str(e)}")
        raise HTTPException(status_code=500, detail="创建变体失败")

@app.get("/variants/{variant_id}", response_model=VariantResponse)
async def get_variant(
    variant_id: str,
    db: AsyncSession = Depends(get_session)
):
    """获取特定变体"""
    variant = await db.get(TemplateVariant, variant_id)
    if not variant:
        raise HTTPException(status_code=404, detail="变体不存在")
    return variant

# 剧本生成路由
@app.post("/generate", response_model=GenerationResponse)
async def generate_script(
    request: GenerationRequest,
    db: AsyncSession = Depends(get_session)
):
    """生成完整剧本"""
    try:
        # 获取模板或变体
        if request.variant_id:
            variant = await db.get(TemplateVariant, request.variant_id)
            if not variant:
                raise HTTPException(status_code=404, detail="变体不存在")
            template = await db.get(ScriptTemplate, variant.template_id)
            roles = variant.modified_roles
            clues = variant.modified_clues
            relations = variant.modified_relations
        else:
            template = await db.get(ScriptTemplate, request.template_id)
            if not template:
                raise HTTPException(status_code=404, detail="模板不存在")
            roles = template.role_templates
            clues = template.clue_graph
            relations = template.relationship_matrix
        
        # 生成剧本内容
        script_content = await script_generator.generate_full_script(
            core_plot=template.core_plot,
            roles=roles,
            clues=clues,
            relations=relations,
            player_count=request.player_count,
            difficulty=request.difficulty or template.difficulty
        )
        
        # 分配角色
        role_assignments = await role_assigner.assign_roles(
            roles=roles,
            player_profiles=request.player_profiles
        )
        
        return {
            "script_content": script_content,
            "role_assignments": role_assignments,
            "generated_at": datetime.utcnow()
        }
    except Exception as e:
        logger.error(f"生成剧本失败: {str(e)}")
        raise HTTPException(status_code=500, detail="生成剧本失败")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "script_service:app",
        host=config["server"]["host"],
        port=config["script_engine"]["port"],
        reload=config["server"]["debug"]
    ) 