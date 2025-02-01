"""知识库管理API测试."""
import json
from datetime import datetime, timedelta
from typing import Dict, List

import pytest
from fastapi import status
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from scriptai.core.security import get_password_hash
from scriptai.crud import knowledge as crud_knowledge
from scriptai.models.user import User
from scriptai.services.rag.service import rag_service


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
async def test_document(
    client: AsyncClient,
    superuser_token_headers: Dict[str, str],
    db: AsyncSession,
) -> Dict[str, Any]:
    """创建测试文档."""
    response = await client.post(
        "/api/v1/knowledge/documents",
        headers=superuser_token_headers,
        json={
            "content": "测试文档内容",
            "metadata": {"type": "test"},
            "comment": "初始版本",
        },
    )
    data = response.json()
    return {
        "id": data["id"],
        "content": "测试文档内容",
        "metadata": {"type": "test"},
    }


@pytest.mark.asyncio
async def test_get_document_versions(
    client: AsyncClient,
    superuser_token_headers: Dict[str, str],
    test_document: Dict[str, Any],
) -> None:
    """测试获取文档版本列表."""
    response = await client.get(
        f"/api/v1/knowledge/versions/{test_document['id']}",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 1
    assert data[0]["version"] == 1
    assert data[0]["content"] == test_document["content"]
    assert data[0]["metadata"] == test_document["metadata"]
    assert data[0]["comment"] == "初始版本"


@pytest.mark.asyncio
async def test_get_document_version(
    client: AsyncClient,
    superuser_token_headers: Dict[str, str],
    test_document: Dict[str, Any],
) -> None:
    """测试获取文档特定版本."""
    response = await client.get(
        f"/api/v1/knowledge/versions/{test_document['id']}/1",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["version"] == 1
    assert data["content"] == test_document["content"]
    assert data["metadata"] == test_document["metadata"]
    assert data["comment"] == "初始版本"


@pytest.mark.asyncio
async def test_get_nonexistent_version(
    client: AsyncClient,
    superuser_token_headers: Dict[str, str],
    test_document: Dict[str, Any],
) -> None:
    """测试获取不存在的文档版本."""
    response = await client.get(
        f"/api/v1/knowledge/versions/{test_document['id']}/999",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert "文档版本不存在" in response.json()["detail"]


@pytest.mark.asyncio
async def test_get_document_changes(
    client: AsyncClient,
    superuser_token_headers: Dict[str, str],
    test_document: Dict[str, Any],
) -> None:
    """测试获取文档变更记录列表."""
    response = await client.get(
        f"/api/v1/knowledge/changes/{test_document['id']}",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 1
    assert data[0]["from_version"] == 0
    assert data[0]["to_version"] == 1
    assert data[0]["change_type"] == "create"


@pytest.mark.asyncio
async def test_get_changes_by_date(
    client: AsyncClient,
    superuser_token_headers: Dict[str, str],
    test_document: Dict[str, Any],
) -> None:
    """测试获取指定时间范围内的变更记录列表."""
    now = datetime.utcnow()
    start_date = (now - timedelta(days=1)).isoformat()
    end_date = (now + timedelta(days=1)).isoformat()

    response = await client.get(
        "/api/v1/knowledge/changes",
        headers=superuser_token_headers,
        params={
            "start_date": start_date,
            "end_date": end_date,
        },
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 1
    assert data[0]["document_id"] == test_document["id"]
    assert data[0]["change_type"] == "create"


@pytest.mark.asyncio
async def test_version_control_with_import(
    client: AsyncClient,
    superuser_token_headers: Dict[str, str],
    db: AsyncSession,
) -> None:
    """测试导入文档时的版本控制."""
    # 准备测试数据
    documents = [
        {
            "content": "文档1",
            "metadata": {"type": "test1"},
        },
        {
            "content": "文档2",
            "metadata": {"type": "test2"},
        },
    ]
    content = json.dumps(documents, ensure_ascii=False)

    # 导入文档
    response = await client.post(
        "/api/v1/knowledge/documents/import",
        headers=superuser_token_headers,
        files={"file": ("documents.json", content.encode(), "application/json")},
        params={
            "format": "json",
            "comment": "批量导入",
        },
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["total"] == 2
    assert data["success"] == 2

    # 验证版本记录
    for doc in documents:
        # 获取文档ID
        results = await crud_knowledge.get_document_changes_by_date(
            db,
            start_date=datetime.utcnow() - timedelta(minutes=1),
            end_date=datetime.utcnow(),
        )
        doc_id = None
        for result in results:
            if result.details.get("metadata", {}).get("type") == doc["metadata"]["type"]:
                doc_id = result.document_id
                break
        assert doc_id is not None

        # 验证版本
        versions = await crud_knowledge.get_document_versions(
            db,
            document_id=doc_id,
        )
        assert len(versions) == 1
        assert versions[0].version == 1
        assert versions[0].content == doc["content"]
        assert versions[0].metadata == doc["metadata"]
        assert versions[0].comment == "批量导入"

        # 验证变更记录
        changes = await crud_knowledge.get_document_changes(
            db,
            document_id=doc_id,
        )
        assert len(changes) == 1
        assert changes[0].from_version == 0
        assert changes[0].to_version == 1
        assert changes[0].change_type == "create"


@pytest.fixture
async def test_documents() -> List[Dict[str, str]]:
    """创建测试文档."""
    return [
        {
            "content": "测试文档1",
            "metadata": {"type": "test1", "author": "tester1"},
        },
        {
            "content": "测试文档2",
            "metadata": {"type": "test2", "author": "tester2"},
        },
    ]


@pytest.mark.asyncio
async def test_import_documents_json(
    client: AsyncClient,
    superuser_token_headers: Dict[str, str],
    test_documents: List[Dict[str, str]],
) -> None:
    """测试导入JSON格式文档."""
    # 准备JSON文件内容
    content = json.dumps(test_documents, ensure_ascii=False)

    # 导入文档
    response = await client.post(
        "/api/v1/knowledge/documents/import",
        headers=superuser_token_headers,
        files={"file": ("documents.json", content.encode(), "application/json")},
        params={"format": "json"},
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "success"
    assert data["total"] == 2
    assert data["success"] == 2


@pytest.mark.asyncio
async def test_import_documents_csv(
    client: AsyncClient,
    superuser_token_headers: Dict[str, str],
) -> None:
    """测试导入CSV格式文档."""
    # 准备CSV文件内容
    content = "content,type,author\n测试文档1,test1,tester1\n测试文档2,test2,tester2"

    # 导入文档
    response = await client.post(
        "/api/v1/knowledge/documents/import",
        headers=superuser_token_headers,
        files={"file": ("documents.csv", content.encode(), "text/csv")},
        params={"format": "csv"},
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "success"
    assert data["total"] == 2
    assert data["success"] == 2


@pytest.mark.asyncio
async def test_export_documents_json(
    client: AsyncClient,
    superuser_token_headers: Dict[str, str],
    test_documents: List[Dict[str, str]],
) -> None:
    """测试导出JSON格式文档."""
    # 先添加一些文档
    for doc in test_documents:
        await client.post(
            "/api/v1/knowledge/documents",
            headers=superuser_token_headers,
            json={
                "content": doc["content"],
                "metadata": doc["metadata"],
            },
        )

    # 导出文档
    response = await client.get(
        "/api/v1/knowledge/documents/export",
        headers=superuser_token_headers,
        params={"format": "json"},
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.headers["content-type"] == "application/json"
    assert response.headers["content-disposition"] == 'attachment; filename="documents.json"'

    # 验证导出内容
    data = response.json()
    assert len(data) == 2
    assert all("content" in doc for doc in data)
    assert all("metadata" in doc for doc in data)


@pytest.mark.asyncio
async def test_export_documents_csv(
    client: AsyncClient,
    superuser_token_headers: Dict[str, str],
    test_documents: List[Dict[str, str]],
) -> None:
    """测试导出CSV格式文档."""
    # 先添加一些文档
    for doc in test_documents:
        await client.post(
            "/api/v1/knowledge/documents",
            headers=superuser_token_headers,
            json={
                "content": doc["content"],
                "metadata": doc["metadata"],
            },
        )

    # 导出文档
    response = await client.get(
        "/api/v1/knowledge/documents/export",
        headers=superuser_token_headers,
        params={"format": "csv"},
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.headers["content-type"] == "text/csv"
    assert response.headers["content-disposition"] == 'attachment; filename="documents.csv"'

    # 验证导出内容
    content = response.text
    lines = content.strip().split("\n")
    assert len(lines) > 1  # 至少有表头和一行数据
    headers = lines[0].split(",")
    assert "content" in headers
    assert "type" in headers
    assert "author" in headers


@pytest.mark.asyncio
async def test_import_invalid_json(
    client: AsyncClient,
    superuser_token_headers: Dict[str, str],
) -> None:
    """测试导入无效的JSON文档."""
    # 准备无效的JSON内容
    content = "invalid json content"

    # 导入文档
    response = await client.post(
        "/api/v1/knowledge/documents/import",
        headers=superuser_token_headers,
        files={"file": ("invalid.json", content.encode(), "application/json")},
        params={"format": "json"},
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "JSON格式错误" in response.json()["detail"]


@pytest.mark.asyncio
async def test_import_invalid_csv(
    client: AsyncClient,
    superuser_token_headers: Dict[str, str],
) -> None:
    """测试导入无效的CSV文档."""
    # 准备无效的CSV内容（缺少必需的content列）
    content = "type,author\ntest1,tester1"

    # 导入文档
    response = await client.post(
        "/api/v1/knowledge/documents/import",
        headers=superuser_token_headers,
        files={"file": ("invalid.csv", content.encode(), "text/csv")},
        params={"format": "csv"},
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "CSV必须包含content列" in response.json()["detail"]


@pytest.mark.asyncio
async def test_import_unsupported_format(
    client: AsyncClient,
    superuser_token_headers: Dict[str, str],
) -> None:
    """测试导入不支持的格式."""
    content = "some content"
    response = await client.post(
        "/api/v1/knowledge/documents/import",
        headers=superuser_token_headers,
        files={"file": ("test.txt", content.encode(), "text/plain")},
        params={"format": "txt"},
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "不支持的导入格式" in response.json()["detail"]


@pytest.mark.asyncio
async def test_export_unsupported_format(
    client: AsyncClient,
    superuser_token_headers: Dict[str, str],
) -> None:
    """测试导出不支持的格式."""
    response = await client.get(
        "/api/v1/knowledge/documents/export",
        headers=superuser_token_headers,
        params={"format": "txt"},
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "不支持的导出格式" in response.json()["detail"]


@pytest.mark.asyncio
async def test_get_knowledge_stats(
    client: AsyncClient,
    superuser_token_headers: dict[str, str],
) -> None:
    """测试获取知识库统计信息."""
    response = await client.get(
        "/api/v1/knowledge/stats",
        headers=superuser_token_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "total_documents" in data
    assert "type_counts" in data
    assert "last_updated" in data
    assert "storage_size" in data


@pytest.mark.asyncio
async def test_add_document(
    client: AsyncClient,
    superuser_token_headers: dict[str, str],
) -> None:
    """测试添加文档."""
    response = await client.post(
        "/api/v1/knowledge/documents",
        headers=superuser_token_headers,
        json={
            "content": "这是一个测试文档",
            "metadata": {
                "type": "test",
                "author": "tester",
            },
        },
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "success"
    assert "id" in data


@pytest.mark.asyncio
async def test_add_documents_batch(
    client: AsyncClient,
    superuser_token_headers: dict[str, str],
) -> None:
    """测试批量添加文档."""
    response = await client.post(
        "/api/v1/knowledge/documents/batch",
        headers=superuser_token_headers,
        json={
            "documents": [
                {
                    "content": "文档1",
                    "metadata": {"type": "test1"},
                },
                {
                    "content": "文档2",
                    "metadata": {"type": "test2"},
                },
            ],
        },
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "success"
    assert data["total"] == 2
    assert data["success"] == 2


@pytest.mark.asyncio
async def test_upload_document(
    client: AsyncClient,
    superuser_token_headers: dict[str, str],
) -> None:
    """测试上传文档文件."""
    content = "这是一个测试文档的内容"
    response = await client.post(
        "/api/v1/knowledge/documents/upload",
        headers=superuser_token_headers,
        files={"file": ("test.txt", content.encode(), "text/plain")},
        params={"type": "test"},
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "success"
    assert "id" in data


@pytest.mark.asyncio
async def test_search_documents(
    client: AsyncClient,
    superuser_token_headers: dict[str, str],
) -> None:
    """测试搜索文档."""
    # 先添加一些文档
    await client.post(
        "/api/v1/knowledge/documents",
        headers=superuser_token_headers,
        json={
            "content": "这是一个测试文档",
            "metadata": {"type": "test"},
        },
    )

    # 搜索文档
    response = await client.get(
        "/api/v1/knowledge/search",
        headers=superuser_token_headers,
        params={
            "query": "测试",
            "limit": 5,
            "type": "test",
        },
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) > 0
    assert "content" in data[0]
    assert "score" in data[0]
    assert "metadata" in data[0]


@pytest.mark.asyncio
async def test_get_writing_suggestions(
    client: AsyncClient,
    superuser_token_headers: dict[str, str],
) -> None:
    """测试获取写作建议."""
    response = await client.post(
        "/api/v1/knowledge/suggestions/writing",
        headers=superuser_token_headers,
        json={
            "context": "这是一个测试剧本",
            "query": "如何改进对话？",
        },
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "suggestion" in data


@pytest.mark.asyncio
async def test_get_character_suggestions(
    client: AsyncClient,
    superuser_token_headers: dict[str, str],
) -> None:
    """测试获取角色设计建议."""
    response = await client.post(
        "/api/v1/knowledge/suggestions/character",
        headers=superuser_token_headers,
        json={
            "description": "一个年轻的程序员",
        },
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "suggestion" in data


@pytest.mark.asyncio
async def test_get_plot_suggestions(
    client: AsyncClient,
    superuser_token_headers: dict[str, str],
) -> None:
    """测试获取情节设计建议."""
    response = await client.post(
        "/api/v1/knowledge/suggestions/plot",
        headers=superuser_token_headers,
        json={
            "description": "主角在工作中遇到困难",
        },
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "suggestion" in data


@pytest.mark.asyncio
async def test_get_dialogue_suggestions(
    client: AsyncClient,
    superuser_token_headers: dict[str, str],
) -> None:
    """测试获取对话优化建议."""
    response = await client.post(
        "/api/v1/knowledge/suggestions/dialogue",
        headers=superuser_token_headers,
        json={
            "dialogue": "A: 你好\nB: 你也好",
        },
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "suggestion" in data


@pytest.mark.asyncio
async def test_get_scene_suggestions(
    client: AsyncClient,
    superuser_token_headers: dict[str, str],
) -> None:
    """测试获取场景设计建议."""
    response = await client.post(
        "/api/v1/knowledge/suggestions/scene",
        headers=superuser_token_headers,
        json={
            "description": "一个繁忙的咖啡馆",
        },
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "suggestion" in data


@pytest.mark.asyncio
async def test_get_structure_analysis(
    client: AsyncClient,
    superuser_token_headers: dict[str, str],
) -> None:
    """测试获取剧本结构分析."""
    response = await client.post(
        "/api/v1/knowledge/analysis/structure",
        headers=superuser_token_headers,
        json={
            "content": "这是一个测试剧本的内容",
        },
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "analysis" in data 