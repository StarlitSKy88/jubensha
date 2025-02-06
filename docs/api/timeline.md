# 时间线管理接口

## 创建事件

在指定剧本中创建新的时间线事件。

```http
POST /api/v1/scripts/{script_id}/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "事件标题",
  "description": "事件描述",
  "timestamp": "2024-02-08T10:00:00Z",
  "duration": 30,
  "type": "plot",
  "importance": "high",
  "location": "事件地点",
  "characters": ["character_id1", "character_id2"],
  "relatedEvents": ["event_id1", "event_id2"],
  "tags": ["关键", "转折点"],
  "isPublic": true,
  "metadata": {
    "clues": ["线索1", "线索2"],
    "items": ["物品1", "物品2"]
  }
}
```

### 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 是 | 事件标题 |
| description | string | 是 | 事件描述 |
| timestamp | string | 是 | 事件发生时间(ISO 8601格式) |
| duration | number | 否 | 持续时间(分钟) |
| type | string | 是 | 事件类型(plot/character/clue) |
| importance | string | 是 | 重要程度(high/medium/low) |
| location | string | 否 | 事件发生地点 |
| characters | string[] | 否 | 相关角色ID列表 |
| relatedEvents | string[] | 否 | 关联事件ID列表 |
| tags | string[] | 否 | 标签列表 |
| isPublic | boolean | 否 | 是否公开事件(默认true) |
| metadata | object | 否 | 额外元数据 |

### 响应示例

```json
{
  "success": true,
  "message": "创建成功",
  "data": {
    "id": "event_id",
    "scriptId": "script_id",
    "title": "事件标题",
    "description": "事件描述",
    "timestamp": "2024-02-08T10:00:00Z",
    "duration": 30,
    "type": "plot",
    "importance": "high",
    "location": "事件地点",
    "characters": [
      {
        "id": "character_id1",
        "name": "角色1"
      },
      {
        "id": "character_id2",
        "name": "角色2"
      }
    ],
    "relatedEvents": ["event_id1", "event_id2"],
    "tags": ["关键", "转折点"],
    "isPublic": true,
    "metadata": {
      "clues": ["线索1", "线索2"],
      "items": ["物品1", "物品2"]
    },
    "createdAt": "2024-02-08T10:00:00Z",
    "createdBy": "user_id"
  }
}
```

## 获取事件列表

获取剧本中的事件列表，支持分页和筛选。

```http
GET /api/v1/scripts/{script_id}/events?page=1&limit=10&type=plot&importance=high&startTime=2024-02-01T00:00:00Z&endTime=2024-02-08T23:59:59Z
Authorization: Bearer <token>
```

### 查询参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码(默认1) |
| limit | number | 否 | 每页数量(默认10) |
| type | string | 否 | 事件类型 |
| importance | string | 否 | 重要程度 |
| startTime | string | 否 | 开始时间 |
| endTime | string | 否 | 结束时间 |
| character | string | 否 | 角色ID |
| tags | string | 否 | 标签(逗号分隔) |
| search | string | 否 | 搜索关键词 |

### 响应示例

```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "items": [
      {
        "id": "event_id",
        "title": "事件标题",
        "description": "事件描述",
        "timestamp": "2024-02-08T10:00:00Z",
        "type": "plot",
        "importance": "high",
        "characters": [
          {
            "id": "character_id1",
            "name": "角色1"
          }
        ],
        "tags": ["关键", "转折点"]
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

## 获取事件详情

获取单个事件的详细信息。

```http
GET /api/v1/scripts/{script_id}/events/{event_id}
Authorization: Bearer <token>
```

### 响应示例

```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "id": "event_id",
    "scriptId": "script_id",
    "title": "事件标题",
    "description": "事件描述",
    "timestamp": "2024-02-08T10:00:00Z",
    "duration": 30,
    "type": "plot",
    "importance": "high",
    "location": "事件地点",
    "characters": [
      {
        "id": "character_id1",
        "name": "角色1",
        "role": "主要角色"
      }
    ],
    "relatedEvents": [
      {
        "id": "event_id1",
        "title": "关联事件1"
      }
    ],
    "tags": ["关键", "转折点"],
    "isPublic": true,
    "metadata": {
      "clues": ["线索1", "线索2"],
      "items": ["物品1", "物品2"]
    },
    "createdAt": "2024-02-08T10:00:00Z",
    "updatedAt": "2024-02-08T15:00:00Z",
    "createdBy": "user_id"
  }
}
```

## 更新事件

更新事件信息。

```http
PUT /api/v1/scripts/{script_id}/events/{event_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "新事件标题",
  "description": "新事件描述",
  "timestamp": "2024-02-08T11:00:00Z",
  "importance": "medium",
  "characters": ["character_id3"],
  "tags": ["新标签"]
}
```

### 响应示例

```json
{
  "success": true,
  "message": "更新成功",
  "data": {
    "id": "event_id",
    "title": "新事件标题",
    "description": "新事件描述",
    "timestamp": "2024-02-08T11:00:00Z",
    "importance": "medium",
    "characters": [
      {
        "id": "character_id3",
        "name": "角色3"
      }
    ],
    "tags": ["新标签"],
    "updatedAt": "2024-02-08T16:00:00Z"
  }
}
```

## 删除事件

删除指定的事件。

```http
DELETE /api/v1/scripts/{script_id}/events/{event_id}
Authorization: Bearer <token>
```

### 响应示例

```json
{
  "success": true,
  "message": "删除成功"
}
```

## 获取角色相关事件

获取指定角色相关的所有事件。

```http
GET /api/v1/scripts/{script_id}/characters/{character_id}/events
Authorization: Bearer <token>
```

### 响应示例

```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "items": [
      {
        "id": "event_id",
        "title": "事件标题",
        "description": "事件描述",
        "timestamp": "2024-02-08T10:00:00Z",
        "type": "plot",
        "importance": "high",
        "role": "主要参与者",
        "tags": ["关键", "转折点"]
      }
    ],
    "total": 20,
    "character": {
      "id": "character_id",
      "name": "角色名称"
    }
  }
}
```

## 错误码

| 状态码 | 错误码 | 说明 |
|--------|--------|------|
| 400 | INVALID_PARAMS | 参数验证失败 |
| 401 | UNAUTHORIZED | 未认证或认证失败 |
| 403 | FORBIDDEN | 权限不足 |
| 404 | EVENT_NOT_FOUND | 事件不存在 |
| 404 | SCRIPT_NOT_FOUND | 剧本不存在 |
| 404 | CHARACTER_NOT_FOUND | 角色不存在 |
| 409 | EVENT_CONFLICT | 事件时间冲突 |
| 422 | INVALID_TIMESTAMP | 无效的时间戳 | 