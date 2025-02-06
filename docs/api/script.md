# 剧本管理接口

## 创建剧本

创建新的剧本项目。

```http
POST /api/v1/scripts
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "剧本标题",
  "description": "剧本简介",
  "type": "murder",
  "difficulty": "medium",
  "playerCount": {
    "min": 6,
    "max": 8
  },
  "duration": 180,
  "tags": ["推理", "悬疑", "本格"]
}
```

### 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 是 | 剧本标题 |
| description | string | 是 | 剧本简介 |
| type | string | 是 | 剧本类型(murder/adventure/mystery) |
| difficulty | string | 是 | 难度(easy/medium/hard) |
| playerCount | object | 是 | 玩家人数范围 |
| playerCount.min | number | 是 | 最小人数 |
| playerCount.max | number | 是 | 最大人数 |
| duration | number | 是 | 预计时长(分钟) |
| tags | string[] | 否 | 标签列表 |

### 响应示例

```json
{
  "success": true,
  "message": "创建成功",
  "data": {
    "id": "script_id",
    "title": "剧本标题",
    "description": "剧本简介",
    "type": "murder",
    "difficulty": "medium",
    "playerCount": {
      "min": 6,
      "max": 8
    },
    "duration": 180,
    "tags": ["推理", "悬疑", "本格"],
    "status": "draft",
    "createdAt": "2024-02-07T10:00:00Z",
    "createdBy": "user_id"
  }
}
```

## 获取剧本列表

获取剧本列表，支持分页和筛选。

```http
GET /api/v1/scripts?page=1&limit=10&type=murder&difficulty=medium&search=关键词
Authorization: Bearer <token>
```

### 查询参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码(默认1) |
| limit | number | 否 | 每页数量(默认10) |
| type | string | 否 | 剧本类型 |
| difficulty | string | 否 | 难度等级 |
| search | string | 否 | 搜索关键词 |
| tags | string | 否 | 标签(逗号分隔) |
| status | string | 否 | 状态(draft/published) |

### 响应示例

```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "items": [
      {
        "id": "script_id",
        "title": "剧本标题",
        "description": "剧本简介",
        "type": "murder",
        "difficulty": "medium",
        "playerCount": {
          "min": 6,
          "max": 8
        },
        "duration": 180,
        "tags": ["推理", "悬疑", "本格"],
        "status": "draft",
        "createdAt": "2024-02-07T10:00:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

## 获取剧本详情

获取单个剧本的详细信息。

```http
GET /api/v1/scripts/{script_id}
Authorization: Bearer <token>
```

### 响应示例

```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "id": "script_id",
    "title": "剧本标题",
    "description": "剧本简介",
    "type": "murder",
    "difficulty": "medium",
    "playerCount": {
      "min": 6,
      "max": 8
    },
    "duration": 180,
    "tags": ["推理", "悬疑", "本格"],
    "status": "draft",
    "content": "剧本内容...",
    "characters": ["character_id1", "character_id2"],
    "timeline": ["event_id1", "event_id2"],
    "createdAt": "2024-02-07T10:00:00Z",
    "updatedAt": "2024-02-07T15:00:00Z",
    "createdBy": "user_id",
    "version": 1
  }
}
```

## 更新剧本

更新剧本信息。

```http
PUT /api/v1/scripts/{script_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "新剧本标题",
  "description": "新剧本简介",
  "type": "murder",
  "difficulty": "hard",
  "playerCount": {
    "min": 7,
    "max": 9
  },
  "duration": 200,
  "tags": ["推理", "悬疑", "本格", "新标签"]
}
```

### 响应示例

```json
{
  "success": true,
  "message": "更新成功",
  "data": {
    "id": "script_id",
    "title": "新剧本标题",
    "description": "新剧本简介",
    "type": "murder",
    "difficulty": "hard",
    "playerCount": {
      "min": 7,
      "max": 9
    },
    "duration": 200,
    "tags": ["推理", "悬疑", "本格", "新标签"],
    "updatedAt": "2024-02-07T16:00:00Z",
    "version": 2
  }
}
```

## 删除剧本

删除指定的剧本。

```http
DELETE /api/v1/scripts/{script_id}
Authorization: Bearer <token>
```

### 响应示例

```json
{
  "success": true,
  "message": "删除成功"
}
```

## 发布剧本

将剧本状态改为已发布。

```http
POST /api/v1/scripts/{script_id}/publish
Authorization: Bearer <token>
```

### 响应示例

```json
{
  "success": true,
  "message": "发布成功",
  "data": {
    "id": "script_id",
    "status": "published",
    "publishedAt": "2024-02-07T17:00:00Z"
  }
}
```

## 获取剧本版本历史

获取剧本的版本历史记录。

```http
GET /api/v1/scripts/{script_id}/versions
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
        "version": 2,
        "changes": ["更新标题", "更新简介", "修改难度"],
        "updatedAt": "2024-02-07T16:00:00Z",
        "updatedBy": "user_id"
      },
      {
        "version": 1,
        "changes": ["初始创建"],
        "updatedAt": "2024-02-07T10:00:00Z",
        "updatedBy": "user_id"
      }
    ]
  }
}
```

## 错误码

| 状态码 | 错误码 | 说明 |
|--------|--------|------|
| 400 | INVALID_PARAMS | 参数验证失败 |
| 401 | UNAUTHORIZED | 未认证或认证失败 |
| 403 | FORBIDDEN | 权限不足 |
| 404 | SCRIPT_NOT_FOUND | 剧本不存在 |
| 409 | TITLE_EXISTS | 剧本标题已存在 |
| 422 | INVALID_STATUS | 无效的状态转换 | 