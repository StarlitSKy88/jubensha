"""测试配置."""
import asyncio
from typing import AsyncGenerator, Generator

import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from scriptai.config import settings
from scriptai.db.base import Base
from scriptai.main import app
from scriptai.models.role import Role, Permission
from scriptai.models.user import User
from scriptai.core.security import create_access_token, get_password_hash

# 测试数据库URL
TEST_DATABASE_URL = settings.DATABASE_URL + "_test"

# 创建测试引擎
engine = create_async_engine(TEST_DATABASE_URL, echo=True)

# 创建测试会话
TestingSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """创建事件循环."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest_asyncio.fixture(scope="function")
async def db() -> AsyncGenerator[AsyncSession, None]:
    """创建数据库会话."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
        
    async with TestingSessionLocal() as session:
        yield session
        await session.rollback()

@pytest_asyncio.fixture(scope="function")
async def client(db: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """创建测试客户端."""
    async with AsyncClient(
        app=app,
        base_url="http://test"
    ) as client:
        yield client

@pytest_asyncio.fixture(scope="function")
async def admin_user(db: AsyncSession) -> User:
    """创建管理员用户."""
    # 创建管理员角色
    admin_role = Role(
        name="admin",
        description="管理员",
        is_system=True
    )
    db.add(admin_role)
    
    # 创建所有权限
    permissions = [
        Permission(name="user:read", description="查看用户"),
        Permission(name="user:write", description="修改用户"),
        Permission(name="role:read", description="查看角色"),
        Permission(name="role:write", description="修改角色"),
        Permission(name="permission:read", description="查看权限"),
        Permission(name="permission:write", description="修改权限")
    ]
    for permission in permissions:
        db.add(permission)
    
    # 分配所有权限给管理员
    admin_role.permissions = permissions
    
    # 创建管理员用户
    admin = User(
        username="admin",
        email="admin@example.com",
        password_hash=get_password_hash("admin123"),
        is_active=True,
        is_superuser=True
    )
    admin.roles = [admin_role]
    
    db.add(admin)
    await db.commit()
    await db.refresh(admin)
    
    return admin

@pytest_asyncio.fixture(scope="function")
async def normal_user(db: AsyncSession) -> User:
    """创建普通用户."""
    # 创建普通用户角色
    user_role = Role(
        name="user",
        description="普通用户",
        is_system=True
    )
    db.add(user_role)
    
    # 创建只读权限
    read_permissions = [
        Permission(name="user:read", description="查看用户"),
        Permission(name="role:read", description="查看角色"),
        Permission(name="permission:read", description="查看权限")
    ]
    for permission in read_permissions:
        db.add(permission)
    
    # 分配只读权限给普通用户
    user_role.permissions = read_permissions
    
    # 创建普通用户
    user = User(
        username="test_user",
        email="test@example.com",
        password_hash=get_password_hash("test123"),
        is_active=True
    )
    user.roles = [user_role]
    
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    return user

@pytest.fixture
def admin_token(admin_user: User) -> str:
    """创建管理员token."""
    return create_access_token(
        data={"sub": admin_user.email}
    )

@pytest.fixture
def normal_token(normal_user: User) -> str:
    """创建普通用户token."""
    return create_access_token(
        data={"sub": normal_user.email}
    ) 