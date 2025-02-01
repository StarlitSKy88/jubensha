"""用户流程端到端测试."""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

async def test_user_registration_flow(
    client: AsyncClient,
    db: AsyncSession
):
    """测试用户注册流程."""
    # 1. 注册新用户
    register_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "password123"
    }
    response = await client.post(
        "/api/v1/auth/register",
        json=register_data
    )
    assert response.status_code == 200
    verification_token = response.json()["access_token"]
    
    # 2. 验证邮箱
    response = await client.get(
        f"/api/v1/auth/verify-email/{verification_token}"
    )
    assert response.status_code == 200
    
    # 3. 登录
    response = await client.post(
        "/api/v1/auth/login",
        data={
            "username": register_data["username"],
            "password": register_data["password"]
        }
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 4. 更新个人资料
    profile_data = {
        "nickname": "Test User",
        "bio": "This is a test user",
        "location": "Test City",
        "website": "https://example.com",
        "gender": "other"
    }
    response = await client.put(
        "/api/v1/profiles/me/profile",
        headers=headers,
        json=profile_data
    )
    assert response.status_code == 200
    assert response.json()["nickname"] == profile_data["nickname"]
    
    # 5. 上传头像
    with open("tests/fixtures/test_avatar.jpg", "rb") as f:
        response = await client.post(
            "/api/v1/profiles/me/avatar",
            headers=headers,
            files={"file": ("avatar.jpg", f, "image/jpeg")}
        )
    assert response.status_code == 200
    assert response.json()["avatar_url"] is not None
    
    # 6. 更新设置
    settings_data = {
        "language": "en-US",
        "timezone": "UTC",
        "theme": "dark"
    }
    response = await client.put(
        "/api/v1/profiles/me/settings",
        headers=headers,
        json=settings_data
    )
    assert response.status_code == 200
    assert response.json()["language"] == settings_data["language"]
    
    # 7. 上传文件
    with open("tests/fixtures/test_file.txt", "rb") as f:
        response = await client.post(
            "/api/v1/files/upload",
            headers=headers,
            files={"file": ("test.txt", f, "text/plain")}
        )
    assert response.status_code == 200
    file_url = response.json()["url"]
    
    # 8. 获取文件
    response = await client.get(
        file_url.replace("/uploads", "/api/v1/files")
    )
    assert response.status_code == 200
    
    # 9. 登出
    response = await client.post(
        "/api/v1/auth/logout",
        headers=headers
    )
    assert response.status_code == 200
    
    # 10. 验证登出后无法访问
    response = await client.get(
        "/api/v1/profiles/me/profile",
        headers=headers
    )
    assert response.status_code == 401

async def test_password_reset_flow(
    client: AsyncClient,
    db: AsyncSession
):
    """测试密码重置流程."""
    # 1. 请求重置密码
    response = await client.post(
        "/api/v1/auth/forgot-password",
        json={"email": "test@example.com"}
    )
    assert response.status_code == 200
    
    # 2. 获取重置令牌（在实际场景中是通过邮件获取）
    reset_token = response.json()["reset_token"]
    
    # 3. 重置密码
    new_password = "newpassword123"
    response = await client.post(
        f"/api/v1/auth/reset-password/{reset_token}",
        json={
            "new_password": new_password,
            "confirm_password": new_password
        }
    )
    assert response.status_code == 200
    
    # 4. 使用新密码登录
    response = await client.post(
        "/api/v1/auth/login",
        data={
            "username": "test@example.com",
            "password": new_password
        }
    )
    assert response.status_code == 200
    assert "access_token" in response.json()

@pytest.mark.performance
async def test_concurrent_file_uploads(
    client: AsyncClient,
    admin_token: str,
    tmp_path
):
    """测试并发文件上传."""
    # 创建测试文件
    test_file = tmp_path / "test.txt"
    test_file.write_text("test content")
    
    # 并发上传10个文件
    headers = {"Authorization": f"Bearer {admin_token}"}
    tasks = []
    for i in range(10):
        with open(test_file, "rb") as f:
            task = client.post(
                "/api/v1/files/upload",
                headers=headers,
                files={"file": (f"test_{i}.txt", f, "text/plain")}
            )
            tasks.append(task)
            
    responses = await asyncio.gather(*tasks)
    assert all(r.status_code == 200 for r in responses)

@pytest.mark.performance
async def test_concurrent_profile_updates(
    client: AsyncClient,
    admin_token: str
):
    """测试并发资料更新."""
    headers = {"Authorization": f"Bearer {admin_token}"}
    tasks = []
    for i in range(10):
        profile_data = {
            "nickname": f"User {i}",
            "bio": f"Bio {i}"
        }
        task = client.put(
            "/api/v1/profiles/me/profile",
            headers=headers,
            json=profile_data
        )
        tasks.append(task)
        
    responses = await asyncio.gather(*tasks)
    assert all(r.status_code == 200 for r in responses) 