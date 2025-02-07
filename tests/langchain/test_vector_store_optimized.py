import pytest
import os
import shutil
import asyncio
from datetime import datetime
import psutil
from src.langchain.core.vector_store_optimized import VectorStoreOptimized, ProgressCallback

@pytest.fixture
def vector_store():
    """创建测试用的向量存储实例"""
    return VectorStoreOptimized(
        batch_size=2,  # 小批量便于测试
        max_workers=2,
        cache_size=10,
        memory_limit=0.9
    )

@pytest.fixture
def test_texts():
    """创建测试用的文本数据"""
    return [
        "这是第一个测试文本",
        "这是第二个测试文本",
        "这是第三个测试文本，内容较长一些",
        "这是第四个测试文本，包含一些特殊内容"
    ]

@pytest.fixture
def test_metadata():
    """创建测试用的元数据"""
    return [
        {"id": 1, "type": "test"},
        {"id": 2, "type": "test"},
        {"id": 3, "type": "test"},
        {"id": 4, "type": "test"}
    ]

@pytest.mark.asyncio
async def test_add_texts_async(vector_store, test_texts, test_metadata):
    """测试异步添加文本功能"""
    # 测试基本添加功能
    ids = await vector_store.add_texts_async(test_texts[:2])
    assert len(ids) == 2
    assert all(isinstance(id_, str) for id_ in ids)

    # 测试带元数据的添加
    ids = await vector_store.add_texts_async(test_texts[2:], test_metadata[2:])
    assert len(ids) == 2

    # 测试进度回调
    progress = []
    def progress_callback(current, total):
        progress.append((current, total))
    
    await vector_store.add_texts_async(
        test_texts,
        progress_callback=progress_callback
    )

@pytest.mark.asyncio
async def test_similarity_search_async(vector_store, test_texts):
    """测试异步相似度搜索功能"""
    # 先添加一些文本
    await vector_store.add_texts_async(test_texts)

    # 测试基本搜索
    results = await vector_store.similarity_search_async("测试文本")
    assert len(results) == 4  # 默认k=4
    assert all(hasattr(doc, 'page_content') for doc in results)

    # 测试带阈值的搜索
    results = await vector_store.similarity_search_async(
        "测试文本",
        k=2,
        threshold=0.5
    )
    assert len(results) <= 2

@pytest.mark.asyncio
async def test_similarity_search_with_score_async(vector_store, test_texts):
    """测试异步带分数的相似度搜索功能"""
    # 先添加一些文本
    await vector_store.add_texts_async(test_texts)

    # 测试基本搜索
    results = await vector_store.similarity_search_with_score_async("测试文本")
    assert len(results) == 4
    assert all(len(item) == 2 for item in results)
    assert all(isinstance(item[1], float) for item in results)

    # 测试带阈值的搜索
    results = await vector_store.similarity_search_with_score_async(
        "测试文本",
        k=2,
        threshold=0.5
    )
    assert len(results) <= 2
    assert all(score >= 0.5 for _, score in results)

def test_memory_management(vector_store):
    """测试内存管理功能"""
    # 检查内存限制
    assert vector_store.memory_limit == 0.9
    assert vector_store._check_memory() == True  # 应该在限制之内

    # 模拟高内存使用
    original_check = vector_store._check_memory
    try:
        vector_store._check_memory = lambda: False
        with pytest.raises(asyncio.TimeoutError):
            asyncio.run(
                asyncio.wait_for(
                    vector_store._wait_for_memory(),
                    timeout=2
                )
            )
    finally:
        vector_store._check_memory = original_check

def test_batch_processing(vector_store, test_texts):
    """测试批处理功能"""
    batches = vector_store._batch_texts(test_texts)
    assert len(batches) == 2  # batch_size=2
    assert len(batches[0]) == 2
    assert len(batches[1]) == 2

def test_progress_callback():
    """测试进度回调功能"""
    callback = ProgressCallback(total=10, description="Test")
    assert callback.total == 10
    assert callback.current == 0

    # 测试更新
    callback.update(5)
    assert callback.current == 5

def test_cache_management(vector_store):
    """测试缓存管理功能"""
    # 测试缓存大小限制
    assert vector_store.cache_size == 10

    # 测试缓存操作
    text = "测试文本"
    vector1 = vector_store._get_embedding(text)
    vector2 = vector_store._get_embedding(text)
    assert (vector1 == vector2).all()  # 应该返回相同的缓存结果

    # 测试缓存清理
    vector_store.clear_cache()
    cache_info = vector_store._get_embedding.cache_info()
    assert cache_info.currsize == 0

def test_get_stats(vector_store):
    """测试性能统计功能"""
    stats = vector_store.get_stats()
    assert "memory_usage" in stats
    assert "cpu_usage" in stats
    assert "cache_size" in stats
    assert "cache_hits" in stats
    assert "cache_misses" in stats
    assert "batch_size" in stats
    assert "max_workers" in stats

@pytest.mark.asyncio
async def test_error_handling(vector_store):
    """测试错误处理"""
    # 测试空向量存储的搜索
    with pytest.raises(ValueError):
        await vector_store.similarity_search_async("测试查询")
    
    with pytest.raises(ValueError):
        await vector_store.similarity_search_with_score_async("测试查询")

    # 测试保存空向量存储
    with pytest.raises(ValueError):
        vector_store.save_local("test_path")

@pytest.mark.asyncio
async def test_save_and_load(vector_store, test_texts, tmp_path):
    """测试保存和加载功能"""
    # 准备测试数据
    await vector_store.add_texts_async(test_texts)
    save_path = str(tmp_path / "test_vectors")
    
    # 测试保存
    vector_store.save_local(save_path)
    assert os.path.exists(save_path)
    
    # 测试加载
    new_store = VectorStoreOptimized()
    new_store.load_local(save_path)
    
    # 验证加载后的搜索结果
    results = await new_store.similarity_search_async("测试文本")
    assert len(results) == 4
    
    # 清理测试数据
    if os.path.exists(save_path):
        shutil.rmtree(save_path)

@pytest.mark.asyncio
async def test_concurrent_operations(vector_store, test_texts):
    """测试并发操作"""
    # 创建多个并发任务
    tasks = [
        vector_store.add_texts_async(test_texts),
        vector_store.add_texts_async(test_texts),
        vector_store.add_texts_async(test_texts)
    ]
    
    # 并发执行
    results = await asyncio.gather(*tasks)
    assert len(results) == 3
    assert all(len(ids) == len(test_texts) for ids in results) 