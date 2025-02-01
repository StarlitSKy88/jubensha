"""文件服务API测试."""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from scriptai.models.user import User

async def test_upload_file(
    client: AsyncClient,
    admin_token: str,
    admin_user: User,
    db: AsyncSession,
    tmp_path
):
    """测试上传文件."""
    # 创建测试文件
    test_file = tmp_path / "test.txt"
    test_file.write_text("test content")
    
    # 未认证访问
    with open(test_file, "rb") as f:
        response = await client.post(
            "/api/v1/files/upload",
            files={"file": ("test.txt", f, "text/plain")}
        )
    assert response.status_code == 401
    
    # 认证访问 - 默认路径
    with open(test_file, "rb") as f:
        response = await client.post(
            "/api/v1/files/upload",
            headers={"Authorization": f"Bearer {admin_token}"},
            files={"file": ("test.txt", f, "text/plain")}
        )
    assert response.status_code == 200
    data = response.json()
    assert "url" in data
    assert data["url"].startswith("/uploads/files/")
    assert data["url"].endswith("/test.txt")
    
    # 认证访问 - 指定路径
    with open(test_file, "rb") as f:
        response = await client.post(
            "/api/v1/files/upload",
            headers={"Authorization": f"Bearer {admin_token}"},
            files={"file": ("test.txt", f, "text/plain")},
            data={"path": "custom/path/test.txt"}
        )
    assert response.status_code == 200
    data = response.json()
    assert data["url"] == "/uploads/custom/path/test.txt"

async def test_get_file(
    client: AsyncClient,
    admin_token: str,
    admin_user: User,
    db: AsyncSession,
    tmp_path
):
    """测试获取文件."""
    # 创建并上传测试文件
    test_file = tmp_path / "test.txt"
    test_file.write_text("test content")
    
    with open(test_file, "rb") as f:
        response = await client.post(
            "/api/v1/files/upload",
            headers={"Authorization": f"Bearer {admin_token}"},
            files={"file": ("test.txt", f, "text/plain")}
        )
    assert response.status_code == 200
    file_url = response.json()["url"]
    file_path = file_url.replace("/uploads/", "")
    
    # 获取存在的文件
    response = await client.get(f"/api/v1/files/{file_path}")
    assert response.status_code == 200
    assert response.content == b"test content"
    
    # 获取不存在的文件
    response = await client.get("/api/v1/files/non-exist.txt")
    assert response.status_code == 404

async def test_delete_file(
    client: AsyncClient,
    admin_token: str,
    admin_user: User,
    db: AsyncSession,
    tmp_path
):
    """测试删除文件."""
    # 创建并上传测试文件
    test_file = tmp_path / "test.txt"
    test_file.write_text("test content")
    
    with open(test_file, "rb") as f:
        response = await client.post(
            "/api/v1/files/upload",
            headers={"Authorization": f"Bearer {admin_token}"},
            files={"file": ("test.txt", f, "text/plain")}
        )
    assert response.status_code == 200
    file_url = response.json()["url"]
    file_path = file_url.replace("/uploads/", "")
    
    # 未认证访问
    response = await client.delete(f"/api/v1/files/{file_path}")
    assert response.status_code == 401
    
    # 删除其他用户的文件
    response = await client.delete(
        "/api/v1/files/other_user/test.txt",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 403
    
    # 删除自己的文件
    response = await client.delete(
        f"/api/v1/files/{file_path}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    
    # 删除不存在的文件
    response = await client.delete(
        f"/api/v1/files/{file_path}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 404 