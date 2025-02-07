import pytest
import os
import shutil
from src.langchain.core.vector_store import VectorStore

@pytest.fixture
def vector_store():
    """创建测试用的向量存储实例"""
    return VectorStore()

@pytest.fixture
def test_texts():
    """创建测试用的文本数据"""
    return [
        "这是第一个测试文本",
        "这是第二个测试文本",
        "这是第三个测试文本，内容较长一些",
        "这是第四个测试文本，包含一些特殊内容"
    ]

def test_add_texts(vector_store, test_texts):
    """测试添加文本功能"""
    ids = vector_store.add_texts(test_texts)
    assert len(ids) == len(test_texts)
    assert all(isinstance(id_, str) for id_ in ids)

def test_similarity_search(vector_store, test_texts):
    """测试相似度搜索功能"""
    vector_store.add_texts(test_texts)
    results = vector_store.similarity_search("测试文本")
    assert len(results) == 4  # 默认返回4个结果
    assert all(hasattr(doc, 'page_content') for doc in results)

def test_similarity_search_with_score(vector_store, test_texts):
    """测试带分数的相似度搜索功能"""
    vector_store.add_texts(test_texts)
    results = vector_store.similarity_search_with_score("测试文本")
    assert len(results) == 4  # 默认返回4个结果
    assert all(len(item) == 2 for item in results)  # 每个结果包含文档和分数
    assert all(isinstance(item[1], float) for item in results)  # 分数是浮点数

def test_save_and_load(vector_store, test_texts, tmp_path):
    """测试保存和加载功能"""
    # 准备测试数据
    vector_store.add_texts(test_texts)
    save_path = str(tmp_path / "test_vectors")
    
    # 测试保存
    vector_store.save_local(save_path)
    assert os.path.exists(save_path)
    
    # 测试加载
    new_store = VectorStore()
    new_store.load_local(save_path)
    
    # 验证加载后的搜索结果
    results = new_store.similarity_search("测试文本")
    assert len(results) == 4
    
    # 清理测试数据
    if os.path.exists(save_path):
        shutil.rmtree(save_path)

def test_empty_store_operations(vector_store):
    """测试空向量存储的操作"""
    with pytest.raises(ValueError):
        vector_store.similarity_search("测试查询")
    
    with pytest.raises(ValueError):
        vector_store.similarity_search_with_score("测试查询")
    
    with pytest.raises(ValueError):
        vector_store.save_local("test_path") 