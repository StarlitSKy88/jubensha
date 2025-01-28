import pytest
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession

from models import (
    User,
    GameSession,
    GameParticipant,
    GameProgress,
    ScriptTemplate,
    TemplateVariant,
    Questionnaire,
    VoiceRoom,
    VoiceParticipant
)

@pytest.mark.asyncio
async def test_user_model(db: AsyncSession):
    """测试用户模型"""
    user = User(
        username="testuser",
        email="test@example.com",
        password_hash="hashed_password"
    )
    db.add(user)
    await db.commit()
    
    assert user.id is not None
    assert user.created_at is not None
    assert user.updated_at is not None
    assert user.role == "user"

@pytest.mark.asyncio
async def test_game_session_model(db: AsyncSession, test_user: User):
    """测试游戏会话模型"""
    session = GameSession(
        name="Test Game",
        host_id=test_user.id,
        game_type="murder_mystery",
        max_players=8
    )
    db.add(session)
    await db.commit()
    
    assert session.id is not None
    assert session.status == "waiting"
    assert session.created_at is not None
    assert session.host.id == test_user.id

@pytest.mark.asyncio
async def test_game_participant_model(db: AsyncSession, test_user: User):
    """测试游戏参与者模型"""
    session = GameSession(
        name="Test Game",
        host_id=test_user.id,
        game_type="murder_mystery",
        max_players=8
    )
    db.add(session)
    await db.commit()
    
    participant = GameParticipant(
        session_id=session.id,
        user_id=test_user.id,
        role="detective"
    )
    db.add(participant)
    await db.commit()
    
    assert participant.id is not None
    assert participant.status == "active"
    assert participant.joined_at is not None
    assert participant.session.id == session.id
    assert participant.user.id == test_user.id

@pytest.mark.asyncio
async def test_game_progress_model(db: AsyncSession, test_user: User):
    """测试游戏进度模型"""
    session = GameSession(
        name="Test Game",
        host_id=test_user.id,
        game_type="murder_mystery",
        max_players=8
    )
    db.add(session)
    await db.commit()
    
    progress = GameProgress(
        session_id=session.id,
        current_phase="investigation",
        revealed_clues=[],
        player_states={},
        host_notes={}
    )
    db.add(progress)
    await db.commit()
    
    assert progress.id is not None
    assert progress.created_at is not None
    assert progress.session.id == session.id

@pytest.mark.asyncio
async def test_script_template_model(db: AsyncSession):
    """测试剧本模板模型"""
    template = ScriptTemplate(
        name="Murder at Mansion",
        type="murder_mystery",
        difficulty=3,
        min_players=6,
        max_players=10,
        estimated_duration=120,
        core_plot={"summary": "A classic murder mystery"},
        role_templates=[{"name": "Detective"}],
        clue_graph=[{"id": 1, "content": "Footprints"}],
        relationship_matrix={"detective": ["suspect"]}
    )
    db.add(template)
    await db.commit()
    
    assert template.id is not None
    assert template.created_at is not None
    assert template.updated_at is not None

@pytest.mark.asyncio
async def test_template_variant_model(db: AsyncSession):
    """测试模板变体模型"""
    template = ScriptTemplate(
        name="Murder at Mansion",
        type="murder_mystery",
        difficulty=3,
        min_players=6,
        max_players=10,
        core_plot={"summary": "A classic murder mystery"},
        role_templates=[{"name": "Detective"}],
        clue_graph=[{"id": 1, "content": "Footprints"}],
        relationship_matrix={"detective": ["suspect"]}
    )
    db.add(template)
    await db.commit()
    
    variant = TemplateVariant(
        template_id=template.id,
        player_count=8,
        difficulty_level=4,
        modified_roles=[{"name": "Master Detective"}],
        modified_clues=[{"id": 1, "content": "Clear Footprints"}],
        modified_relations={"master_detective": ["prime_suspect"]}
    )
    db.add(variant)
    await db.commit()
    
    assert variant.id is not None
    assert variant.created_at is not None
    assert variant.template.id == template.id

@pytest.mark.asyncio
async def test_questionnaire_model(db: AsyncSession, test_user: User):
    """测试问卷模型"""
    questionnaire = Questionnaire(
        user_id=test_user.id,
        responses=[{"question_id": 1, "answer": "Yes"}],
        analysis_result={"personality": "Detective"}
    )
    db.add(questionnaire)
    await db.commit()
    
    assert questionnaire.id is not None
    assert questionnaire.created_at is not None
    assert questionnaire.updated_at is not None
    assert questionnaire.user.id == test_user.id

@pytest.mark.asyncio
async def test_voice_room_model(db: AsyncSession, test_user: User):
    """测试语音房间模型"""
    session = GameSession(
        name="Test Game",
        host_id=test_user.id,
        game_type="murder_mystery",
        max_players=8
    )
    db.add(session)
    await db.commit()
    
    room = VoiceRoom(
        session_id=session.id,
        settings={"quality": "high"}
    )
    db.add(room)
    await db.commit()
    
    assert room.id is not None
    assert room.status == "active"
    assert room.created_at is not None
    assert room.updated_at is not None

@pytest.mark.asyncio
async def test_voice_participant_model(db: AsyncSession, test_user: User):
    """测试语音参与者模型"""
    session = GameSession(
        name="Test Game",
        host_id=test_user.id,
        game_type="murder_mystery",
        max_players=8
    )
    db.add(session)
    await db.commit()
    
    room = VoiceRoom(
        session_id=session.id,
        settings={"quality": "high"}
    )
    db.add(room)
    await db.commit()
    
    participant = VoiceParticipant(
        room_id=room.id,
        user_id=test_user.id
    )
    db.add(participant)
    await db.commit()
    
    assert participant.id is not None
    assert participant.is_muted is False
    assert participant.joined_at is not None
    assert participant.left_at is None 