# 知识库管理接口

## 创建知识条目

在指定项目中创建新的知识条目。

```http
POST /api/v1/projects/{project_id}/knowledge
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "知识标题",
  "content": "知识内容",
  "type": "plot_pattern",
  "category": "剧情模式",
  "summary": "内容摘要",
  "tags": ["悬疑", "反转"],
  "metadata": {
    "source": "来源",
    "author": "作者",
    "references": ["参考1", "参考2"]
  },
  "visibility": "public",
  "status": "active"
}
```

### 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 是 | 知识标题 |
| content | string | 是 | 知识内容 |
| type | string | 是 | 知识类型(plot_pattern/character_archetype/story_structure/dialogue_example/clue_design) |
| category | string | 是 | 分类 |
| summary | string | 否 | 内容摘要 |
| tags | string[] | 否 | 标签列表 |
| metadata | object | 否 | 元数据 |
| visibility | string | 否 | 可见性(public/private)，默认public |
| status | string | 否 | 状态(active/archived)，默认active |

### 响应示例

```json
{
  "success": true,
  "message": "创建成功",
  "data": {
    "id": "knowledge_id",
    "projectId": "project_id",
    "title": "知识标题",
    "content": "知识内容",
    "type": "plot_pattern",
    "category": "剧情模式",
    "summary": "内容摘要",
    "tags": ["悬疑", "反转"],
    "metadata": {
      "source": "来源",
      "author": "作者",
      "references": ["参考1", "参考2"]
    },
    "visibility": "public",
    "status": "active",
    "embedding": {
      "status": "processing",
      "progress": 0
    },
    "createdAt": "2024-02-08T10:00:00Z",
    "createdBy": "user_id"
  }
}
```

## 批量导入知识

批量导入知识条目。

```http
POST /api/v1/projects/{project_id}/knowledge/bulk-import
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "title": "知识1",
      "content": "内容1",
      "type": "plot_pattern",
      "category": "剧情模式",
      "tags": ["标签1"]
    },
    {
      "title": "知识2",
      "content": "内容2",
      "type": "character_archetype",
      "category": "角色原型",
      "tags": ["标签2"]
    }
  ],
  "options": {
    "skipDuplicates": true,
    "updateExisting": false
  }
}
```

### 响应示例

```json
{
  "success": true,
  "message": "导入成功",
  "data": {
    "total": 2,
    "success": 2,
    "failed": 0,
    "items": [
      {
        "id": "knowledge_id1",
        "title": "知识1",
        "status": "success"
      },
      {
        "id": "knowledge_id2",
        "title": "知识2",
        "status": "success"
      }
    ]
  }
}
```

## 搜索知识

语义搜索知识库内容。

```http
POST /api/v1/projects/{project_id}/knowledge/search
Authorization: Bearer <token>
Content-Type: application/json

{
  "query": "搜索关键词",
  "type": "plot_pattern",
  "category": "剧情模式",
  "tags": ["悬疑"],
  "options": {
    "limit": 10,
    "minScore": 0.7,
    "includeContent": true
  }
}
```

### 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| query | string | 是 | 搜索关键词 |
| type | string | 否 | 知识类型 |
| category | string | 否 | 分类 |
| tags | string[] | 否 | 标签列表 |
| options | object | 否 | 搜索选项 |
| options.limit | number | 否 | 返回数量限制(默认10) |
| options.minScore | number | 否 | 最小相似度分数(0-1) |
| options.includeContent | boolean | 否 | 是否包含完整内容 |

### 响应示例

```json
{
  "success": true,
  "message": "搜索成功",
  "data": {
    "items": [
      {
        "id": "knowledge_id",
        "title": "知识标题",
        "summary": "内容摘要",
        "type": "plot_pattern",
        "category": "剧情模式",
        "tags": ["悬疑", "反转"],
        "score": 0.85,
        "content": "完整内容...",
        "highlights": [
          {
            "field": "content",
            "snippet": "包含<em>关键词</em>的内容片段"
          }
        ]
      }
    ],
    "total": 1
  }
}
```

## 更新知识

更新知识条目信息。

```http
PUT /api/v1/projects/{project_id}/knowledge/{knowledge_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "更新的标题",
  "content": "更新的内容",
  "tags": ["新标签"],
  "status": "archived"
}
```

### 响应示例

```json
{
  "success": true,
  "message": "更新成功",
  "data": {
    "id": "knowledge_id",
    "title": "更新的标题",
    "content": "更新的内容",
    "tags": ["新标签"],
    "status": "archived",
    "updatedAt": "2024-02-08T11:00:00Z",
    "embedding": {
      "status": "processing",
      "progress": 0
    }
  }
}
```

## 删除知识

删除指定的知识条目。

```http
DELETE /api/v1/projects/{project_id}/knowledge/{knowledge_id}
Authorization: Bearer <token>
```

### 响应示例

```json
{
  "success": true,
  "message": "删除成功"
}
```

## 获取知识详情

获取单个知识条目的详细信息。

```http
GET /api/v1/projects/{project_id}/knowledge/{knowledge_id}
Authorization: Bearer <token>
```

### 响应示例

```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "id": "knowledge_id",
    "projectId": "project_id",
    "title": "知识标题",
    "content": "知识内容",
    "type": "plot_pattern",
    "category": "剧情模式",
    "summary": "内容摘要",
    "tags": ["悬疑", "反转"],
    "metadata": {
      "source": "来源",
      "author": "作者",
      "references": ["参考1", "参考2"]
    },
    "visibility": "public",
    "status": "active",
    "embedding": {
      "status": "completed",
      "updatedAt": "2024-02-08T10:30:00Z"
    },
    "createdAt": "2024-02-08T10:00:00Z",
    "updatedAt": "2024-02-08T10:30:00Z",
    "createdBy": "user_id"
  }
}
```

## 获取知识列表

获取项目中的知识条目列表。

```http
GET /api/v1/projects/{project_id}/knowledge?page=1&limit=10&type=plot_pattern&category=剧情模式&tags=悬疑
Authorization: Bearer <token>
```

### 查询参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码(默认1) |
| limit | number | 否 | 每页数量(默认10) |
| type | string | 否 | 知识类型 |
| category | string | 否 | 分类 |
| tags | string | 否 | 标签(逗号分隔) |
| status | string | 否 | 状态(active/archived) |
| search | string | 否 | 搜索关键词 |

### 响应示例

```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "items": [
      {
        "id": "knowledge_id",
        "title": "知识标题",
        "summary": "内容摘要",
        "type": "plot_pattern",
        "category": "剧情模式",
        "tags": ["悬疑", "反转"],
        "status": "active",
        "createdAt": "2024-02-08T10:00:00Z"
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

## 错误码

| 状态码 | 错误码 | 说明 |
|--------|--------|------|
| 400 | INVALID_PARAMS | 参数验证失败 |
| 401 | UNAUTHORIZED | 未认证或认证失败 |
| 403 | FORBIDDEN | 权限不足 |
| 404 | KNOWLEDGE_NOT_FOUND | 知识条目不存在 |
| 404 | PROJECT_NOT_FOUND | 项目不存在 |
| 409 | TITLE_EXISTS | 标题已存在 |
| 422 | INVALID_TYPE | 无效的知识类型 |
| 422 | INVALID_CATEGORY | 无效的分类 |
| 500 | EMBEDDING_FAILED | 向量生成失败 | 