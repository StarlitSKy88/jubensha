from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ..database import get_db
from ..models import (
    QuestionTemplate,
    QuestionnaireTemplate,
    Questionnaire,
    QuestionResponse,
    PersonalityTrait
)
from ..schemas import (
    QuestionTemplateCreate,
    QuestionTemplateUpdate,
    QuestionTemplateResponse,
    QuestionnaireTemplateCreate,
    QuestionnaireTemplateUpdate,
    QuestionnaireTemplateResponse,
    QuestionnaireCreate,
    QuestionnaireUpdate,
    QuestionnaireResponse,
    PersonalityTraitCreate,
    PersonalityTraitUpdate,
    PersonalityTraitResponse
)
from ..services.questionnaire import QuestionnaireService

router = APIRouter(prefix="/questionnaire", tags=["questionnaire"])

@router.post("/templates/questions", response_model=QuestionTemplateResponse)
def create_question_template(
    template: QuestionTemplateCreate,
    db: Session = Depends(get_db)
):
    """创建新的问题模板"""
    return QuestionnaireService.create_question_template(db, template)

@router.get("/templates/questions", response_model=List[QuestionTemplateResponse])
def list_question_templates(
    category: Optional[str] = None,
    question_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """获取问题模板列表"""
    return QuestionnaireService.list_question_templates(
        db, category, question_type, skip, limit
    )

@router.post("/templates", response_model=QuestionnaireTemplateResponse)
def create_questionnaire_template(
    template: QuestionnaireTemplateCreate,
    db: Session = Depends(get_db)
):
    """创建新的问卷模板"""
    return QuestionnaireService.create_questionnaire_template(db, template)

@router.get("/templates", response_model=List[QuestionnaireTemplateResponse])
def list_questionnaire_templates(
    category: Optional[str] = None,
    is_active: bool = True,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """获取问卷模板列表"""
    return QuestionnaireService.list_questionnaire_templates(
        db, category, is_active, skip, limit
    )

@router.post("", response_model=QuestionnaireResponse)
def create_questionnaire(
    questionnaire: QuestionnaireCreate,
    db: Session = Depends(get_db)
):
    """创建新的问卷"""
    return QuestionnaireService.create_questionnaire(db, questionnaire)

@router.get("/{questionnaire_id}", response_model=QuestionnaireResponse)
def get_questionnaire(
    questionnaire_id: str,
    db: Session = Depends(get_db)
):
    """获取问卷详情"""
    questionnaire = QuestionnaireService.get_questionnaire(db, questionnaire_id)
    if not questionnaire:
        raise HTTPException(status_code=404, detail="问卷不存在")
    return questionnaire

@router.put("/{questionnaire_id}", response_model=QuestionnaireResponse)
def update_questionnaire(
    questionnaire_id: str,
    update_data: QuestionnaireUpdate,
    db: Session = Depends(get_db)
):
    """更新问卷"""
    questionnaire = QuestionnaireService.update_questionnaire(
        db, questionnaire_id, update_data
    )
    if not questionnaire:
        raise HTTPException(status_code=404, detail="问卷不存在")
    return questionnaire

@router.post("/traits", response_model=PersonalityTraitResponse)
def create_personality_trait(
    trait: PersonalityTraitCreate,
    db: Session = Depends(get_db)
):
    """创建新的性格特征"""
    return QuestionnaireService.create_personality_trait(db, trait)

@router.get("/traits", response_model=List[PersonalityTraitResponse])
def list_personality_traits(
    category: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """获取性格特征列表"""
    return QuestionnaireService.list_personality_traits(db, category, skip, limit)

@router.post("/{questionnaire_id}/analyze", response_model=QuestionnaireResponse)
def analyze_questionnaire(
    questionnaire_id: str,
    db: Session = Depends(get_db)
):
    """分析问卷结果"""
    result = QuestionnaireService.analyze_questionnaire(db, questionnaire_id)
    if not result:
        raise HTTPException(status_code=404, detail="问卷不存在")
    return result 