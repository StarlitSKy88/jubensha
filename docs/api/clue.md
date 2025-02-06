# 线索管理 API

## 创建线索

在剧本中创建新线索。

### 请求

```http
POST /api/v1/scripts/:scriptId/clues
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "string",
  "description": "string",
  "type": "string",
  "content": "string",
  "location": "string",
  "discoveryCondition": "string",
  "relatedCharacters": [
    {
      "characterId": "string",
      "role": "string",
      "knowledge": "string"
    }
  ],
  "relatedEvents": [
    {
      "eventId": "string",
      "relationship": "string"
    }
  ],
  "connections": [
    {
      "clueId": "string",
      "type": "string",
      "description": "string"
    }
  ],
  "metadata": {
    "importance": number,
    "isKey": boolean,
    "category": "string",
    "tags": ["string"]
  }
}
```

### 参数说明

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| title | string | 是 | 线索标题 |
| description | string | 是 | 线索描述 |
| type | string | 是 | 线索类型，如 'physical', 'testimony', 'document' |
| content | string | 是 | 线索内容 |
| location | string | 是 | 获取地点 |
| discoveryCondition | string | 否 | 发现条件 |
| relatedCharacters | object[] | 否 | 相关角色列表 |
| relatedCharacters[].characterId | string | 是 | 角色ID |
| relatedCharacters[].role | string | 是 | 关联角色，如 'owner', 'creator', 'target' |
| relatedCharacters[].knowledge | string | 否 | 角色对线索的了解 |
| relatedEvents | object[] | 否 | 相关事件列表 |
| relatedEvents[].eventId | string | 是 | 事件ID |
| relatedEvents[].relationship | string | 是 | 与事件的关系 |
| connections | object[] | 否 | 关联线索列表 |
| connections[].clueId | string | 是 | 关联线索ID |
| connections[].type | string | 是 | 关联类型 |
| connections[].description | string | 否 | 关联说明 |
| metadata | object | 否 | 元数据 |
| metadata.importance | number | 否 | 重要程度(1-5) |
| metadata.isKey | boolean | 否 | 是否关键线索 |
| metadata.category | string | 否 | 线索分类 |
| metadata.tags | string[] | 否 | 标签列表 |

### 响应

```json
{
  "success": true,
  "message": "创建成功",
  "data": {
    "id": "string",
    "title": "string",
    "description": "string",
    "type": "string",
    "content": "string",
    "location": "string",
    "discoveryCondition": "string",
    "relatedCharacters": [
      {
        "characterId": "string",
        "role": "string",
        "knowledge": "string",
        "character": {
          "id": "string",
          "name": "string"
        }
      }
    ],
    "relatedEvents": [
      {
        "eventId": "string",
        "relationship": "string",
        "event": {
          "id": "string",
          "title": "string"
        }
      }
    ],
    "connections": [
      {
        "clueId": "string",
        "type": "string",
        "description": "string",
        "clue": {
          "id": "string",
          "title": "string"
        }
      }
    ],
    "metadata": {
      "importance": number,
      "isKey": boolean,
      "category": "string",
      "tags": ["string"]
    },
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

## 获取线索列表

获取剧本中的线索列表。

### 请求

```http
GET /api/v1/scripts/:scriptId/clues
Authorization: Bearer <token>
```

### 查询参数

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| type | string | 否 | 线索类型过滤 |
| location | string | 否 | 地点过滤 |
| character | string | 否 | 相关角色ID过滤 |
| event | string | 否 | 相关事件ID过滤 |
| importance | string | 否 | 重要程度过滤 |
| isKey | boolean | 否 | 是否关键线索 |
| category | string | 否 | 分类过滤 |
| tags | string | 否 | 标签过滤（逗号分隔） |
| search | string | 否 | 搜索关键词 |
| sort | string | 否 | 排序字段 |
| order | string | 否 | 排序方式(asc/desc) |
| page | number | 否 | 页码，默认1 |
| limit | number | 否 | 每页条数，默认10 |

### 响应

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "string",
        "title": "string",
        "type": "string",
        "location": "string",
        "metadata": {
          "importance": number,
          "isKey": boolean,
          "category": "string",
          "tags": ["string"]
        },
        "statistics": {
          "characterCount": number,
          "eventCount": number,
          "connectionCount": number
        },
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

## 获取线索详情

获取单个线索的详细信息。

### 请求

```http
GET /api/v1/scripts/:scriptId/clues/:id
Authorization: Bearer <token>
```

### 响应

```json
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "description": "string",
    "type": "string",
    "content": "string",
    "location": "string",
    "discoveryCondition": "string",
    "relatedCharacters": [
      {
        "characterId": "string",
        "role": "string",
        "knowledge": "string",
        "character": {
          "id": "string",
          "name": "string",
          "description": "string"
        }
      }
    ],
    "relatedEvents": [
      {
        "eventId": "string",
        "relationship": "string",
        "event": {
          "id": "string",
          "title": "string",
          "description": "string"
        }
      }
    ],
    "connections": [
      {
        "clueId": "string",
        "type": "string",
        "description": "string",
        "clue": {
          "id": "string",
          "title": "string",
          "description": "string"
        }
      }
    ],
    "metadata": {
      "importance": number,
      "isKey": boolean,
      "category": "string",
      "tags": ["string"]
    },
    "statistics": {
      "characterCount": number,
      "eventCount": number,
      "connectionCount": number
    },
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

## 更新线索

更新线索信息。

### 请求

```http
PUT /api/v1/scripts/:scriptId/clues/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "string",
  "description": "string",
  "type": "string",
  "content": "string",
  "location": "string",
  "discoveryCondition": "string",
  "relatedCharacters": [
    {
      "characterId": "string",
      "role": "string",
      "knowledge": "string"
    }
  ],
  "relatedEvents": [
    {
      "eventId": "string",
      "relationship": "string"
    }
  ],
  "connections": [
    {
      "clueId": "string",
      "type": "string",
      "description": "string"
    }
  ],
  "metadata": {
    "importance": number,
    "isKey": boolean,
    "category": "string",
    "tags": ["string"]
  }
}
```

### 响应

```json
{
  "success": true,
  "message": "更新成功",
  "data": {
    "id": "string",
    "title": "string",
    "description": "string",
    "type": "string",
    "content": "string",
    "location": "string",
    "discoveryCondition": "string",
    "relatedCharacters": [
      {
        "characterId": "string",
        "role": "string",
        "knowledge": "string"
      }
    ],
    "relatedEvents": [
      {
        "eventId": "string",
        "relationship": "string"
      }
    ],
    "connections": [
      {
        "clueId": "string",
        "type": "string",
        "description": "string"
      }
    ],
    "metadata": {
      "importance": number,
      "isKey": boolean,
      "category": "string",
      "tags": ["string"]
    },
    "updatedAt": "string"
  }
}
```

## 删除线索

删除指定的线索。

### 请求

```http
DELETE /api/v1/scripts/:scriptId/clues/:id
Authorization: Bearer <token>
```

### 响应

```json
{
  "success": true,
  "message": "删除成功"
}
```

## 添加线索关联

添加线索之间的关联关系。

### 请求

```http
POST /api/v1/scripts/:scriptId/clues/:id/connections
Authorization: Bearer <token>
Content-Type: application/json

{
  "targetClueId": "string",
  "type": "string",
  "description": "string",
  "metadata": {
    "strength": number,
    "isHidden": boolean,
    "notes": "string"
  }
}
```

### 参数说明

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| targetClueId | string | 是 | 目标线索ID |
| type | string | 是 | 关联类型 |
| description | string | 否 | 关联说明 |
| metadata | object | 否 | 元数据 |
| metadata.strength | number | 否 | 关联强度(1-5) |
| metadata.isHidden | boolean | 否 | 是否隐藏关联 |
| metadata.notes | string | 否 | 备注说明 |

### 响应

```json
{
  "success": true,
  "message": "添加成功",
  "data": {
    "id": "string",
    "sourceClueId": "string",
    "targetClueId": "string",
    "type": "string",
    "description": "string",
    "metadata": {
      "strength": number,
      "isHidden": boolean,
      "notes": "string"
    },
    "createdAt": "string"
  }
}
```

## 错误码

| 错误码 | 描述 | HTTP状态码 |
|--------|------|------------|
| CLUE_NOT_FOUND | 线索不存在 | 404 |
| CLUE_TITLE_EXISTS | 线索标题已存在 | 400 |
| CLUE_INVALID_TYPE | 无效的线索类型 | 400 |
| CLUE_CHARACTER_NOT_FOUND | 相关角色不存在 | 404 |
| CLUE_EVENT_NOT_FOUND | 相关事件不存在 | 404 |
| CLUE_CONNECTION_EXISTS | 线索关联已存在 | 400 |
| CLUE_CONNECTION_INVALID | 无效的关联类型 | 400 |
| CLUE_SELF_CONNECTION | 不能与自身建立关联 | 400 | 