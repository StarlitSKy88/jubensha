import pytest
from datetime import datetime, timedelta
from unittest.mock import Mock, patch
from src.backend.services.questionnaire.service import (
    QuestionnaireService,
    Questionnaire,
    QuestionnaireResponse,
    Question
)

@pytest.fixture
def mock_redis():
    with patch('redis.from_url') as mock:
        client = Mock()
        mock.return_value = client
        yield client

@pytest.fixture
def service(mock_redis):
    return QuestionnaireService(redis_url="redis://dummy:6379/0")

def test_create_questionnaire(service):
    """测试创建问卷"""
    questionnaire = service.create_questionnaire(
        title="测试问卷",
        description="这是一个测试问卷",
        question_count=5
    )
    
    assert questionnaire.title == "测试问卷"
    assert questionnaire.description == "这是一个测试问卷"
    assert len(questionnaire.questions) == 5
    assert questionnaire.is_active
    assert questionnaire.expires_at is None

def test_create_questionnaire_with_expiry(service):
    """测试创建带过期时间的问卷"""
    questionnaire = service.create_questionnaire(
        title="测试问卷",
        description="这是一个测试问卷",
        question_count=5,
        expires_in_hours=24
    )
    
    assert questionnaire.expires_at is not None
    assert questionnaire.expires_at > questionnaire.created_at
    assert questionnaire.expires_at <= questionnaire.created_at + timedelta(hours=24)

def test_get_questionnaire(service, mock_redis):
    """测试获取问卷"""
    # 创建一个问卷
    questionnaire = service.create_questionnaire(
        title="测试问卷",
        description="这是一个测试问卷"
    )
    
    # 模拟Redis返回缓存的问卷数据
    mock_redis.get.return_value = questionnaire.json()
    
    # 获取问卷
    retrieved = service.get_questionnaire(questionnaire.id)
    
    assert retrieved is not None
    assert retrieved.id == questionnaire.id
    assert retrieved.title == questionnaire.title
    assert len(retrieved.questions) == len(questionnaire.questions)

def test_submit_response(service, mock_redis):
    """测试提交问卷回答"""
    # 创建问卷
    questionnaire = service.create_questionnaire(
        title="测试问卷",
        description="这是一个测试问卷",
        question_count=3
    )
    
    # 模拟Redis返回缓存的问卷数据
    mock_redis.get.return_value = questionnaire.json()
    
    # 提交回答
    start_time = datetime.now()
    end_time = start_time + timedelta(minutes=5)
    
    response = service.submit_response(
        questionnaire_id=questionnaire.id,
        user_id="test_user",
        answers={
            questionnaire.questions[0].id: "这是第一个问题的回答",
            questionnaire.questions[1].id: "这是第二个问题的回答",
            questionnaire.questions[2].id: "这是第三个问题的回答"
        },
        start_time=start_time,
        end_time=end_time
    )
    
    assert response.questionnaire_id == questionnaire.id
    assert response.user_id == "test_user"
    assert len(response.answers) == 3
    assert response.start_time == start_time
    assert response.end_time == end_time

def test_batch_generate_questions(service):
    """测试批量生成问题"""
    questions = service.batch_generate_questions(
        count=50,
        difficulty_range=(3, 4)
    )
    
    assert len(questions) == 50
    assert all(isinstance(q, Question) for q in questions)
    assert all(3 <= q.difficulty <= 4 for q in questions)

def test_question_caching(service, mock_redis):
    """测试问题缓存"""
    # 创建问卷
    questionnaire = service.create_questionnaire(
        title="测试问卷",
        description="这是一个测试问卷",
        question_count=1
    )
    
    question = questionnaire.questions[0]
    
    # 验证问题被缓存
    cache_key = service._cache_key("question", question.id)
    mock_redis.setex.assert_any_call(
        cache_key,
        service.question_cache_ttl,
        question.json()
    )

def test_questionnaire_caching(service, mock_redis):
    """测试问卷缓存"""
    questionnaire = service.create_questionnaire(
        title="测试问卷",
        description="这是一个测试问卷"
    )
    
    # 验证问卷被缓存
    cache_key = service._cache_key("questionnaire", questionnaire.id)
    mock_redis.setex.assert_any_call(
        cache_key,
        service.questionnaire_cache_ttl,
        questionnaire.json()
    )

def test_cache_key_generation(service):
    """测试缓存键生成"""
    key = service._cache_key("test", "123")
    assert key == "test:123"
    
    key = service._cache_key("question", "q_456")
    assert key == "question:q_456" 