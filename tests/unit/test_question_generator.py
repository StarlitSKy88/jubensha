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

def test_generate_question_set(generator):
    """测试问题集合生成"""
    questions = generator.generate_question_set(count=10)
    
    assert len(questions) == 10
    assert all(isinstance(q, Question) for q in questions)
    
    # 检查核心问题和角色问题的比例
    core_questions = [q for q in questions if q.category == "core"]
    role_questions = [q for q in questions if q.category == "role"]
    
    # 由于使用随机生成，我们检查大致的比例范围
    assert 4 <= len(core_questions) <= 8  # 大约60%的核心问题
    assert 2 <= len(role_questions) <= 6  # 大约40%的角色问题

def test_question_templates(generator):
    """测试问题模板系统"""
    # 测试核心问题模板
    assert len(generator.core_templates) > 0
    assert all("{" in t and "}" in t for t in generator.core_templates)
    
    # 测试角色问题模板
    assert len(generator.role_templates) > 0
    assert all("{role_type}" in t for t in generator.role_templates)
    
    # 测试情境列表
    assert len(generator.situations) > 0
    assert all(isinstance(s, str) for s in generator.situations)
    
    # 测试角色类型列表
    assert len(generator.role_types) > 0
    assert all(isinstance(r, str) for r in generator.role_types) 