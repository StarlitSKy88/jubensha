"""Milvus向量存储测试."""
import pytest
from pymilvus import MetricType, IndexType

from scriptai.core.milvus import MilvusManager
from scriptai.services.rag.base import Document
from scriptai.services.rag.milvus import MilvusVectorStore


@pytest.fixture
async def milvus_store() -> MilvusVectorStore:
    """创建测试用的Milvus向量存储."""
    store = MilvusVectorStore(
        collection_name="test_documents",
        dim=4,  # 使用小维度便于测试
        metric_type=MetricType.COSINE,
        index_type=IndexType.IVF_FLAT,
        index_params={"nlist": 16},
        search_params={"nprobe": 8},
    )
    await store.connect()
    yield store
    await store.close()


@pytest.mark.asyncio
async def test_add_and_search(milvus_store: MilvusVectorStore) -> None:
    """测试添加和搜索文档."""
    # 准备测试数据
    documents = [
        Document(
            content="测试文档1",
            metadata={"type": "test1"},
        ),
        Document(
            content="测试文档2",
            metadata={"type": "test2"},
        ),
    ]
    embeddings = [
        [1.0, 0.0, 0.0, 0.0],
        [0.0, 1.0, 0.0, 0.0],
    ]

    # 添加文档
    ids = await milvus_store.add(documents, embeddings)
    assert len(ids) == 2

    # 搜索文档
    results = await milvus_store.search(
        query_vector=[1.0, 0.0, 0.0, 0.0],
        limit=2,
    )
    assert len(results) == 2
    assert results[0].content == "测试文档1"
    assert results[0].score > 0.9  # 余弦相似度应该接近1
    assert results[0].metadata["type"] == "test1"


@pytest.mark.asyncio
async def test_search_with_filter(milvus_store: MilvusVectorStore) -> None:
    """测试带过滤条件的搜索."""
    # 准备测试数据
    documents = [
        Document(
            content="测试文档1",
            metadata={"type": "test1", "category": "A"},
        ),
        Document(
            content="测试文档2",
            metadata={"type": "test2", "category": "B"},
        ),
    ]
    embeddings = [
        [1.0, 0.0, 0.0, 0.0],
        [0.0, 1.0, 0.0, 0.0],
    ]
    await milvus_store.add(documents, embeddings)

    # 使用过滤条件搜索
    results = await milvus_store.search(
        query_vector=[1.0, 0.0, 0.0, 0.0],
        limit=2,
        filter={"category": "A"},
    )
    assert len(results) == 1
    assert results[0].content == "测试文档1"
    assert results[0].metadata["category"] == "A"


@pytest.mark.asyncio
async def test_delete(milvus_store: MilvusVectorStore) -> None:
    """测试删除文档."""
    # 准备测试数据
    documents = [
        Document(
            content="测试文档1",
            metadata={"type": "test1"},
        ),
        Document(
            content="测试文档2",
            metadata={"type": "test2"},
        ),
    ]
    embeddings = [
        [1.0, 0.0, 0.0, 0.0],
        [0.0, 1.0, 0.0, 0.0],
    ]
    await milvus_store.add(documents, embeddings)

    # 删除文档
    await milvus_store.delete({"type": "test1"})

    # 验证删除结果
    results = await milvus_store.search(
        query_vector=[1.0, 0.0, 0.0, 0.0],
        limit=2,
    )
    assert len(results) == 1
    assert results[0].content == "测试文档2"


@pytest.mark.asyncio
async def test_search_params_adjustment(milvus_store: MilvusVectorStore) -> None:
    """测试搜索参数动态调整."""
    # 准备测试数据
    documents = [Document(content=f"测试文档{i}", metadata={}) for i in range(100)]
    embeddings = [[float(i), 0.0, 0.0, 0.0] for i in range(100)]
    await milvus_store.add(documents, embeddings)

    # 测试不同limit下的搜索
    small_limit_results = await milvus_store.search(
        query_vector=[0.0, 0.0, 0.0, 0.0],
        limit=5,
    )
    assert len(small_limit_results) == 5

    large_limit_results = await milvus_store.search(
        query_vector=[0.0, 0.0, 0.0, 0.0],
        limit=50,
    )
    assert len(large_limit_results) == 50


@pytest.mark.asyncio
async def test_connection_error_handling(monkeypatch) -> None:
    """测试连接错误处理."""
    async def mock_connect(*args, **kwargs):
        raise Exception("连接错误")

    monkeypatch.setattr(MilvusManager, "connect", mock_connect)
    store = MilvusVectorStore(collection_name="test_error")

    with pytest.raises(Exception, match="连接错误"):
        await store.connect()


@pytest.mark.asyncio
async def test_search_without_connection() -> None:
    """测试未连接时的搜索错误处理."""
    store = MilvusVectorStore(collection_name="test_no_connection")
    
    with pytest.raises(RuntimeError, match="未连接到Milvus服务器"):
        await store.search([0.0, 0.0, 0.0, 0.0])


@pytest.mark.asyncio
async def test_count(milvus_store: MilvusVectorStore) -> None:
    """测试获取文档总数."""
    # 准备测试数据
    documents = [
        Document(content="测试文档1", metadata={"type": "test1"}),
        Document(content="测试文档2", metadata={"type": "test2"}),
        Document(content="测试文档3", metadata={"type": "test1"}),
    ]
    embeddings = [
        [1.0, 0.0, 0.0, 0.0],
        [0.0, 1.0, 0.0, 0.0],
        [0.0, 0.0, 1.0, 0.0],
    ]
    await milvus_store.add(documents, embeddings)

    # 测试计数
    count = await milvus_store.count()
    assert count == 3


@pytest.mark.asyncio
async def test_count_by_type(milvus_store: MilvusVectorStore) -> None:
    """测试获取各类型文档数量."""
    # 准备测试数据
    documents = [
        Document(content="测试文档1", metadata={"type": "test1"}),
        Document(content="测试文档2", metadata={"type": "test2"}),
        Document(content="测试文档3", metadata={"type": "test1"}),
        Document(content="测试文档4", metadata={"type": "test3"}),
    ]
    embeddings = [
        [1.0, 0.0, 0.0, 0.0],
        [0.0, 1.0, 0.0, 0.0],
        [0.0, 0.0, 1.0, 0.0],
        [0.0, 0.0, 0.0, 1.0],
    ]
    await milvus_store.add(documents, embeddings)

    # 测试类型计数
    type_counts = await milvus_store.count_by_type()
    assert type_counts["test1"] == 2
    assert type_counts["test2"] == 1
    assert type_counts["test3"] == 1


@pytest.mark.asyncio
async def test_get_storage_size(milvus_store: MilvusVectorStore) -> None:
    """测试获取存储大小."""
    # 准备测试数据
    documents = [
        Document(content="测试文档1", metadata={"type": "test1"}),
        Document(content="测试文档2", metadata={"type": "test2"}),
    ]
    embeddings = [
        [1.0, 0.0, 0.0, 0.0],
        [0.0, 1.0, 0.0, 0.0],
    ]
    await milvus_store.add(documents, embeddings)

    # 测试存储大小
    size = await milvus_store.get_storage_size()
    assert size > 0  # 存储大小应该大于0


@pytest.mark.asyncio
async def test_stats_without_connection() -> None:
    """测试未连接时的统计错误处理."""
    store = MilvusVectorStore(collection_name="test_no_connection")
    
    with pytest.raises(RuntimeError, match="未连接到Milvus服务器"):
        await store.count()
    
    with pytest.raises(RuntimeError, match="未连接到Milvus服务器"):
        await store.count_by_type()
    
    with pytest.raises(RuntimeError, match="未连接到Milvus服务器"):
        await store.get_storage_size() 