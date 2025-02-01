"""用户资料API测试."""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from scriptai.models.profile import UserProfile, UserSettings
from scriptai.models.user import User

async def test_get_my_profile(
    client: AsyncClient,
    admin_token: str,
    db: AsyncSession
):
    """测试获取个人资料."""
    # 未认证访问
    response = await client.get("/api/v1/profiles/me/profile")
    assert response.status_code == 401
    
    # 认证访问
    response = await client.get(
        "/api/v1/profiles/me/profile",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert "user_id" in data

async def test_update_my_profile(
    client: AsyncClient,
    admin_token: str,
    db: AsyncSession
):
    """测试更新个人资料."""
    profile_data = {
        "nickname": "测试昵称",
        "bio": "测试简介",
        "location": "测试地点",
        "website": "https://example.com",
        "gender": "male"
    }
    
    # 未认证访问
    response = await client.put(
        "/api/v1/profiles/me/profile",
        json=profile_data
    )
    assert response.status_code == 401
    
    # 认证访问
    response = await client.put(
        "/api/v1/profiles/me/profile",
        headers={"Authorization": f"Bearer {admin_token}"},
        json=profile_data
    )
    assert response.status_code == 200
    data = response.json()
    assert data["nickname"] == profile_data["nickname"]
    assert data["bio"] == profile_data["bio"]
    assert data["location"] == profile_data["location"]
    assert data["website"] == profile_data["website"]
    assert data["gender"] == profile_data["gender"]

async def test_upload_avatar(
    client: AsyncClient,
    admin_token: str,
    db: AsyncSession,
    tmp_path
):
    """测试上传头像."""
    # 创建测试图片
    image_path = tmp_path / "test.jpg"
    image_path.write_bytes(b"fake image content")
    
    # 未认证访问
    with open(image_path, "rb") as f:
        response = await client.post(
            "/api/v1/profiles/me/avatar",
            files={"file": ("test.jpg", f, "image/jpeg")}
        )
    assert response.status_code == 401
    
    # 认证访问
    with open(image_path, "rb") as f:
        response = await client.post(
            "/api/v1/profiles/me/avatar",
            headers={"Authorization": f"Bearer {admin_token}"},
            files={"file": ("test.jpg", f, "image/jpeg")}
        )
    assert response.status_code == 200
    data = response.json()
    assert data["avatar_url"] is not None
    
    # 不支持的文件格式
    with open(image_path, "rb") as f:
        response = await client.post(
            "/api/v1/profiles/me/avatar",
            headers={"Authorization": f"Bearer {admin_token}"},
            files={"file": ("test.txt", f, "text/plain")}
        )
    assert response.status_code == 400

async def test_get_my_settings(
    client: AsyncClient,
    admin_token: str,
    db: AsyncSession
):
    """测试获取个人设置."""
    # 未认证访问
    response = await client.get("/api/v1/profiles/me/settings")
    assert response.status_code == 401
    
    # 认证访问
    response = await client.get(
        "/api/v1/profiles/me/settings",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert "user_id" in data
    assert "language" in data
    assert "timezone" in data

async def test_update_my_settings(
    client: AsyncClient,
    admin_token: str,
    db: AsyncSession
):
    """测试更新个人设置."""
    settings_data = {
        "language": "en-US",
        "timezone": "UTC",
        "notification_email": False,
        "notification_web": True,
        "theme": "dark"
    }
    
    # 未认证访问
    response = await client.put(
        "/api/v1/profiles/me/settings",
        json=settings_data
    )
    assert response.status_code == 401
    
    # 认证访问
    response = await client.put(
        "/api/v1/profiles/me/settings",
        headers={"Authorization": f"Bearer {admin_token}"},
        json=settings_data
    )
    assert response.status_code == 200
    data = response.json()
    assert data["language"] == settings_data["language"]
    assert data["timezone"] == settings_data["timezone"]
    assert data["notification_email"] == settings_data["notification_email"]
    assert data["notification_web"] == settings_data["notification_web"]
    assert data["theme"] == settings_data["theme"]

async def test_get_user_profile(
    client: AsyncClient,
    admin_user: User,
    db: AsyncSession
):
    """测试获取用户资料."""
    # 创建测试资料
    profile = UserProfile(
        user_id=admin_user.id,
        nickname="测试用户",
        bio="测试简介"
    )
    db.add(profile)
    await db.commit()
    
    # 获取存在的资料
    response = await client.get(f"/api/v1/profiles/users/{admin_user.id}/profile")
    assert response.status_code == 200
    data = response.json()
    assert data["nickname"] == "测试用户"
    assert data["bio"] == "测试简介"
    
    # 获取不存在的资料
    response = await client.get("/api/v1/profiles/users/non-exist/profile")
    assert response.status_code == 404 