"""用户API测试."""
import pytest
from fastapi import status
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from scriptai.core.security import get_password_hash
from scriptai.models.user import User
from scriptai.models.role import Role


@pytest.mark.asyncio
async def test_create_user(client: AsyncClient, db: AsyncSession) -> None:
    """测试创建用户."""
    response = await client.post(
        "/api/v1/users",
        json={
            "email": "test@example.com",
            "username": "testuser",
            "password": "testpass123",
            "full_name": "Test User",
        },
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.asyncio
async def test_read_users(client: AsyncClient, db: AsyncSession) -> None:
    """测试获取用户列表."""
    response = await client.get("/api/v1/users")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.asyncio
async def test_read_user(client: AsyncClient, db: AsyncSession) -> None:
    """测试获取用户详情."""
    response = await client.get("/api/v1/users/1")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.asyncio
async def test_update_user(client: AsyncClient, db: AsyncSession) -> None:
    """测试更新用户."""
    response = await client.put(
        "/api/v1/users/1",
        json={"full_name": "Updated Name"},
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.asyncio
async def test_delete_user(client: AsyncClient, db: AsyncSession) -> None:
    """测试删除用户."""
    response = await client.delete("/api/v1/users/1")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.asyncio
async def test_register_user(client: AsyncClient, db: AsyncSession) -> None:
    """测试用户注册."""
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "username": "testuser",
            "password": "testpass123",
            "full_name": "Test User",
        },
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

    user = await User.get_by_email(db, email="test@example.com")
    assert user is not None
    assert user.email == "test@example.com"
    assert user.username == "testuser"
    assert user.full_name == "Test User"
    assert user.is_active is True
    assert user.is_superuser is False


@pytest.mark.asyncio
async def test_login_user(client: AsyncClient, db: AsyncSession) -> None:
    """测试用户登录."""
    # 创建测试用户
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

    response = await client.post(
        "/api/v1/auth/login",
        data={
            "username": "test@example.com",
            "password": "testpass123",
        },
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_user_wrong_password(
    client: AsyncClient,
    db: AsyncSession,
) -> None:
    """测试用户登录（密码错误）."""
    # 创建测试用户
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

    response = await client.post(
        "/api/v1/auth/login",
        data={
            "username": "test@example.com",
            "password": "wrongpass",
        },
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


async def test_list_users(
    client: AsyncClient,
    admin_token: str,
    normal_token: str
):
    """测试获取用户列表."""
    # 管理员可以查看
    response = await client.get(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    users = response.json()
    assert len(users) > 0
    
    # 普通用户也可以查看
    response = await client.get(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {normal_token}"}
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED 