"""角色管理API测试."""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from scriptai.models.role import Role, Permission
from scriptai.models.user import User
from scriptai.core.security import get_password_hash

@pytest.fixture
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
        Permission(name="role:write", description="修改角色")
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

@pytest.fixture
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
        Permission(name="role:read", description="查看角色")
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

async def test_list_roles(
    client: AsyncClient,
    admin_token: str,
    normal_token: str
):
    """测试获取角色列表."""
    # 管理员可以查看
    response = await client.get(
        "/api/v1/roles",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    roles = response.json()
    assert len(roles) > 0
    
    # 普通用户也可以查看
    response = await client.get(
        "/api/v1/roles",
        headers={"Authorization": f"Bearer {normal_token}"}
    )
    assert response.status_code == 200

async def test_create_role(
    client: AsyncClient,
    admin_token: str,
    normal_token: str,
    db: AsyncSession
):
    """测试创建角色."""
    # 获取权限列表
    query = await db.execute(select(Permission))
    permissions = query.scalars().all()
    permission_ids = [str(p.id) for p in permissions[:2]]
    
    role_data = {
        "name": "test_role",
        "description": "测试角色",
        "permission_ids": permission_ids
    }
    
    # 管理员可以创建
    response = await client.post(
        "/api/v1/roles",
        headers={"Authorization": f"Bearer {admin_token}"},
        json=role_data
    )
    assert response.status_code == 200
    role = response.json()
    assert role["name"] == role_data["name"]
    assert len(role["permissions"]) == 2
    
    # 普通用户不能创建
    response = await client.post(
        "/api/v1/roles",
        headers={"Authorization": f"Bearer {normal_token}"},
        json=role_data
    )
    assert response.status_code == 403

async def test_update_role(
    client: AsyncClient,
    admin_token: str,
    normal_token: str,
    db: AsyncSession
):
    """测试更新角色."""
    # 创建测试角色
    role = Role(name="update_test", description="更新测试")
    db.add(role)
    await db.commit()
    await db.refresh(role)
    
    update_data = {
        "name": "updated_role",
        "description": "已更新"
    }
    
    # 管理员可以更新
    response = await client.put(
        f"/api/v1/roles/{role.id}",
        headers={"Authorization": f"Bearer {admin_token}"},
        json=update_data
    )
    assert response.status_code == 200
    updated = response.json()
    assert updated["name"] == update_data["name"]
    
    # 普通用户不能更新
    response = await client.put(
        f"/api/v1/roles/{role.id}",
        headers={"Authorization": f"Bearer {normal_token}"},
        json=update_data
    )
    assert response.status_code == 403

async def test_delete_role(
    client: AsyncClient,
    admin_token: str,
    normal_token: str,
    db: AsyncSession
):
    """测试删除角色."""
    # 创建测试角色
    role = Role(name="delete_test", description="删除测试")
    db.add(role)
    await db.commit()
    await db.refresh(role)
    
    # 普通用户不能删除
    response = await client.delete(
        f"/api/v1/roles/{role.id}",
        headers={"Authorization": f"Bearer {normal_token}"}
    )
    assert response.status_code == 403
    
    # 管理员可以删除
    response = await client.delete(
        f"/api/v1/roles/{role.id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    
    # 验证删除
    query = await db.execute(select(Role).where(Role.id == role.id))
    assert query.scalar_one_or_none() is None 