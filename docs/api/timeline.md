# 时间线管理 API

## 创建事件

在项目时间线中创建新事件。

### 请求

```http
POST /api/v1/projects/:projectId/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "string",
  "description": "string",
  "type": "string",
  "timestamp": "string",
  "characters": ["string"],
  "location": "string",
  "metadata": {
    "importance": number,
    "visibility": "string",
    "clues": ["string"]
  }
}
```

### 参数说明

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| title | string | 是 | 事件标题 |
| description | string | 是 | 事件描述 |
| type | string | 是 | 事件类型，如 'main', 'side', 'clue' |
| timestamp | string | 是 | 事件发生时间 |
| characters | string[] | 否 | 相关角色ID列表 |
| location | string | 否 | 事件发生地点 |
| metadata | object | 否 | 元数据 |
| metadata.importance | number | 否 | 重要程度(1-5) |
| metadata.visibility | string | 否 | 可见性设置 |
| metadata.clues | string[] | 否 | 相关线索ID列表 |

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
    "timestamp": "string",
    "characters": ["string"],
    "location": "string",
    "metadata": {
      "importance": number,
      "visibility": "string",
      "clues": ["string"]
    },
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

## 获取事件列表

获取项目时间线的事件列表。

### 请求

```http
GET /api/v1/projects/:projectId/events
Authorization: Bearer <token>
```

### 查询参数

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| type | string | 否 | 事件类型过滤 |
| character | string | 否 | 角色ID过滤 |
| startTime | string | 否 | 开始时间 |
| endTime | string | 否 | 结束时间 |
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
        "description": "string",
        "type": "string",
        "timestamp": "string",
        "characters": ["string"],
        "location": "string",
        "metadata": {
          "importance": number,
          "visibility": "string",
          "clues": ["string"]
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
GET /api/v1/projects/:projectId/events/:id
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
    "timestamp": "string",
    "characters": [
      {
        "id": "string",
        "name": "string",
        "role": "string"
      }
    ],
    "location": "string",
    "metadata": {
      "importance": number,
      "visibility": "string",
      "clues": [
        {
          "id": "string",
          "title": "string",
          "type": "string"
        }
      ]
    },
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

## 更新事件

更新已有事件的信息。

### 请求

```http
PUT /api/v1/projects/:projectId/events/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "string",
  "description": "string",
  "type": "string",
  "timestamp": "string",
  "characters": ["string"],
  "location": "string",
  "metadata": {
    "importance": number,
    "visibility": "string",
    "clues": ["string"]
  }
}
```

### 参数说明

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| title | string | 否 | 事件标题 |
| description | string | 否 | 事件描述 |
| type | string | 否 | 事件类型 |
| timestamp | string | 否 | 事件发生时间 |
| characters | string[] | 否 | 相关角色ID列表 |
| location | string | 否 | 事件发生地点 |
| metadata | object | 否 | 元数据 |

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
    "timestamp": "string",
    "characters": ["string"],
    "location": "string",
    "metadata": {
      "importance": number,
      "visibility": "string",
      "clues": ["string"]
    },
    "updatedAt": "string"
  }
}
```

## 删除事件

从时间线中删除事件。

### 请求

```http
DELETE /api/v1/projects/:projectId/events/:id
Authorization: Bearer <token>
```

### 响应

```json
{
  "success": true,
  "message": "删除成功"
}
```

## 获取角色时间线

获取特定角色相关的所有事件。

### 请求

```http
GET /api/v1/projects/:projectId/characters/:characterId/events
Authorization: Bearer <token>
```

### 查询参数

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| startTime | string | 否 | 开始时间 |
| endTime | string | 否 | 结束时间 |
| type | string | 否 | 事件类型过滤 |
| page | number | 否 | 页码，默认1 |
| limit | number | 否 | 每页条数，默认10 |

### 响应

```json
{
  "success": true,
  "data": {
    "character": {
      "id": "string",
      "name": "string",
      "role": "string"
    },
    "events": {
      "items": [
        {
          "id": "string",
          "title": "string",
          "description": "string",
          "type": "string",
          "timestamp": "string",
          "location": "string",
          "metadata": {
            "importance": number,
            "visibility": "string",
            "clues": ["string"]
          }
        }
      ],
      "total": 0,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

## 错误码

| 错误码 | 描述 | HTTP状态码 |
|--------|------|------------|
| EVENT_NOT_FOUND | 事件不存在 | 404 |
| EVENT_INVALID_TYPE | 无效的事件类型 | 400 |
| EVENT_INVALID_TIME | 无效的时间格式 | 400 |
| EVENT_CHARACTER_NOT_FOUND | 相关角色不存在 | 400 |
| EVENT_CLUE_NOT_FOUND | 相关线索不存在 | 400 | 