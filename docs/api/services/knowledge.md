# 知识库管理 API

## 创建知识

创建新的知识条目。

### 请求

```http
POST /api/v1/projects/:projectId/knowledge
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "string",
  "title": "string",
  "content": "string",
  "metadata": {
    "category": "string",
    "tags": ["string"],
    "source": "string"
  }
}
```

### 参数说明

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| type | string | 是 | 知识类型，如 'plot_pattern', 'character_archetype' |
| title | string | 是 | 知识标题 |
| content | string | 是 | 知识内容 |
| metadata | object | 否 | 元数据 |
| metadata.category | string | 否 | 分类 |
| metadata.tags | string[] | 否 | 标签列表 |
| metadata.source | string | 否 | 来源 |

### 响应

```json
{
  "success": true,
  "message": "创建成功",
  "data": {
    "id": "string",
    "type": "string",
    "title": "string",
    "content": "string",
    "metadata": {
      "category": "string",
      "tags": ["string"],
      "source": "string"
    },
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

## 更新知识

更新已有的知识条目。

### 请求

```http
PUT /api/v1/projects/:projectId/knowledge/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "string",
  "content": "string",
  "metadata": {
    "category": "string",
    "tags": ["string"],
    "source": "string"
  }
}
```

### 参数说明

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| title | string | 否 | 知识标题 |
| content | string | 否 | 知识内容 |
| metadata | object | 否 | 元数据 |
| metadata.category | string | 否 | 分类 |
| metadata.tags | string[] | 否 | 标签列表 |
| metadata.source | string | 否 | 来源 |

### 响应

```json
{
  "success": true,
  "message": "更新成功",
  "data": {
    "id": "string",
    "type": "string",
    "title": "string",
    "content": "string",
    "metadata": {
      "category": "string",
      "tags": ["string"],
      "source": "string"
    },
    "updatedAt": "string"
  }
}
```

## 搜索知识

搜索知识库内容。

### 请求

```http
POST /api/v1/projects/:projectId/knowledge/search
Authorization: Bearer <token>
Content-Type: application/json

{
  "query": "string",
  "type": "string",
  "category": "string",
  "tags": ["string"],
  "page": 1,
  "limit": 10,
  "sort": {
    "field": "string",
    "order": "desc"
  }
}
```

### 参数说明

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| query | string | 是 | 搜索关键词 |
| type | string | 否 | 知识类型过滤 |
| category | string | 否 | 分类过滤 |
| tags | string[] | 否 | 标签过滤 |
| page | number | 否 | 页码，默认1 |
| limit | number | 否 | 每页条数，默认10 |
| sort | object | 否 | 排序设置 |
| sort.field | string | 否 | 排序字段 |
| sort.order | string | 否 | 排序方向，'asc'或'desc' |

### 响应

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "string",
        "type": "string",
        "title": "string",
        "content": "string",
        "metadata": {
          "category": "string",
          "tags": ["string"],
          "source": "string"
        },
        "score": 0.95,
        "createdAt": "string"
      }
    ],
    "total": 0,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

## 批量导入

批量导入知识条目。

### 请求

```http
POST /api/v1/projects/:projectId/knowledge/bulk-import
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "type": "string",
      "title": "string",
      "content": "string",
      "metadata": {
        "category": "string",
        "tags": ["string"],
        "source": "string"
      }
    }
  ],
  "options": {
    "skipDuplicates": true,
    "updateExisting": false
  }
}
```

### 参数说明

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| items | array | 是 | 知识条目列表 |
| options | object | 否 | 导入选项 |
| options.skipDuplicates | boolean | 否 | 是否跳过重复项 |
| options.updateExisting | boolean | 否 | 是否更新已存在项 |

### 响应

```json
{
  "success": true,
  "message": "导入成功",
  "data": {
    "total": 0,
    "created": 0,
    "updated": 0,
    "skipped": 0,
    "failed": 0,
    "errors": [
      {
        "index": 0,
        "error": "string"
      }
    ]
  }
}
```

## 错误码

| 错误码 | 描述 | HTTP状态码 |
|--------|------|------------|
| KNOWLEDGE_NOT_FOUND | 知识条目不存在 | 404 |
| KNOWLEDGE_DUPLICATE | 知识条目重复 | 400 |
| KNOWLEDGE_INVALID_TYPE | 无效的知识类型 | 400 |
| KNOWLEDGE_VALIDATION_ERROR | 知识内容验证失败 | 400 |
| KNOWLEDGE_IMPORT_ERROR | 批量导入失败 | 400 | 