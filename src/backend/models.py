from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import uuid

Base = declarative_base()

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    avatar = Column(String)
    role = Column(String, default="user")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关联
    questionnaires = relationship("Questionnaire", back_populates="user")
    hosted_sessions = relationship("GameSession", back_populates="host")
    participated_sessions = relationship("GameParticipant", back_populates="user")

class GameSession(Base):
    __tablename__ = "game_sessions"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    host_id = Column(String, ForeignKey("users.id"), nullable=False)
    game_type = Column(String, nullable=False)
    status = Column(String, default="waiting")
    max_players = Column(Integer, nullable=False)
    script_content = Column(JSON)
    started_at = Column(DateTime)
    ended_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关联
    host = relationship("User", back_populates="hosted_sessions")
    participants = relationship("GameParticipant", back_populates="session")
    progress = relationship("GameProgress", back_populates="session")

class GameParticipant(Base):
    __tablename__ = "game_participants"

    id = Column(String, primary_key=True, default=generate_uuid)
    session_id = Column(String, ForeignKey("game_sessions.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    role = Column(String)
    status = Column(String, default="active")
    joined_at = Column(DateTime, default=datetime.utcnow)
    left_at = Column(DateTime)

    # 关联
    session = relationship("GameSession", back_populates="participants")
    user = relationship("User", back_populates="participated_sessions")

class GameProgress(Base):
    __tablename__ = "game_progress"

    id = Column(String, primary_key=True, default=generate_uuid)
    session_id = Column(String, ForeignKey("game_sessions.id"), nullable=False)
    current_phase = Column(String, nullable=False)
    revealed_clues = Column(JSON, default=list)
    player_states = Column(JSON, default=dict)
    host_notes = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

    # 关联
    session = relationship("GameSession", back_populates="progress")

class ScriptTemplate(Base):
    __tablename__ = "script_templates"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    difficulty = Column(Integer, nullable=False)
    min_players = Column(Integer, nullable=False)
    max_players = Column(Integer, nullable=False)
    estimated_duration = Column(Integer)  # 分钟
    core_plot = Column(JSON, nullable=False)
    role_templates = Column(JSON, nullable=False)
    clue_graph = Column(JSON, nullable=False)
    relationship_matrix = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关联
    variants = relationship("TemplateVariant", back_populates="template")

class TemplateVariant(Base):
    __tablename__ = "template_variants"

    id = Column(String, primary_key=True, default=generate_uuid)
    template_id = Column(String, ForeignKey("script_templates.id"), nullable=False)
    player_count = Column(Integer, nullable=False)
    difficulty_level = Column(Integer, nullable=False)
    modified_roles = Column(JSON, nullable=False)
    modified_clues = Column(JSON, nullable=False)
    modified_relations = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # 关联
    template = relationship("ScriptTemplate", back_populates="variants")

class Questionnaire(Base):
    __tablename__ = "questionnaires"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    session_id = Column(String, ForeignKey("game_sessions.id"))
    responses = relationship("QuestionResponse", back_populates="questionnaire")
    analysis_result = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关联
    user = relationship("User", back_populates="questionnaires")

class VoiceRoom(Base):
    __tablename__ = "voice_rooms"

    id = Column(String, primary_key=True, default=generate_uuid)
    session_id = Column(String, ForeignKey("game_sessions.id"), nullable=False)
    status = Column(String, default="active")
    settings = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class VoiceParticipant(Base):
    __tablename__ = "voice_participants"

    id = Column(String, primary_key=True, default=generate_uuid)
    room_id = Column(String, ForeignKey("voice_rooms.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    is_muted = Column(Boolean, default=False)
    joined_at = Column(DateTime, default=datetime.utcnow)
    left_at = Column(DateTime)

class Content(Base):
    __tablename__ = "contents"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    content_type = Column(String, nullable=False)  # text, image, video, audio
    source_url = Column(String)
    raw_content = Column(JSON, nullable=False)
    processed_content = Column(JSON)
    metadata = Column(JSON, default=dict)
    status = Column(String, default="pending")  # pending, processing, completed, failed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String, ForeignKey("users.id"), nullable=False)

    # 关联
    creator = relationship("User", backref="contents")
    tags = relationship("ContentTag", secondary="content_tags", back_populates="contents")
    collection_task = relationship("CollectionTask", secondary="task_contents", back_populates="contents")

class Tag(Base):
    __tablename__ = "tags"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False, unique=True)
    description = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关联
    contents = relationship("Content", secondary="content_tags", back_populates="tags")

class ContentTag(Base):
    __tablename__ = "content_tags"

    content_id = Column(String, ForeignKey("contents.id"), primary_key=True)
    tag_id = Column(String, ForeignKey("tags.id"), primary_key=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class ContentCollection(Base):
    __tablename__ = "content_collections"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    description = Column(String)
    created_by = Column(String, ForeignKey("users.id"), nullable=False)
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关联
    creator = relationship("User", backref="collections")
    contents = relationship("Content", secondary="collection_contents", backref="collections")

class CollectionContent(Base):
    __tablename__ = "collection_contents"

    collection_id = Column(String, ForeignKey("content_collections.id"), primary_key=True)
    content_id = Column(String, ForeignKey("contents.id"), primary_key=True)
    order = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

class ContentSource(Base):
    __tablename__ = "content_sources"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    source_type = Column(String, nullable=False)  # web, api, rss, file_system
    config = Column(JSON, nullable=False)  # 源配置信息
    schedule = Column(JSON)  # 采集调度配置
    is_active = Column(Boolean, default=True)
    last_run_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String, ForeignKey("users.id"), nullable=False)

    # 关联
    creator = relationship("User", backref="content_sources")
    tasks = relationship("CollectionTask", back_populates="source")

class CollectionTask(Base):
    __tablename__ = "collection_tasks"

    id = Column(String, primary_key=True, default=generate_uuid)
    source_id = Column(String, ForeignKey("content_sources.id"), nullable=False)
    status = Column(String, default="pending")  # pending, running, completed, failed
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime)
    result = Column(JSON)  # 采集结果统计
    error = Column(String)  # 错误信息
    created_at = Column(DateTime, default=datetime.utcnow)

    # 关联
    source = relationship("ContentSource", back_populates="tasks")
    contents = relationship("Content", secondary="task_contents", back_populates="collection_task")

class TaskContent(Base):
    __tablename__ = "task_contents"

    task_id = Column(String, ForeignKey("collection_tasks.id"), primary_key=True)
    content_id = Column(String, ForeignKey("contents.id"), primary_key=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class QuestionTemplate(Base):
    __tablename__ = "question_templates"

    id = Column(String, primary_key=True, default=generate_uuid)
    content = Column(String, nullable=False)
    question_type = Column(String, nullable=False)  # multiple_choice, scale, text
    category = Column(String, nullable=False)  # personality, role_preference, interaction_style
    options = Column(JSON)  # 选项列表（用于选择题）
    weight = Column(Float, default=1.0)  # 问题权重
    traits = Column(JSON)  # 与该问题相关的特征标签
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关联
    questionnaire_templates = relationship(
        "QuestionnaireTemplate",
        secondary="template_questions",
        back_populates="questions"
    )

class QuestionnaireTemplate(Base):
    __tablename__ = "questionnaire_templates"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    description = Column(String)
    category = Column(String, nullable=False)  # personality, role_matching, feedback
    is_active = Column(Boolean, default=True)
    min_questions = Column(Integer, default=1)
    max_questions = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关联
    questions = relationship(
        "QuestionTemplate",
        secondary="template_questions",
        back_populates="questionnaire_templates"
    )

class TemplateQuestion(Base):
    __tablename__ = "template_questions"

    template_id = Column(String, ForeignKey("questionnaire_templates.id"), primary_key=True)
    question_id = Column(String, ForeignKey("question_templates.id"), primary_key=True)
    order = Column(Integer)
    is_required = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class QuestionResponse(Base):
    __tablename__ = "question_responses"

    id = Column(String, primary_key=True, default=generate_uuid)
    questionnaire_id = Column(String, ForeignKey("questionnaires.id"), nullable=False)
    question_id = Column(String, ForeignKey("question_templates.id"), nullable=False)
    response_value = Column(JSON, nullable=False)  # 回答内容
    confidence_score = Column(Float)  # AI分析的置信度
    created_at = Column(DateTime, default=datetime.utcnow)

    # 关联
    questionnaire = relationship("Questionnaire", back_populates="responses")
    question = relationship("QuestionTemplate")

class PersonalityTrait(Base):
    __tablename__ = "personality_traits"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False, unique=True)
    description = Column(String)
    category = Column(String, nullable=False)  # big_five, mbti, custom
    scale_min = Column(Float, default=0)
    scale_max = Column(Float, default=100)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow) 