"""性能测试."""
import asyncio
import time
from typing import List

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from scriptai.models.user import User

async def measure_response_time(
    client: AsyncClient,
    method: str,
    url: str,
    **kwargs
) -> float:
    """测量API响应时间.
    
    Args:
        client: HTTP客户端
        method: 请求方法
        url: 请求URL
        **kwargs: 其他请求参数
        
    Returns:
        响应时间（秒）
    """
    start_time = time.time()
    response = await getattr(client, method.lower())(url, **kwargs)
    assert response.status_code < 500  # 确保请求成功
    return time.time() - start_time

async def concurrent_requests(
    client: AsyncClient,
    method: str,
    url: str,
    n_requests: int,
    **kwargs
) -> List[float]:
    """并发请求.
    
    Args:
        client: HTTP客户端
        method: 请求方法
        url: 请求URL
        n_requests: 请求数量
        **kwargs: 其他请求参数
        
    Returns:
        响应时间列表
    """
    tasks = [
        measure_response_time(client, method, url, **kwargs)
        for _ in range(n_requests)
    ]
    return await asyncio.gather(*tasks)

@pytest.mark.performance
async def test_profile_api_performance(
    client: AsyncClient,
    admin_token: str
):
    """测试个人资料API性能."""
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # 测试获取资料性能
    response_times = await concurrent_requests(
        client,
        "GET",
        "/api/v1/profiles/me/profile",
        n_requests=100,
        headers=headers
    )
    
    # 验证性能指标
    avg_time = sum(response_times) / len(response_times)
    max_time = max(response_times)
    p95_time = sorted(response_times)[int(len(response_times) * 0.95)]
    
    assert avg_time < 0.1  # 平均响应时间小于100ms
    assert max_time < 0.5  # 最大响应时间小于500ms
    assert p95_time < 0.2  # 95%的请求响应时间小于200ms

@pytest.mark.performance
async def test_file_api_performance(
    client: AsyncClient,
    admin_token: str,
    tmp_path
):
    """测试文件API性能."""
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # 创建测试文件
    test_file = tmp_path / "test.txt"
    test_file.write_text("test content")
    
    # 测试文件上传性能
    response_times = []
    for _ in range(10):  # 上传10个文件
        with open(test_file, "rb") as f:
            start_time = time.time()
            response = await client.post(
                "/api/v1/files/upload",
                headers=headers,
                files={"file": ("test.txt", f, "text/plain")}
            )
            assert response.status_code == 200
            response_times.append(time.time() - start_time)
    
    # 验证性能指标
    avg_time = sum(response_times) / len(response_times)
    max_time = max(response_times)
    
    assert avg_time < 0.5  # 平均上传时间小于500ms
    assert max_time < 1.0  # 最大上传时间小于1s

@pytest.mark.performance
async def test_api_load(
    client: AsyncClient,
    admin_token: str
):
    """测试API负载."""
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # 测试端点列表
    endpoints = [
        ("GET", "/api/v1/profiles/me/profile"),
        ("GET", "/api/v1/profiles/me/settings"),
        ("GET", f"/api/v1/profiles/users/{admin_token}/profile")
    ]
    
    # 并发请求数
    n_requests = 50
    
    # 对每个端点进行负载测试
    for method, url in endpoints:
        response_times = await concurrent_requests(
            client,
            method,
            url,
            n_requests=n_requests,
            headers=headers
        )
        
        # 计算性能指标
        avg_time = sum(response_times) / len(response_times)
        max_time = max(response_times)
        p95_time = sorted(response_times)[int(len(response_times) * 0.95)]
        
        # 验证性能指标
        assert avg_time < 0.2  # 平均响应时间小于200ms
        assert max_time < 1.0  # 最大响应时间小于1s
        assert p95_time < 0.5  # 95%的请求响应时间小于500ms

@pytest.mark.performance
async def test_database_performance(
    client: AsyncClient,
    admin_token: str,
    db: AsyncSession
):
    """测试数据库性能."""
    # 批量创建用户
    start_time = time.time()
    users = []
    for i in range(100):
        user = User(
            username=f"test_user_{i}",
            email=f"test{i}@example.com",
            password_hash="test_hash"
        )
        users.append(user)
    
    db.add_all(users)
    await db.commit()
    
    bulk_insert_time = time.time() - start_time
    assert bulk_insert_time < 1.0  # 批量插入时间小于1s
    
    # 批量查询
    start_time = time.time()
    query = select(User).limit(1000)
    result = await db.execute(query)
    users = result.scalars().all()
    
    bulk_query_time = time.time() - start_time
    assert bulk_query_time < 0.5  # 批量查询时间小于500ms 