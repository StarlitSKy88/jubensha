import pytest
from datetime import datetime
from src.backend.services.questionnaire.question_generator import (
    QuestionGenerator,
    Question,
    QuestionFeedback,
    DifficultyAdjuster
)

@pytest.fixture
def generator():
    return QuestionGenerator()

@pytest.fixture
def adjuster():
    return DifficultyAdjuster()

def test_question_model():
    """测试Question模型的基本功能"""
    question = Question(
        id="test_001",
        content="测试问题",
        type="single_choice",
        options=["选项1", "选项2"],
        category="core",
        tags=["test"],
        difficulty=3
    )
    
    assert question.id == "test_001"
    assert question.content == "测试问题"
    assert question.type == "single_choice"
    assert len(question.options) == 2
    assert question.category == "core"
    assert "test" in question.tags
    assert question.difficulty == 3

def test_question_feedback_model():
    """测试问题反馈模型"""
    feedback = QuestionFeedback(
        question_id="test_001",
        user_id="user_001",
        difficulty_rating=4,
        engagement_rating=5,
        time_spent=60,
        timestamp=datetime.now()
    )
    
    assert feedback.question_id == "test_001"
    assert feedback.user_id == "user_001"
    assert 1 <= feedback.difficulty_rating <= 5
    assert 1 <= feedback.engagement_rating <= 5
    assert feedback.time_spent > 0

def test_generate_core_question(generator):
    """测试核心问题生成"""
    question = generator.generate_core_question(target_difficulty=3)
    
    assert question.id.startswith("core_")
    assert question.type == "single_choice"
    assert question.category == "core"
    assert len(question.options) == 4
    assert question.difficulty == 3
    assert len(question.tags) > 0

def test_generate_role_question(generator):
    """测试角色问题生成"""
    question = generator.generate_role_question(target_difficulty=4)
    
    assert question.id.startswith("role_")
    assert question.type == "multiple_choice"
    assert question.category == "role"
    assert len(question.options) == 5
    assert question.difficulty == 4
    assert len(question.tags) > 0

def test_generate_interaction_question(generator):
    """测试互动问题生成"""
    question = generator.generate_interaction_question(target_difficulty=5)
    
    assert question.id.startswith("interaction_")
    assert question.type == "text"
    assert question.category == "interaction"
    assert question.options is None
    assert question.difficulty == 5
    assert len(question.tags) > 0
    assert "interaction" in question.tags

def test_difficulty_adjuster_initialization(adjuster):
    """测试难度调整器初始化"""
    assert len(adjuster.feedback_history) == 0
    assert sum(adjuster.difficulty_weights.values()) == pytest.approx(1.0)
    assert sum(adjuster.category_weights.values()) == pytest.approx(1.0)

def test_difficulty_adjuster_feedback(adjuster):
    """测试难度调整器反馈处理"""
    # 添加一些反馈
    for i in range(5):
        feedback = QuestionFeedback(
            question_id=f"test_{i}",
            user_id="user_001",
            difficulty_rating=4,  # 大多数反馈表示难度较高
            engagement_rating=5,
            time_spent=60,
            timestamp=datetime.now()
        )
        adjuster.add_feedback(feedback)
    
    # 检查权重是否更新
    assert len(adjuster.feedback_history) == 5
    assert adjuster.difficulty_weights[4] > 0.2  # 难度4的权重应该增加

def test_generate_question_set_with_feedback(generator):
    """测试带反馈的问题集生成"""
    # 添加一些反馈，表明用户倾向于较难的问题
    for _ in range(5):
        feedback = QuestionFeedback(
            question_id=f"test_{_}",
            user_id="user_001",
            difficulty_rating=4,
            engagement_rating=5,
            time_spent=60,
            timestamp=datetime.now()
        )
        generator.add_feedback(feedback)
    
    # 生成新的问题集
    questions = generator.generate_question_set(count=20)
    
    # 检查问题难度分布
    difficulties = [q.difficulty for q in questions]
    avg_difficulty = sum(difficulties) / len(difficulties)
    assert avg_difficulty > 3.0  # 平均难度应该偏高

def test_question_templates(generator):
    """测试问题模板系统"""
    # 测试核心问题模板
    assert len(generator.core_templates) > 0
    assert all("{" in t and "}" in t for t in generator.core_templates)
    
    # 测试角色问题模板
    assert len(generator.role_templates) > 0
    assert all("{role_type}" in t for t in generator.role_templates)
    
    # 测试互动问题模板
    assert len(generator.interaction_templates) > 0
    assert all("{" in t and "}" in t for t in generator.interaction_templates)
    
    # 测试情境列表
    assert len(generator.situations) > 0
    assert all(isinstance(s, str) for s in generator.situations)
    
    # 测试角色类型列表
    assert len(generator.role_types) > 0
    assert all(isinstance(r, str) for r in generator.role_types)
    
    # 测试动作列表
    assert len(generator.actions) > 0
    assert all(isinstance(a, str) for a in generator.actions)
    
    # 测试信息类型列表
    assert len(generator.info_types) > 0
    assert all(isinstance(i, str) for i in generator.info_types)
    
    # 测试冲突类型列表
    assert len(generator.conflicts) > 0
    assert all(isinstance(c, str) for c in generator.conflicts) 