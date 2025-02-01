"""知识库备份API测试."""
from datetime import datetime, timedelta
from typing import Dict

import pytest
from fastapi import status
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from scriptai.core.security import get_password_hash
from scriptai.models.user import User
from scriptai.services.backup import backup_service


@pytest.fixture
async def test_superuser(db: AsyncSession) -> User:
    """创建测试超级用户."""
    hashed_password = get_password_hash("testpass123")
    user = User(
        email="admin@example.com",
        username="admin",
        hashed_password=hashed_password,
        full_name="Admin User",
        is_superuser=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@pytest.fixture
async def superuser_token_headers(
    client: AsyncClient,
    test_superuser: User,
) -> Dict[str, str]:
    """获取超级用户认证头."""
    response = await client.post(
        "/api/v1/auth/login",
        data={
            "username": test_superuser.email,
            "password": "testpass123",
        },
    )
    tokens = response.json()
    return {"Authorization": f"Bearer {tokens['access_token']}"}


@pytest.fixture
async def test_backup(
    client: AsyncClient,
    superuser_token_headers: Dict[str, str],
) -> Dict[str, Any]:
    """创建测试备份."""
    response = await client.post(
        "/api/v1/backup/backups",
        headers=superuser_token_headers,
        params={
            "backup_type": "full",
        },
    )
    return response.json()


@pytest.mark.asyncio
async def test_create_backup(
    client: AsyncClient,
    superuser_token_headers: Dict[str, str],
) -> None:
    """测试创建备份."""
    response = await client.post(
        "/api/v1/backup/backups",
        headers=superuser_token_headers,
        params={
            "backup_type": "full",
        },
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "success"
    assert "id" in data
    assert "backup_path" in data


@pytest.mark.asyncio
async def test_create_backup_with_metadata(
    client: AsyncClient,
    superuser_token_headers: Dict[str, str],
) -> None:
    """测试创建带元数据的备份."""
    response = await client.post(
        "/api/v1/backup/backups",
        headers=superuser_token_headers,
        params={
            "backup_type": "full",
        },
        json={
            "metadata": {
                "description": "测试备份",
                "version": "1.0.0",
            },
        },
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "success"
    assert "id" in data
    assert "backup_path" in data


@pytest.mark.asyncio
async def test_create_backup_with_invalid_type(
    client: AsyncClient,
    superuser_token_headers: Dict[str, str],
) -> None:
    """测试创建无效类型的备份."""
    response = await client.post(
        "/api/v1/backup/backups",
        headers=superuser_token_headers,
        params={
            "backup_type": "invalid",
        },
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "不支持的备份类型" in response.json()["detail"]


@pytest.mark.asyncio
async def test_restore_backup(
    client: AsyncClient,
    superuser_token_headers: Dict[str, str],
    test_backup: Dict[str, Any],
) -> None:
    """测试从备份恢复."""
    response = await client.post(
        f"/api/v1/backup/backups/{test_backup['id']}/restore",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "success"


@pytest.mark.asyncio
async def test_restore_nonexistent_backup(
    client: AsyncClient,
    superuser_token_headers: Dict[str, str],
) -> None:
    """测试从不存在的备份恢复."""
    response = await client.post(
        "/api/v1/backup/backups/999/restore",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "备份记录不存在" in response.json()["detail"]


@pytest.mark.asyncio
async def test_get_backup_records(
    client: AsyncClient,
    superuser_token_headers: Dict[str, str],
    test_backup: Dict[str, Any],
) -> None:
    """测试获取备份记录列表."""
    response = await client.get(
        "/api/v1/backup/backups",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) > 0
    assert data[0]["id"] == test_backup["id"]
    assert data[0]["backup_path"] == test_backup["backup_path"]


@pytest.mark.asyncio
async def test_get_backup_record(
    client: AsyncClient,
    superuser_token_headers: Dict[str, str],
    test_backup: Dict[str, Any],
) -> None:
    """测试获取备份记录."""
    response = await client.get(
        f"/api/v1/backup/backups/{test_backup['id']}",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == test_backup["id"]
    assert data["backup_path"] == test_backup["backup_path"]


@pytest.mark.asyncio
async def test_get_nonexistent_backup_record(
    client: AsyncClient,
    superuser_token_headers: Dict[str, str],
) -> None:
    """测试获取不存在的备份记录."""
    response = await client.get(
        "/api/v1/backup/backups/999",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert "备份记录不存在" in response.json()["detail"]


@pytest.mark.asyncio
async def test_get_latest_backup(
    client: AsyncClient,
    superuser_token_headers: Dict[str, str],
    test_backup: Dict[str, Any],
) -> None:
    """测试获取最新备份记录."""
    response = await client.get(
        "/api/v1/backup/backups/latest/full",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == test_backup["id"]
    assert data["backup_path"] == test_backup["backup_path"]


@pytest.mark.asyncio
async def test_get_latest_nonexistent_backup(
    client: AsyncClient,
    superuser_token_headers: Dict[str, str],
) -> None:
    """测试获取不存在的最新备份记录."""
    response = await client.get(
        "/api/v1/backup/backups/latest/invalid",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert "备份记录不存在" in response.json()["detail"]


@pytest.mark.asyncio
async def test_get_backup_records_by_date(
    client: AsyncClient,
    superuser_token_headers: Dict[str, str],
    test_backup: Dict[str, Any],
) -> None:
    """测试获取指定时间范围内的备份记录列表."""
    now = datetime.utcnow()
    start_date = (now - timedelta(days=1)).isoformat()
    end_date = (now + timedelta(days=1)).isoformat()

    response = await client.get(
        "/api/v1/backup/backups/date",
        headers=superuser_token_headers,
        params={
            "start_date": start_date,
            "end_date": end_date,
        },
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) > 0
    assert data[0]["id"] == test_backup["id"]
    assert data[0]["backup_path"] == test_backup["backup_path"] 