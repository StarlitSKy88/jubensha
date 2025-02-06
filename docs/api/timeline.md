# 时间线管理 API

## 创建时间线

在剧本中创建新时间线。

### 请求

```http
POST /api/v1/scripts/:scriptId/timelines
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "string",
  "description": "string",
  "type": "string",
  "startTime": "string",
  "endTime": "string",
  "events": [
    {
      "eventId": "string",
      "time": "string",
      "duration": number,
      "order": number
    }
  ],
  "branches": [
    {
      "title": "string",
      "condition": "string",
      "events": [
        {
          "eventId": "string",
          "time": "string",
          "duration": number,
          "order": number
        }
      ]
    }
  ],
  "metadata": {
    "isMain": boolean,
    "visibility": "string",
    "tags": ["string"]
  }
}
```

### 参数说明

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| title | string | 是 | 时间线标题 |
| description | string | 是 | 时间线描述 |
| type | string | 是 | 时间线类型，如 'main', 'branch', 'personal' |
| startTime | string | 是 | 开始时间 |
| endTime | string | 是 | 结束时间 |
| events | object[] | 否 | 事件列表 |
| events[].eventId | string | 是 | 事件ID |
| events[].time | string | 是 | 发生时间 |
| events[].duration | number | 否 | 持续时间(分钟) |
| events[].order | number | 否 | 显示顺序 |
| branches | object[] | 否 | 分支列表 |
| branches[].title | string | 是 | 分支标题 |
| branches[].condition | string | 是 | 触发条件 |
| branches[].events | object[] | 是 | 分支事件列表 |
| metadata | object | 否 | 元数据 |
| metadata.isMain | boolean | 否 | 是否主时间线 |
| metadata.visibility | string | 否 | 可见性设置 |
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
    "startTime": "string",
    "endTime": "string",
    "events": [
      {
        "eventId": "string",
        "time": "string",
        "duration": number,
        "order": number,
        "event": {
          "id": "string",
          "title": "string",
          "type": "string"
        }
      }
    ],
    "branches": [
      {
        "id": "string",
        "title": "string",
        "condition": "string",
        "events": [
          {
            "eventId": "string",
            "time": "string",
            "duration": number,
            "order": number,
            "event": {
              "id": "string",
              "title": "string",
              "type": "string"
            }
          }
        ]
      }
    ],
    "metadata": {
      "isMain": boolean,
      "visibility": "string",
      "tags": ["string"]
    },
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

## 获取时间线列表

获取剧本中的时间线列表。

### 请求

```http
GET /api/v1/scripts/:scriptId/timelines
Authorization: Bearer <token>
```

### 查询参数

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| type | string | 否 | 时间线类型过滤 |
| isMain | boolean | 否 | 是否主时间线 |
| visibility | string | 否 | 可见性过滤 |
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
        "startTime": "string",
        "endTime": "string",
        "metadata": {
          "isMain": boolean,
          "visibility": "string",
          "tags": ["string"]
        },
        "statistics": {
          "eventCount": number,
          "branchCount": number,
          "duration": number
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

## 获取时间线详情

获取单个时间线的详细信息。

### 请求

```http
GET /api/v1/scripts/:scriptId/timelines/:id
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
    "startTime": "string",
    "endTime": "string",
    "events": [
      {
        "eventId": "string",
        "time": "string",
        "duration": number,
        "order": number,
        "event": {
          "id": "string",
          "title": "string",
          "description": "string",
          "type": "string",
          "location": "string"
        }
      }
    ],
    "branches": [
      {
        "id": "string",
        "title": "string",
        "condition": "string",
        "events": [
          {
            "eventId": "string",
            "time": "string",
            "duration": number,
            "order": number,
            "event": {
              "id": "string",
              "title": "string",
              "description": "string",
              "type": "string",
              "location": "string"
            }
          }
        ]
      }
    ],
    "metadata": {
      "isMain": boolean,
      "visibility": "string",
      "tags": ["string"]
    },
    "statistics": {
      "eventCount": number,
      "branchCount": number,
      "duration": number,
      "complexity": number
    },
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

## 更新时间线

更新时间线信息。

### 请求

```http
PUT /api/v1/scripts/:scriptId/timelines/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "string",
  "description": "string",
  "type": "string",
  "startTime": "string",
  "endTime": "string",
  "events": [
    {
      "eventId": "string",
      "time": "string",
      "duration": number,
      "order": number
    }
  ],
  "branches": [
    {
      "title": "string",
      "condition": "string",
      "events": [
        {
          "eventId": "string",
          "time": "string",
          "duration": number,
          "order": number
        }
      ]
    }
  ],
  "metadata": {
    "isMain": boolean,
    "visibility": "string",
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
    "startTime": "string",
    "endTime": "string",
    "events": [
      {
        "eventId": "string",
        "time": "string",
        "duration": number,
        "order": number
      }
    ],
    "branches": [
      {
        "title": "string",
        "condition": "string",
        "events": [
          {
            "eventId": "string",
            "time": "string",
            "duration": number,
            "order": number
          }
        ]
      }
    ],
    "metadata": {
      "isMain": boolean,
      "visibility": "string",
      "tags": ["string"]
    },
    "updatedAt": "string"
  }
}
```

## 删除时间线

删除指定的时间线。

### 请求

```http
DELETE /api/v1/scripts/:scriptId/timelines/:id
Authorization: Bearer <token>
```

### 响应

```json
{
  "success": true,
  "message": "删除成功"
}
```

## 添加时间线事件

添加事件到时间线。

### 请求

```http
POST /api/v1/scripts/:scriptId/timelines/:id/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "eventId": "string",
  "time": "string",
  "duration": number,
  "order": number,
  "branchId": "string",
  "metadata": {
    "importance": number,
    "notes": "string"
  }
}
```

### 参数说明

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| eventId | string | 是 | 事件ID |
| time | string | 是 | 发生时间 |
| duration | number | 否 | 持续时间(分钟) |
| order | number | 否 | 显示顺序 |
| branchId | string | 否 | 分支ID |
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
    "eventId": "string",
    "time": "string",
    "duration": number,
    "order": number,
    "branchId": "string",
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
| TIMELINE_NOT_FOUND | 时间线不存在 | 404 |
| TIMELINE_TITLE_EXISTS | 时间线标题已存在 | 400 |
| TIMELINE_INVALID_TYPE | 无效的时间线类型 | 400 |
| TIMELINE_INVALID_TIME | 无效的时间格式 | 400 |
| TIMELINE_EVENT_NOT_FOUND | 关联事件不存在 | 404 |
| TIMELINE_EVENT_EXISTS | 事件已存在于时间线 | 400 |
| TIMELINE_BRANCH_NOT_FOUND | 分支不存在 | 404 |
| TIMELINE_BRANCH_INVALID | 无效的分支配置 | 400 | 