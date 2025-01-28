from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime

# 认证模式
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# 用户模式
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    role: str
    created_at: datetime

    class Config:
        orm_mode = True

# 房间模式
class RoomCreate(BaseModel):
    name: str
    game_type: str
    max_players: int

class RoomResponse(RoomCreate):
    id: str
    host_id: str
    status: str
    player_count: int
    created_at: datetime

    class Config:
        orm_mode = True

# 游戏进度模式
class GameProgressUpdate(BaseModel):
    phase: str
    revealed_clues: List[Dict]
    player_states: Dict[str, Dict]
    notes: Optional[Dict] = None

class GameProgressResponse(GameProgressUpdate):
    id: str
    session_id: str
    created_at: datetime

    class Config:
        orm_mode = True

# 问卷模式
class QuestionnaireCreate(BaseModel):
    session_id: Optional[str]
    responses: List[Dict]

class QuestionnaireResponse(QuestionnaireCreate):
    id: str
    user_id: str
    analysis_result: Optional[Dict]
    created_at: datetime

    class Config:
        orm_mode = True

class QuestionnaireAnalysis(BaseModel):
    questionnaire_id: str
    analysis_result: Dict
    analyzed_at: datetime

# 语音房间模式
class RoomInfo(BaseModel):
    room_id: str
    participant_count: int
    participants: List[Dict]

class ParticipantInfo(BaseModel):
    user_id: str
    joined_at: datetime
    is_muted: bool

class WebRTCOffer(BaseModel):
    sdp: str
    type: str

class WebRTCAnswer(BaseModel):
    sdp: str
    type: str

class AudioSettings(BaseModel):
    volume: float
    noise_suppression: bool
    echo_cancellation: bool

# 主持人模式
class ClueInfo(BaseModel):
    id: str
    content: str
    is_revealed: bool
    target_player: Optional[str]

class GamePhase(BaseModel):
    id: str
    name: str
    description: str
    duration: int
    is_active: bool

class HostAction(BaseModel):
    type: str
    clue: Optional[ClueInfo]
    phase: Optional[GamePhase]
    hint: Optional[str]

class SuggestionRequest(BaseModel):
    context: Dict
    type: str

class SuggestionResponse(BaseModel):
    suggestions: List[Dict]
    analysis: Dict
    generated_at: datetime

# 剧本模式
class ScriptTemplateCreate(BaseModel):
    name: str
    type: str
    difficulty: int
    min_players: int
    max_players: int
    estimated_duration: Optional[int]
    core_plot: Dict
    role_templates: List[Dict]
    clue_graph: List[Dict]
    relationship_matrix: Dict[str, List[str]]

class ScriptTemplateResponse(ScriptTemplateCreate):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class VariantCreate(BaseModel):
    template_id: str
    player_count: int
    difficulty_level: int

class VariantResponse(VariantCreate):
    id: str
    modified_roles: List[Dict]
    modified_clues: List[Dict]
    modified_relations: Dict[str, List[str]]
    created_at: datetime

    class Config:
        orm_mode = True

class GenerationRequest(BaseModel):
    template_id: Optional[str]
    variant_id: Optional[str]
    player_count: int
    difficulty: Optional[int]
    player_profiles: List[Dict]

class GenerationResponse(BaseModel):
    script_content: Dict
    role_assignments: Dict[str, str]
    generated_at: datetime

# 匹配模式
class PlayerProfile(BaseModel):
    user_id: str
    preferences: Dict
    personality_traits: Dict
    skill_levels: Dict

class MatchingResult(BaseModel):
    session_id: str
    matches: List[Dict]
    matched_at: datetime

# 问卷系统相关的schema
class QuestionTemplateBase(BaseModel):
    content: str
    question_type: str  # multiple_choice, scale, text
    category: str  # personality, role_preference, interaction_style
    options: Optional[List[Dict]] = None
    weight: float = 1.0
    traits: Dict[str, float]

class QuestionTemplateCreate(QuestionTemplateBase):
    pass

class QuestionTemplateUpdate(QuestionTemplateBase):
    content: Optional[str] = None
    question_type: Optional[str] = None
    category: Optional[str] = None
    options: Optional[List[Dict]] = None
    weight: Optional[float] = None
    traits: Optional[Dict[str, float]] = None

class QuestionTemplateResponse(QuestionTemplateBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class QuestionnaireTemplateBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: str  # personality, role_matching, feedback
    min_questions: int = 1
    max_questions: Optional[int] = None

class QuestionnaireTemplateCreate(QuestionnaireTemplateBase):
    question_ids: List[str]

class QuestionnaireTemplateUpdate(QuestionnaireTemplateBase):
    name: Optional[str] = None
    category: Optional[str] = None
    min_questions: Optional[int] = None
    is_active: Optional[bool] = None

class QuestionnaireTemplateResponse(QuestionnaireTemplateBase):
    id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    questions: List[QuestionTemplateResponse]

    class Config:
        orm_mode = True

class QuestionResponseBase(BaseModel):
    question_id: str
    response_value: Any

class QuestionResponseCreate(QuestionResponseBase):
    pass

class QuestionResponseUpdate(QuestionResponseBase):
    response_value: Optional[Any] = None

class QuestionResponseResponse(QuestionResponseBase):
    id: str
    questionnaire_id: str
    confidence_score: Optional[float] = None
    created_at: datetime

    class Config:
        orm_mode = True

class QuestionnaireBase(BaseModel):
    user_id: str
    session_id: Optional[str] = None

class QuestionnaireCreate(QuestionnaireBase):
    responses: List[QuestionResponseCreate]

class QuestionnaireUpdate(QuestionnaireBase):
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    analysis_result: Optional[Dict] = None

class QuestionnaireResponse(QuestionnaireBase):
    id: str
    responses: List[QuestionResponseResponse]
    analysis_result: Optional[Dict] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class PersonalityTraitBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: str  # big_five, mbti, custom
    scale_min: float = 0
    scale_max: float = 100

class PersonalityTraitCreate(PersonalityTraitBase):
    pass

class PersonalityTraitUpdate(PersonalityTraitBase):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    scale_min: Optional[float] = None
    scale_max: Optional[float] = None

class PersonalityTraitResponse(PersonalityTraitBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True 