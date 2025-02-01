"""剧本API测试."""
import pytest
from fastapi import status
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from scriptai.core.security import get_password_hash
from scriptai.models.script import Script
from scriptai.models.user import User


@pytest.fixture
async def test_user(db: AsyncSession) -> User:
    """创建测试用户."""
    hashed_password = get_password_hash("testpass123")
    user = User(
        email="test@example.com",
        username="testuser",
        hashed_password=hashed_password,
        full_name="Test User",
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@pytest.fixture
async def test_script(db: AsyncSession, test_user: User) -> Script:
    """创建测试剧本."""
    script = Script(
        title="Test Script",
        description="Test Description",
        content="Test Content",
        genre="drama",
        status="draft",
        owner_id=test_user.id,
    )
    db.add(script)
    await db.commit()
    await db.refresh(script)
    return script


@pytest.fixture
async def user_token_headers(client: AsyncClient, test_user: User) -> dict[str, str]:
    """获取用户认证头."""
    response = await client.post(
        "/api/v1/auth/login",
        data={
            "username": test_user.email,
            "password": "testpass123",
        },
    )
    tokens = response.json()
    return {"Authorization": f"Bearer {tokens['access_token']}"}


@pytest.mark.asyncio
async def test_create_script(
    client: AsyncClient,
    user_token_headers: dict[str, str],
) -> None:
    """测试创建剧本."""
    response = await client.post(
        "/api/v1/scripts",
        headers=user_token_headers,
        json={
            "title": "New Script",
            "description": "New Description",
            "genre": "comedy",
        },
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["title"] == "New Script"
    assert data["description"] == "New Description"
    assert data["genre"] == "comedy"
    assert data["status"] == "draft"


@pytest.mark.asyncio
async def test_read_scripts(
    client: AsyncClient,
    user_token_headers: dict[str, str],
    test_script: Script,
) -> None:
    """测试获取剧本列表."""
    response = await client.get(
        "/api/v1/scripts",
        headers=user_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == test_script.title


@pytest.mark.asyncio
async def test_read_script(
    client: AsyncClient,
    user_token_headers: dict[str, str],
    test_script: Script,
) -> None:
    """测试获取剧本详情."""
    response = await client.get(
        f"/api/v1/scripts/{test_script.id}",
        headers=user_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["title"] == test_script.title
    assert data["description"] == test_script.description
    assert data["content"] == test_script.content


@pytest.mark.asyncio
async def test_update_script(
    client: AsyncClient,
    user_token_headers: dict[str, str],
    test_script: Script,
) -> None:
    """测试更新剧本."""
    response = await client.put(
        f"/api/v1/scripts/{test_script.id}",
        headers=user_token_headers,
        json={
            "title": "Updated Title",
            "description": "Updated Description",
        },
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["title"] == "Updated Title"
    assert data["description"] == "Updated Description"


@pytest.mark.asyncio
async def test_delete_script(
    client: AsyncClient,
    user_token_headers: dict[str, str],
    test_script: Script,
) -> None:
    """测试删除剧本."""
    response = await client.delete(
        f"/api/v1/scripts/{test_script.id}",
        headers=user_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["title"] == test_script.title


@pytest.mark.asyncio
async def test_generate_script_content(
    client: AsyncClient,
    user_token_headers: dict[str, str],
    test_script: Script,
) -> None:
    """测试生成剧本内容."""
    response = await client.post(
        f"/api/v1/scripts/{test_script.id}/generate",
        headers=user_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK


@pytest.mark.asyncio
async def test_optimize_script_content(
    client: AsyncClient,
    user_token_headers: dict[str, str],
    test_script: Script,
) -> None:
    """测试优化剧本内容."""
    response = await client.post(
        f"/api/v1/scripts/{test_script.id}/optimize",
        headers=user_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK 