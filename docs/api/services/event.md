# 事件管理 API

## 创建事件

在剧本中创建新事件。

### 请求

```http
POST /api/v1/scripts/:scriptId/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "string",
  "description": "string",
  "type": "string",
  "time": "string",
  "location": "string",
  "participants": [
    {
      "characterId": "string",
      "role": "string",
      "action": "string",
      "isHidden": boolean
    }
  ],
  "clues": [
    {
      "id": "string",
      "revealType": "string",
      "condition": "string"
    }
  ],
  "triggers": [
    {
      "type": "string",
      "condition": "string",
      "action": "string"
    }
  ],
  "metadata": {
    "importance": number,
    "isPublic": boolean,
    "tags": ["string"]
  }
}
```

### 参数说明

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| title | string | 是 | 事件标题 |
| description | string | 是 | 事件描述 |
| type | string | 是 | 事件类型，如 'core', 'branch', 'optional' |
| time | string | 是 | 发生时间 |
| location | string | 是 | 发生地点 |
| participants | object[] | 否 | 参与者列表 |
| participants[].characterId | string | 是 | 角色ID |
| participants[].role | string | 是 | 参与角色，如 'initiator', 'target', 'witness' |
| participants[].action | string | 否 | 角色行为描述 |
| participants[].isHidden | boolean | 否 | 是否隐藏参与信息 |
| clues | object[] | 否 | 关联线索列表 |
| clues[].id | string | 是 | 线索ID |
| clues[].revealType | string | 是 | 线索揭示方式 |
| clues[].condition | string | 否 | 线索获取条件 |
| triggers | object[] | 否 | 触发器列表 |
| triggers[].type | string | 是 | 触发类型 |
| triggers[].condition | string | 是 | 触发条件 |
| triggers[].action | string | 是 | 触发动作 |
| metadata | object | 否 | 元数据 |
| metadata.importance | number | 否 | 重要程度(1-5) |
| metadata.isPublic | boolean | 否 | 是否公开 |
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
    "time": "string",
    "location": "string",
    "participants": [
      {
        "characterId": "string",
        "role": "string",
        "action": "string",
        "isHidden": boolean,
        "character": {
          "id": "string",
          "name": "string"
        }
      }
    ],
    "clues": [
      {
        "id": "string",
        "title": "string",
        "revealType": "string",
        "condition": "string"
      }
    ],
    "triggers": [
      {
        "id": "string",
        "type": "string",
        "condition": "string",
        "action": "string"
      }
    ],
    "metadata": {
      "importance": number,
      "isPublic": boolean,
      "tags": ["string"]
    },
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

## 获取事件列表

获取剧本中的事件列表。

### 请求

```http
GET /api/v1/scripts/:scriptId/events
Authorization: Bearer <token>
```

### 查询参数

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| type | string | 否 | 事件类型过滤 |
| time | string | 否 | 时间范围过滤 |
| location | string | 否 | 地点过滤 |
| character | string | 否 | 参与角色ID过滤 |
| importance | string | 否 | 重要程度过滤 |
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
        "time": "string",
        "location": "string",
        "metadata": {
          "importance": number,
          "tags": ["string"]
        },
        "statistics": {
          "participantCount": number,
          "clueCount": number
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

## 获取事件详情

获取单个事件的详细信息。

### 请求

```http
GET /api/v1/scripts/:scriptId/events/:id
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
    "time": "string",
    "location": "string",
    "participants": [
      {
        "characterId": "string",
        "role": "string",
        "action": "string",
        "isHidden": boolean,
        "character": {
          "id": "string",
          "name": "string",
          "description": "string"
        }
      }
    ],
    "clues": [
      {
        "id": "string",
        "title": "string",
        "description": "string",
        "revealType": "string",
        "condition": "string"
      }
    ],
    "triggers": [
      {
        "id": "string",
        "type": "string",
        "condition": "string",
        "action": "string",
        "status": "string"
      }
    ],
    "metadata": {
      "importance": number,
      "isPublic": boolean,
      "tags": ["string"]
    },
    "statistics": {
      "participantCount": number,
      "clueCount": number,
      "triggerCount": number
    },
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

## 更新事件

更新事件信息。

### 请求

```http
PUT /api/v1/scripts/:scriptId/events/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "string",
  "description": "string",
  "type": "string",
  "time": "string",
  "location": "string",
  "participants": [
    {
      "characterId": "string",
      "role": "string",
      "action": "string",
      "isHidden": boolean
    }
  ],
  "clues": [
    {
      "id": "string",
      "revealType": "string",
      "condition": "string"
    }
  ],
  "triggers": [
    {
      "type": "string",
      "condition": "string",
      "action": "string"
    }
  ],
  "metadata": {
    "importance": number,
    "isPublic": boolean,
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
    "time": "string",
    "location": "string",
    "participants": [
      {
        "characterId": "string",
        "role": "string",
        "action": "string",
        "isHidden": boolean
      }
    ],
    "clues": [
      {
        "id": "string",
        "revealType": "string",
        "condition": "string"
      }
    ],
    "triggers": [
      {
        "type": "string",
        "condition": "string",
        "action": "string"
      }
    ],
    "metadata": {
      "importance": number,
      "isPublic": boolean,
      "tags": ["string"]
    },
    "updatedAt": "string"
  }
}
```

## 删除事件

删除指定的事件。

### 请求

```http
DELETE /api/v1/scripts/:scriptId/events/:id
Authorization: Bearer <token>
```

### 响应

```json
{
  "success": true,
  "message": "删除成功"
}
```

## 添加事件参与者

添加角色到事件参与者列表。

### 请求

```http
POST /api/v1/scripts/:scriptId/events/:id/participants
Authorization: Bearer <token>
Content-Type: application/json

{
  "characterId": "string",
  "role": "string",
  "action": "string",
  "isHidden": boolean,
  "metadata": {
    "importance": number,
    "notes": "string"
  }
}
```

### 参数说明

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| characterId | string | 是 | 角色ID |
| role | string | 是 | 参与角色 |
| action | string | 否 | 角色行为描述 |
| isHidden | boolean | 否 | 是否隐藏参与信息 |
| metadata | object | 否 | 元数据 |
| metadata.importance | number | 否 | 重要程度(1-5) |
| metadata.notes | string | 否 | 备注说明 |

### 响应

```json
{
  "success": true,
  "message": "添加成功",
  "data": {
    "id": "string",
    "characterId": "string",
    "role": "string",
    "action": "string",
    "isHidden": boolean,
    "metadata": {
      "importance": number,
      "notes": "string"
    },
    "createdAt": "string"
  }
}
```

## 错误码

| 错误码 | 描述 | HTTP状态码 |
|--------|------|------------|
| EVENT_NOT_FOUND | 事件不存在 | 404 |
| EVENT_TITLE_EXISTS | 事件标题已存在 | 400 |
| EVENT_INVALID_TYPE | 无效的事件类型 | 400 |
| EVENT_INVALID_TIME | 无效的时间格式 | 400 |
| EVENT_PARTICIPANT_EXISTS | 参与者已存在 | 400 |
| EVENT_PARTICIPANT_INVALID | 无效的参与者角色 | 400 |
| EVENT_CLUE_NOT_FOUND | 关联线索不存在 | 404 |
| EVENT_TRIGGER_INVALID | 无效的触发器配置 | 400 | 