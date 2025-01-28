import pytest
from datetime import datetime, timedelta
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
import jwt

from auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user,
    authenticate_user,
    get_user_by_username,
    create_new_user
)
from models import User

@pytest.fixture
async def test_user(db: AsyncSession):
    """创建测试用户"""
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpassword"
    }
    user = await create_new_user(db, user_data)
    return user

@pytest.mark.asyncio
async def test_password_hash():
    """测试密码哈希"""
    password = "testpassword"
    hashed = get_password_hash(password)
    assert verify_password(password, hashed)
    assert not verify_password("wrongpassword", hashed)

@pytest.mark.asyncio
async def test_create_access_token():
    """测试创建访问令牌"""
    data = {"sub": "testuser"}
    token = create_access_token(data)
    assert isinstance(token, str)
    
    # 验证令牌
    payload = jwt.decode(
        token,
        "your-secret-key-here",
        algorithms=["HS256"]
    )
    assert payload["sub"] == "testuser"
    assert "exp" in payload

@pytest.mark.asyncio
async def test_get_current_user(db: AsyncSession, test_user: User):
    """测试获取当前用户"""
    token = create_access_token({"sub": test_user.username})
    user = await get_current_user(token, db)
    assert user.id == test_user.id
    assert user.username == test_user.username
    
    # 测试无效令牌
    with pytest.raises(HTTPException) as exc:
        await get_current_user("invalid_token", db)
    assert exc.value.status_code == 401

@pytest.mark.asyncio
async def test_authenticate_user(db: AsyncSession, test_user: User):
    """测试用户认证"""
    # 正确认证
    user = await authenticate_user(
        db,
        test_user.username,
        "testpassword"
    )
    assert user is not None
    assert user.id == test_user.id
    
    # 错误密码
    user = await authenticate_user(
        db,
        test_user.username,
        "wrongpassword"
    )
    assert user is None
    
    # 不存在的用户
    user = await authenticate_user(
        db,
        "nonexistent",
        "password"
    )
    assert user is None

@pytest.mark.asyncio
async def test_get_user_by_username(db: AsyncSession, test_user: User):
    """测试通过用户名获取用户"""
    user = await get_user_by_username(db, test_user.username)
    assert user is not None
    assert user.id == test_user.id
    
    user = await get_user_by_username(db, "nonexistent")
    assert user is None

@pytest.mark.asyncio
async def test_create_new_user(db: AsyncSession):
    """测试创建新用户"""
    user_data = {
        "username": "newuser",
        "email": "new@example.com",
        "password": "newpassword"
    }
    user = await create_new_user(db, user_data)
    assert user.username == user_data["username"]
    assert user.email == user_data["email"]
    assert verify_password(user_data["password"], user.password_hash)
    
    # 测试重复用户名
    with pytest.raises(Exception):
        await create_new_user(db, user_data) 