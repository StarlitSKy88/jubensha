"""健康检查API测试."""
import pytest
from fastapi import status
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient) -> None:
    """测试基础健康检查."""
    response = await client.get("/api/v1/health")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "ok"


@pytest.mark.asyncio
async def test_db_health_check(client: AsyncClient, db: AsyncSession) -> None:
    """测试数据库健康检查."""
    response = await client.get("/api/v1/health/db")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "ok"


@pytest.mark.asyncio
async def test_redis_health_check(client: AsyncClient) -> None:
    """测试Redis健康检查."""
    response = await client.get("/api/v1/health/redis")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "ok"


@pytest.mark.asyncio
async def test_all_health_check(client: AsyncClient, db: AsyncSession) -> None:
    """测试全面健康检查."""
    response = await client.get("/api/v1/health/all")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "ok"
    assert "services" in data
    assert "database" in data["services"]
    assert data["services"]["database"]["status"] == "ok"
    assert "redis" in data["services"]
    assert data["services"]["redis"]["status"] == "ok" 