import pytest
import os
import json
from src.langchain.core.chat_manager import ChatManager

@pytest.fixture
def chat_manager():
    """创建测试用的对话管理器实例"""
    return ChatManager(
        model_name="gpt-3.5-turbo",
        memory_size=3,
        temperature=0.5
    )

@pytest.fixture
def test_message():
    """创建测试用的消息"""
    return "这是一条测试消息"

@pytest.fixture
def test_context():
    """创建测试用的上下文"""
    return "这是测试上下文信息"

def test_init_chat_manager(chat_manager):
    """测试初始化功能"""
    assert chat_manager.model_name == "gpt-3.5-turbo"
    assert chat_manager.memory_size == 3
    assert chat_manager.temperature == 0.5
    assert chat_manager.conversation is not None
    assert chat_manager.memory is not None

@pytest.mark.asyncio
async def test_chat(chat_manager, test_message):
    """测试对话功能"""
    response = chat_manager.chat(test_message)
    assert isinstance(response, str)
    assert len(response) > 0

@pytest.mark.asyncio
async def test_chat_with_context(chat_manager, test_message, test_context):
    """测试带上下文的对话功能"""
    chat_manager.update_context(test_context)
    response = chat_manager.chat(test_message)
    assert isinstance(response, str)
    assert len(response) > 0

def test_get_history(chat_manager, test_message):
    """测试获取对话历史功能"""
    # 进行几轮对话
    chat_manager.chat(test_message)
    chat_manager.chat(test_message + "2")
    
    history = chat_manager.get_history()
    assert isinstance(history, list)
    assert len(history) > 0
    assert all(isinstance(msg, dict) for msg in history)

def test_clear_history(chat_manager, test_message):
    """测试清空对话历史功能"""
    # 先进行对话
    chat_manager.chat(test_message)
    assert len(chat_manager.get_history()) > 0
    
    # 清空历史
    chat_manager.clear_history()
    assert len(chat_manager.get_history()) == 0

def test_save_and_load_history(chat_manager, test_message, tmp_path):
    """测试保存和加载对话历史功能"""
    # 进行对话并保存
    chat_manager.chat(test_message)
    chat_manager.chat(test_message + "2")
    
    save_path = str(tmp_path / "test_history.json")
    chat_manager.save_history(save_path)
    
    # 验证保存的文件
    assert os.path.exists(save_path)
    with open(save_path, "r", encoding="utf-8") as f:
        saved_data = json.load(f)
        assert "timestamp" in saved_data
        assert "model" in saved_data
        assert "messages" in saved_data
    
    # 清空后加载
    chat_manager.clear_history()
    chat_manager.load_history(save_path)
    
    # 验证加载的历史
    history = chat_manager.get_history()
    assert len(history) > 0

def test_update_context(chat_manager, test_context):
    """测试更新上下文功能"""
    chat_manager.update_context(test_context)
    assert "上下文信息" in chat_manager.conversation.prompt.template
    assert test_context in chat_manager.conversation.prompt.template

def test_memory_size_limit(chat_manager):
    """测试对话历史大小限制"""
    # 进行超过memory_size轮的对话
    for i in range(5):  # memory_size为3
        chat_manager.chat(f"测试消息{i}")
    
    history = chat_manager.get_history()
    assert len(history) <= chat_manager.memory_size * 2  # 考虑到每轮对话包含问题和回答

def test_error_handling(chat_manager):
    """测试错误处理"""
    # 测试无效的历史文件路径
    with pytest.raises(FileNotFoundError):
        chat_manager.load_history("invalid_path.json")
    
    # 测试保存到无效路径
    with pytest.raises(Exception):
        chat_manager.save_history("/invalid/path/history.json") 