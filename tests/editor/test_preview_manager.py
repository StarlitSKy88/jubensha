import pytest
from datetime import datetime
from src.editor.preview_manager import PreviewManager

@pytest.fixture
def preview_manager():
    return PreviewManager()

@pytest.fixture
def sample_content():
    return """# 元数据
title: 测试剧本
author: 测试作者
genre: 悬疑
description: 这是一个测试剧本
tags: 悬疑, 推理

# 角色
## 张三
- 年龄：25岁
- 职业：侦探
- 关系：李四的搭档

## 李四
- 年龄：30岁
- 职业：警察
- 关系：张三的上级

# 场景一
## 场景：警局办公室
> *张三*：最近发生了一起奇怪的案件。
> *李四*：具体是什么情况？
这是一段场景描述。

## 场景：案发现场
> *张三*：现场有一些线索。
> *李四*：我们需要仔细调查。
"""

def test_preview_manager_init(preview_manager):
    """测试预览管理器初始化"""
    assert preview_manager.current_content == ""
    assert preview_manager.preview_cache == {}
    assert preview_manager.last_update is None
    assert preview_manager.watchers == []

def test_update_content(preview_manager, sample_content):
    """测试更新内容"""
    preview_data = preview_manager.update_content(sample_content)
    
    assert preview_manager.current_content == sample_content
    assert preview_manager.last_update is not None
    assert isinstance(preview_data, dict)
    assert all(key in preview_data for key in ["scenes", "characters", "metadata", "timestamp"])

def test_parse_scenes(preview_manager, sample_content):
    """测试场景解析"""
    preview_data = preview_manager.update_content(sample_content)
    scenes = preview_data["scenes"]
    
    assert len(scenes) == 2
    assert scenes[0]["title"] == "场景：警局办公室"
    assert len(scenes[0]["characters"]) == 2
    assert "张三" in scenes[0]["characters"]
    assert "李四" in scenes[0]["characters"]

def test_parse_characters(preview_manager, sample_content):
    """测试角色解析"""
    preview_data = preview_manager.update_content(sample_content)
    characters = preview_data["characters"]
    
    assert len(characters) == 2
    assert characters[0]["name"] == "张三"
    assert len(characters[0]["relationships"]) == 1
    assert "李四的搭档" in characters[0]["relationships"]

def test_parse_metadata(preview_manager, sample_content):
    """测试元数据解析"""
    preview_data = preview_manager.update_content(sample_content)
    metadata = preview_data["metadata"]
    
    assert metadata["title"] == "测试剧本"
    assert metadata["author"] == "测试作者"
    assert metadata["genre"] == "悬疑"
    assert len(metadata["description"]) == 1
    assert metadata["description"][0] == "这是一个测试剧本"

def test_watcher_notification(preview_manager, sample_content):
    """测试观察者通知"""
    notifications = []
    
    def test_callback(preview_data):
        notifications.append(preview_data)
    
    preview_manager.add_watcher(test_callback)
    preview_manager.update_content(sample_content)
    
    assert len(notifications) == 1
    assert isinstance(notifications[0], dict)
    
    preview_manager.remove_watcher(test_callback)
    preview_manager.update_content("new content")
    
    assert len(notifications) == 1

def test_cache_management(preview_manager, sample_content):
    """测试缓存管理"""
    preview_manager.update_content(sample_content)
    cache_key = hash(sample_content)
    
    assert cache_key in preview_manager.preview_cache
    assert preview_manager.get_current_preview() is not None
    
    preview_manager.clear_cache()
    assert preview_manager.preview_cache == {}

def test_error_handling(preview_manager):
    """测试错误处理"""
    def error_callback(data):
        raise Exception("Test error")
    
    preview_manager.add_watcher(error_callback)
    preview_manager._notify_watchers({"test": "data"})
    
    # 清理
    preview_manager.remove_watcher(error_callback)

def test_empty_content(preview_manager):
    """测试空内容"""
    preview_data = preview_manager.update_content("")
    
    assert preview_data["scenes"] == []
    assert preview_data["characters"] == []
    assert preview_data["metadata"]["title"] == ""

def test_invalid_content_format(preview_manager):
    """测试无效内容格式"""
    invalid_content = """
    这是一些随机文本
    没有正确的格式
    """
    preview_data = preview_manager.update_content(invalid_content)
    
    assert preview_data["scenes"] == []
    assert preview_data["characters"] == []
    assert preview_data["metadata"]["title"] == "" 