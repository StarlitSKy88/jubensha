import pytest
import os
import shutil
from datetime import datetime
from src.langchain.core.knowledge_base import KnowledgeBase

@pytest.fixture
def knowledge_base(tmp_path):
    """创建测试用的知识库实例"""
    kb_path = str(tmp_path / "test_kb")
    kb = KnowledgeBase(storage_path=kb_path)
    yield kb
    # 清理测试数据
    if os.path.exists(kb_path):
        shutil.rmtree(kb_path)

@pytest.fixture
def test_document():
    """创建测试用的文档"""
    return {
        "content": "这是一个测试文档的内容。\n包含多行文本。\n用于测试知识库功能。",
        "doc_id": "test_doc_001",
        "doc_type": "text",
        "metadata": {
            "author": "测试用户",
            "tags": ["测试", "文档"],
            "created_at": datetime.now().isoformat()
        }
    }

def test_init_knowledge_base(knowledge_base):
    """测试知识库初始化"""
    assert os.path.exists(knowledge_base.storage_path)
    assert os.path.exists(knowledge_base.metadata_path)
    assert os.path.exists(knowledge_base.version_path)
    
    # 验证元数据
    assert knowledge_base.metadata["version"] == "0.1.0"
    assert knowledge_base.metadata["document_count"] == 0
    assert knowledge_base.metadata["chunk_count"] == 0

def test_add_document(knowledge_base, test_document):
    """测试添加文档功能"""
    doc_id = knowledge_base.add_document(
        content=test_document["content"],
        doc_id=test_document["doc_id"],
        doc_type=test_document["doc_type"],
        metadata=test_document["metadata"]
    )
    
    assert doc_id == test_document["doc_id"]
    assert doc_id in knowledge_base.metadata["documents"]
    assert knowledge_base.metadata["document_count"] == 1
    assert knowledge_base.metadata["chunk_count"] > 0

def test_update_document(knowledge_base, test_document):
    """测试更新文档功能"""
    # 先添加文档
    knowledge_base.add_document(
        content=test_document["content"],
        doc_id=test_document["doc_id"],
        doc_type=test_document["doc_type"],
        metadata=test_document["metadata"]
    )
    
    # 更新文档
    new_content = "这是更新后的文档内容"
    new_metadata = {"updated_by": "测试用户"}
    
    knowledge_base.update_document(
        doc_id=test_document["doc_id"],
        content=new_content,
        metadata=new_metadata
    )
    
    # 验证更新
    doc_info = knowledge_base.metadata["documents"][test_document["doc_id"]]
    assert "updated_by" in doc_info["metadata"]
    
    # 验证版本
    versions = knowledge_base.get_document_versions(test_document["doc_id"])
    assert len(versions) == 2

def test_delete_document(knowledge_base, test_document):
    """测试删除文档功能"""
    # 先添加文档
    knowledge_base.add_document(
        content=test_document["content"],
        doc_id=test_document["doc_id"],
        doc_type=test_document["doc_type"],
        metadata=test_document["metadata"]
    )
    
    # 删除文档
    knowledge_base.delete_document(test_document["doc_id"])
    
    # 验证删除
    assert test_document["doc_id"] not in knowledge_base.metadata["documents"]
    assert knowledge_base.metadata["document_count"] == 0

def test_version_management(knowledge_base, test_document):
    """测试版本管理功能"""
    # 添加文档
    knowledge_base.add_document(
        content=test_document["content"],
        doc_id=test_document["doc_id"],
        doc_type=test_document["doc_type"],
        metadata=test_document["metadata"]
    )
    
    # 更新多个版本
    for i in range(3):
        knowledge_base.update_document(
            doc_id=test_document["doc_id"],
            content=f"版本 {i+2} 的内容",
            metadata={"version": i+2}
        )
    
    # 获取版本历史
    versions = knowledge_base.get_document_versions(test_document["doc_id"])
    assert len(versions) == 4  # 1个初始版本 + 3个更新版本
    
    # 验证版本排序
    timestamps = [v["timestamp"] for v in versions]
    assert timestamps == sorted(timestamps, reverse=True)

def test_search(knowledge_base, test_document):
    """测试搜索功能"""
    # 添加多个文档
    knowledge_base.add_document(
        content=test_document["content"],
        doc_id=test_document["doc_id"],
        doc_type=test_document["doc_type"],
        metadata=test_document["metadata"]
    )
    
    knowledge_base.add_document(
        content="这是另一个测试文档，用于测试搜索功能",
        doc_id="test_doc_002",
        doc_type="text",
        metadata={"tags": ["搜索", "测试"]}
    )
    
    # 执行搜索
    results = knowledge_base.search("测试文档", limit=2)
    assert len(results) <= 2
    assert all("content" in r and "metadata" in r and "score" in r for r in results)

def test_get_statistics(knowledge_base, test_document):
    """测试统计信息功能"""
    # 添加文档
    knowledge_base.add_document(
        content=test_document["content"],
        doc_id=test_document["doc_id"],
        doc_type=test_document["doc_type"],
        metadata=test_document["metadata"]
    )
    
    # 获取统计信息
    stats = knowledge_base.get_statistics()
    assert "version" in stats
    assert "document_count" in stats
    assert "chunk_count" in stats
    assert "last_update" in stats
    assert stats["document_count"] == 1

def test_error_handling(knowledge_base):
    """测试错误处理"""
    # 测试更新不存在的文档
    with pytest.raises(ValueError):
        knowledge_base.update_document(
            doc_id="non_existent",
            content="测试内容"
        )
    
    # 测试删除不存在的文档
    with pytest.raises(ValueError):
        knowledge_base.delete_document("non_existent")
    
    # 测试获取不存在的版本
    with pytest.raises(ValueError):
        knowledge_base.get_document_version(
            "non_existent",
            "2024-01-01T00:00:00"
        ) 