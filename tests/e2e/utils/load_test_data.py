import asyncio
import json
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_session
from models import (
    User, GameSession, GameParticipant, GameProgress,
    ScriptTemplate, TemplateVariant, Questionnaire,
    VoiceRoom, VoiceParticipant
)

async def load_test_data():
    """加载测试数据"""
    async with get_session() as session:
        # 创建测试用户
        test_users = [
            User(
                id="test-user-1",
                username="测试用户1",
                email="test1@example.com",
                password_hash="test_hash_1",
                created_at=datetime.utcnow()
            ),
            User(
                id="test-user-2",
                username="测试用户2",
                email="test2@example.com",
                password_hash="test_hash_2",
                created_at=datetime.utcnow()
            ),
            User(
                id="test-host-1",
                username="测试主持人1",
                email="host1@example.com",
                password_hash="host_hash_1",
                role="host",
                created_at=datetime.utcnow()
            )
        ]
        session.add_all(test_users)
        await session.commit()

        # 创建测试剧本模板
        test_template = ScriptTemplate(
            id="test-template-1",
            name="测试剧本1",
            type="murder",
            difficulty=3,
            min_players=6,
            max_players=8,
            estimated_duration=120,
            core_plot=json.dumps({
                "background": "这是一个测试剧本的背景故事",
                "timeline": ["事件1", "事件2", "事件3"]
            }),
            role_templates=json.dumps([
                {"name": "角色1", "description": "角色1的描述"},
                {"name": "角色2", "description": "角色2的描述"}
            ]),
            clue_graph=json.dumps({
                "nodes": ["线索1", "线索2"],
                "edges": [["线索1", "线索2"]]
            }),
            relationship_matrix=json.dumps([
                [1, 2],
                [2, 1]
            ]),
            created_at=datetime.utcnow()
        )
        session.add(test_template)
        await session.commit()

        # 创建测试游戏会话
        test_session = GameSession(
            id="test-session-1",
            name="测试房间1",
            host_id="test-host-1",
            game_type="murder",
            status="waiting",
            max_players=8,
            created_at=datetime.utcnow()
        )
        session.add(test_session)
        await session.commit()

        # 创建测试参与者
        test_participants = [
            GameParticipant(
                id="test-participant-1",
                session_id="test-session-1",
                user_id="test-user-1",
                role="player",
                status="ready",
                joined_at=datetime.utcnow()
            ),
            GameParticipant(
                id="test-participant-2",
                session_id="test-session-1",
                user_id="test-user-2",
                role="player",
                status="ready",
                joined_at=datetime.utcnow()
            )
        ]
        session.add_all(test_participants)
        await session.commit()

        # 创建测试游戏进度
        test_progress = GameProgress(
            id="test-progress-1",
            session_id="test-session-1",
            current_phase="preparation",
            revealed_clues=json.dumps([]),
            player_states=json.dumps({
                "test-user-1": {"ready": True},
                "test-user-2": {"ready": True}
            }),
            created_at=datetime.utcnow()
        )
        session.add(test_progress)
        await session.commit()

        # 创建测试语音房间
        test_voice_room = VoiceRoom(
            id="test-voice-1",
            session_id="test-session-1",
            status="active",
            settings=json.dumps({
                "max_participants": 8,
                "allow_spectators": True
            }),
            created_at=datetime.utcnow()
        )
        session.add(test_voice_room)
        await session.commit()

if __name__ == "__main__":
    asyncio.run(load_test_data()) 