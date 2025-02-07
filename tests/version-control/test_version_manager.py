import pytest
import os
import shutil
from src.version_control.core.version_manager import VersionManager

@pytest.fixture
def test_storage(tmp_path):
    """创建测试用的存储目录"""
    storage_path = tmp_path / "test_versions"
    os.makedirs(storage_path, exist_ok=True)
    return str(storage_path)

@pytest.fixture
def version_manager(test_storage):
    """创建测试用的版本管理器实例"""
    return VersionManager(test_storage)

@pytest.fixture
def test_content():
    """创建测试用的内容"""
    return "这是测试内容\n包含多行文本\n用于测试版本控制功能"

def test_create_version(version_manager, test_content):
    """测试创建版本功能"""
    metadata = {"author": "测试用户", "description": "测试版本"}
    version_id = version_manager.create_version(test_content, metadata)
    
    assert isinstance(version_id, str)
    assert len(version_id) > 0
    
    # 验证版本数据
    version = version_manager.get_version(version_id)
    assert version["content"] == test_content
    assert version["metadata"] == metadata
    assert version["parent"] is None  # 第一个版本没有父版本

def test_create_multiple_versions(version_manager):
    """测试创建多个版本"""
    # 创建第一个版本
    v1_id = version_manager.create_version("版本1内容")
    
    # 创建第二个版本
    v2_id = version_manager.create_version("版本2内容")
    
    # 验证版本链接
    v2 = version_manager.get_version(v2_id)
    assert v2["parent"] == v1_id

def test_get_version(version_manager, test_content):
    """测试获取版本功能"""
    # 创建版本
    version_id = version_manager.create_version(test_content)
    
    # 获取并验证版本
    version = version_manager.get_version(version_id)
    assert version["content"] == test_content
    assert "metadata" in version
    assert "timestamp" in version
    
    # 测试获取不存在的版本
    with pytest.raises(ValueError):
        version_manager.get_version("non_existent_id")

def test_get_diff(version_manager):
    """测试版本差异比较功能"""
    # 创建两个版本
    v1_id = version_manager.create_version("第一个版本的内容\n测试行1\n测试行2")
    v2_id = version_manager.create_version("第一个版本的内容\n测试行1修改\n测试行2")
    
    # 获取差异
    diff = version_manager.get_diff(v1_id, v2_id)
    assert len(diff) > 0
    assert any("测试行1" in line for line in diff)

def test_get_history(version_manager):
    """测试获取版本历史功能"""
    # 创建多个版本
    v1_id = version_manager.create_version("版本1")
    v2_id = version_manager.create_version("版本2")
    v3_id = version_manager.create_version("版本3")
    
    # 获取历史
    history = version_manager.get_history()
    assert len(history) == 3
    
    # 验证历史记录的完整性
    assert history[0]["id"] == v1_id
    assert history[1]["id"] == v2_id
    assert history[2]["id"] == v3_id

def test_rollback(version_manager):
    """测试版本回滚功能"""
    # 创建多个版本
    v1_id = version_manager.create_version("版本1")
    v2_id = version_manager.create_version("版本2")
    
    # 回滚到第一个版本
    rollback_version = version_manager.rollback(v1_id)
    assert rollback_version["content"] == "版本1"
    
    # 验证当前版本
    assert version_manager.current_version["id"] == v1_id 