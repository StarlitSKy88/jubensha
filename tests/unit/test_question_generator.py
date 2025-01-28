import pytest
from src.backend.services.questionnaire.question_generator import QuestionGenerator, Question

@pytest.fixture
def generator():
    return QuestionGenerator()

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

def test_generate_core_question(generator):
    """测试核心问题生成"""
    question = generator.generate_core_question()
    
    assert question.id.startswith("core_")
    assert question.type == "single_choice"
    assert question.category == "core"
    assert len(question.options) == 4
    assert 1 <= question.difficulty <= 5
    assert len(question.tags) > 0

def test_generate_role_question(generator):
    """测试角色问题生成"""
    question = generator.generate_role_question()
    
    assert question.id.startswith("role_")
    assert question.type == "multiple_choice"
    assert question.category == "role"
    assert len(question.options) == 5
    assert 1 <= question.difficulty <= 5
    assert len(question.tags) > 0

def test_generate_interaction_question(generator):
    """测试互动问题生成"""
    question = generator.generate_interaction_question()
    
    assert question.id.startswith("interaction_")
    assert question.type == "text"
    assert question.category == "interaction"
    assert question.options is None  # 互动问题不需要选项
    assert 2 <= question.difficulty <= 5  # 互动问题难度范围
    assert len(question.tags) > 0
    assert "interaction" in question.tags

def test_generate_question_set(generator):
    """测试问题集合生成"""
    questions = generator.generate_question_set(count=100)  # 使用较大的数量以获得更准确的比例
    
    assert len(questions) == 100
    assert all(isinstance(q, Question) for q in questions)
    
    # 检查各类问题的比例
    core_questions = [q for q in questions if q.category == "core"]
    role_questions = [q for q in questions if q.category == "role"]
    interaction_questions = [q for q in questions if q.category == "interaction"]
    
    # 由于使用随机生成，我们检查大致的比例范围
    assert 40 <= len(core_questions) <= 60  # 约50%的核心问题
    assert 20 <= len(role_questions) <= 40  # 约30%的角色问题
    assert 10 <= len(interaction_questions) <= 30  # 约20%的互动问题

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