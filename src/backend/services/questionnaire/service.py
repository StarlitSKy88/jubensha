from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from datetime import datetime
from pydantic import BaseModel
from .question_generator import QuestionGenerator, Question, QuestionFeedback
import redis
import json

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

class QuestionnaireResponse(BaseModel):
    """问卷回答模型"""
    questionnaire_id: str
    user_id: str
    answers: Dict[str, str]  # question_id -> answer
    start_time: datetime
    end_time: datetime
    
class Questionnaire(BaseModel):
    """问卷模型"""
    id: str
    title: str
    description: str
    questions: List[Question]
    created_at: datetime
    expires_at: Optional[datetime] = None
    is_active: bool = True

class QuestionnaireService:
    """问卷服务"""
    def __init__(self, redis_url: str = "redis://localhost:6379/0"):
        self.generator = QuestionGenerator()
        self.redis_client = redis.from_url(redis_url)
        self.question_cache_ttl = 3600  # 1小时
        self.questionnaire_cache_ttl = 86400  # 24小时
    
    def _cache_key(self, prefix: str, id: str) -> str:
        """生成缓存键"""
        return f"{prefix}:{id}"
    
    def _cache_question(self, question: Question):
        """缓存问题"""
        key = self._cache_key("question", question.id)
        self.redis_client.setex(
            key,
            self.question_cache_ttl,
            question.json()
        )
    
    def _get_cached_question(self, question_id: str) -> Optional[Question]:
        """获取缓存的问题"""
        key = self._cache_key("question", question_id)
        data = self.redis_client.get(key)
        if data:
            return Question.parse_raw(data)
        return None
    
    def _cache_questionnaire(self, questionnaire: Questionnaire):
        """缓存问卷"""
        key = self._cache_key("questionnaire", questionnaire.id)
        self.redis_client.setex(
            key,
            self.questionnaire_cache_ttl,
            questionnaire.json()
        )
    
    def _get_cached_questionnaire(self, questionnaire_id: str) -> Optional[Questionnaire]:
        """获取缓存的问卷"""
        key = self._cache_key("questionnaire", questionnaire_id)
        data = self.redis_client.get(key)
        if data:
            return Questionnaire.parse_raw(data)
        return None
    
    def create_questionnaire(
        self,
        title: str,
        description: str,
        question_count: int = 10,
        expires_in_hours: Optional[int] = None
    ) -> Questionnaire:
        """创建问卷"""
        # 生成问题
        questions = self.generator.generate_question_set(count=question_count)
        
        # 缓存问题
        for question in questions:
            self._cache_question(question)
        
        # 创建问卷
        now = datetime.now()
        questionnaire = Questionnaire(
            id=f"q_{int(now.timestamp())}",
            title=title,
            description=description,
            questions=questions,
            created_at=now,
            expires_at=now + datetime.timedelta(hours=expires_in_hours) if expires_in_hours else None
        )
        
        # 缓存问卷
        self._cache_questionnaire(questionnaire)
        
        return questionnaire
    
    def get_questionnaire(self, questionnaire_id: str) -> Optional[Questionnaire]:
        """获取问卷"""
        return self._get_cached_questionnaire(questionnaire_id)
    
    def submit_response(
        self,
        questionnaire_id: str,
        user_id: str,
        answers: Dict[str, str],
        start_time: datetime,
        end_time: datetime
    ) -> QuestionnaireResponse:
        """提交问卷回答"""
        # 创建回答记录
        response = QuestionnaireResponse(
            questionnaire_id=questionnaire_id,
            user_id=user_id,
            answers=answers,
            start_time=start_time,
            end_time=end_time
        )
        
        # 处理问题反馈
        questionnaire = self.get_questionnaire(questionnaire_id)
        if questionnaire:
            for question in questionnaire.questions:
                if question.id in answers:
                    # 计算问题难度评分和参与度评分
                    time_spent = int((end_time - start_time).total_seconds() / len(answers))
                    
                    feedback = QuestionFeedback(
                        question_id=question.id,
                        user_id=user_id,
                        difficulty_rating=4 if time_spent > 30 else 3,  # 简单的难度评估
                        engagement_rating=5 if len(answers[question.id]) > 50 else 3,  # 简单的参与度评估
                        time_spent=time_spent,
                        timestamp=end_time
                    )
                    
                    # 更新问题生成器的反馈
                    self.generator.add_feedback(feedback)
        
        return response
    
    def batch_generate_questions(
        self,
        count: int = 100,
        difficulty_range: Optional[tuple[int, int]] = None
    ) -> List[Question]:
        """批量生成问题"""
        questions = []
        for _ in range(count):
            if difficulty_range:
                min_diff, max_diff = difficulty_range
                target_difficulty = random.randint(min_diff, max_diff)
            else:
                target_difficulty = None
                
            category = self.generator.adjuster.get_category()
            
            if category == "core":
                question = self.generator.generate_core_question(target_difficulty)
            elif category == "role":
                question = self.generator.generate_role_question(target_difficulty)
            else:
                question = self.generator.generate_interaction_question(target_difficulty)
                
            questions.append(question)
            self._cache_question(question)
            
        return questions

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