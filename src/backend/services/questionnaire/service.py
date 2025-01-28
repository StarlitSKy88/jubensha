from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ...models import (
    QuestionTemplate,
    QuestionnaireTemplate,
    Questionnaire,
    QuestionResponse,
    PersonalityTrait,
    TemplateQuestion
)
from ...schemas import (
    QuestionTemplateCreate,
    QuestionTemplateUpdate,
    QuestionnaireTemplateCreate,
    QuestionnaireTemplateUpdate,
    QuestionnaireCreate,
    QuestionnaireUpdate,
    PersonalityTraitCreate,
    PersonalityTraitUpdate
)
from .analyzer import QuestionnaireAnalyzer

class QuestionnaireService:
    @staticmethod
    def create_question_template(db: Session, template: QuestionTemplateCreate):
        """创建问题模板"""
        db_template = QuestionTemplate(**template.dict())
        db.add(db_template)
        db.commit()
        db.refresh(db_template)
        return db_template

    @staticmethod
    def list_question_templates(
        db: Session,
        category: Optional[str] = None,
        question_type: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[QuestionTemplate]:
        """获取问题模板列表"""
        query = db.query(QuestionTemplate)
        if category:
            query = query.filter(QuestionTemplate.category == category)
        if question_type:
            query = query.filter(QuestionTemplate.question_type == question_type)
        return query.offset(skip).limit(limit).all()

    @staticmethod
    def create_questionnaire_template(
        db: Session,
        template: QuestionnaireTemplateCreate
    ):
        """创建问卷模板"""
        # 创建问卷模板
        db_template = QuestionnaireTemplate(
            name=template.name,
            description=template.description,
            category=template.category,
            min_questions=template.min_questions,
            max_questions=template.max_questions
        )
        db.add(db_template)
        db.commit()
        db.refresh(db_template)

        # 添加问题关联
        for i, question_id in enumerate(template.question_ids):
            template_question = TemplateQuestion(
                template_id=db_template.id,
                question_id=question_id,
                order=i + 1,
                is_required=True
            )
            db.add(template_question)
        
        db.commit()
        return db_template

    @staticmethod
    def list_questionnaire_templates(
        db: Session,
        category: Optional[str] = None,
        is_active: bool = True,
        skip: int = 0,
        limit: int = 100
    ) -> List[QuestionnaireTemplate]:
        """获取问卷模板列表"""
        query = db.query(QuestionnaireTemplate)
        if category:
            query = query.filter(QuestionnaireTemplate.category == category)
        query = query.filter(QuestionnaireTemplate.is_active == is_active)
        return query.offset(skip).limit(limit).all()

    @staticmethod
    def create_questionnaire(db: Session, questionnaire: QuestionnaireCreate):
        """创建问卷"""
        # 创建问卷
        db_questionnaire = Questionnaire(
            user_id=questionnaire.user_id,
            session_id=questionnaire.session_id
        )
        db.add(db_questionnaire)
        db.commit()
        db.refresh(db_questionnaire)

        # 添加问题回答
        for response in questionnaire.responses:
            question_response = QuestionResponse(
                questionnaire_id=db_questionnaire.id,
                question_id=response.question_id,
                response_value=response.response_value
            )
            db.add(question_response)
        
        db.commit()
        return db_questionnaire

    @staticmethod
    def get_questionnaire(db: Session, questionnaire_id: str):
        """获取问卷详情"""
        return db.query(Questionnaire).filter(
            Questionnaire.id == questionnaire_id
        ).first()

    @staticmethod
    def update_questionnaire(
        db: Session,
        questionnaire_id: str,
        update_data: QuestionnaireUpdate
    ):
        """更新问卷"""
        questionnaire = db.query(Questionnaire).filter(
            Questionnaire.id == questionnaire_id
        ).first()
        
        if not questionnaire:
            return None

        # 更新问卷属性
        for key, value in update_data.dict(exclude_unset=True).items():
            setattr(questionnaire, key, value)
        
        db.commit()
        db.refresh(questionnaire)
        return questionnaire

    @staticmethod
    def create_personality_trait(db: Session, trait: PersonalityTraitCreate):
        """创建性格特征"""
        db_trait = PersonalityTrait(**trait.dict())
        db.add(db_trait)
        db.commit()
        db.refresh(db_trait)
        return db_trait

    @staticmethod
    def list_personality_traits(
        db: Session,
        category: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[PersonalityTrait]:
        """获取性格特征列表"""
        query = db.query(PersonalityTrait)
        if category:
            query = query.filter(PersonalityTrait.category == category)
        return query.offset(skip).limit(limit).all()

    @staticmethod
    def analyze_questionnaire(db: Session, questionnaire_id: str):
        """分析问卷结果"""
        questionnaire = db.query(Questionnaire).filter(
            Questionnaire.id == questionnaire_id
        ).first()
        
        if not questionnaire:
            return None

        # 使用分析器进行分析
        analyzer = QuestionnaireAnalyzer()
        analysis_result = analyzer.analyze(questionnaire)
        
        # 更新问卷分析结果
        questionnaire.analysis_result = analysis_result
        db.commit()
        db.refresh(questionnaire)
        
        return questionnaire 