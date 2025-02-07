# 剧本管理 API

## 创建剧本

创建新的剧本。

### 请求

```http
POST /api/v1/scripts
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "string",
  "description": "string",
  "type": "string",
  "difficulty": number,
  "playerCount": {
    "min": number,
    "max": number,
    "recommended": number
  },
  "duration": number,
  "genre": ["string"],
  "tags": ["string"],
  "settings": {
    "era": "string",
    "location": "string",
    "theme": "string"
  },
  "metadata": {
    "isPublic": boolean,
    "price": number,
    "language": "string",
    "version": "string"
  }
}
```

### 参数说明

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| title | string | 是 | 剧本标题 |
| description | string | 是 | 剧本简介 |
| type | string | 是 | 剧本类型，如 'murder', 'adventure', 'romance' |
| difficulty | number | 是 | 难度等级(1-5) |
| playerCount | object | 是 | 玩家人数设置 |
| playerCount.min | number | 是 | 最小人数 |
| playerCount.max | number | 是 | 最大人数 |
| playerCount.recommended | number | 是 | 推荐人数 |
| duration | number | 是 | 预计游戏时长(分钟) |
| genre | string[] | 是 | 剧本类型标签 |
| tags | string[] | 否 | 自定义标签 |
| settings | object | 否 | 剧本背景设置 |
| settings.era | string | 否 | 时代背景 |
| settings.location | string | 否 | 地点背景 |
| settings.theme | string | 否 | 主题风格 |
| metadata | object | 否 | 元数据 |
| metadata.isPublic | boolean | 否 | 是否公开 |
| metadata.price | number | 否 | 价格 |
| metadata.language | string | 否 | 语言 |
| metadata.version | string | 否 | 版本号 |

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
    "difficulty": number,
    "playerCount": {
      "min": number,
      "max": number,
      "recommended": number
    },
    "duration": number,
    "genre": ["string"],
    "tags": ["string"],
    "settings": {
      "era": "string",
      "location": "string",
      "theme": "string"
    },
    "metadata": {
      "isPublic": boolean,
      "price": number,
      "language": "string",
      "version": "string"
    },
    "statistics": {
      "characterCount": number,
      "eventCount": number,
      "clueCount": number
    },
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

## 获取剧本列表

获取剧本列表。

### 请求

```http
GET /api/v1/scripts
Authorization: Bearer <token>
```

### 查询参数

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| type | string | 否 | 剧本类型过滤 |
| difficulty | string | 否 | 难度等级过滤 |
| playerCount | number | 否 | 玩家人数过滤 |
| duration | string | 否 | 时长范围，如 '60-120' |
| genre | string | 否 | 类型标签过滤 |
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
        "description": "string",
        "type": "string",
        "difficulty": number,
        "playerCount": {
          "min": number,
          "max": number
        },
        "duration": number,
        "genre": ["string"],
        "metadata": {
          "isPublic": boolean,
          "price": number
        },
        "statistics": {
          "characterCount": number,
          "rating": number,
          "playCount": number
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

## 获取剧本详情

获取单个剧本的详细信息。

### 请求

```http
GET /api/v1/scripts/:id
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
    "difficulty": number,
    "playerCount": {
      "min": number,
      "max": number,
      "recommended": number
    },
    "duration": number,
    "genre": ["string"],
    "tags": ["string"],
    "settings": {
      "era": "string",
      "location": "string",
      "theme": "string"
    },
    "metadata": {
      "isPublic": boolean,
      "price": number,
      "language": "string",
      "version": "string"
    },
    "statistics": {
      "characterCount": number,
      "eventCount": number,
      "clueCount": number,
      "rating": number,
      "playCount": number,
      "reviewCount": number
    },
    "createdAt": "string",
    "updatedAt": "string",
    "createdBy": {
      "id": "string",
      "name": "string"
    }
  }
}
```

## 更新剧本

更新剧本信息。

### 请求

```http
PUT /api/v1/scripts/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "string",
  "description": "string",
  "type": "string",
  "difficulty": number,
  "playerCount": {
    "min": number,
    "max": number,
    "recommended": number
  },
  "duration": number,
  "genre": ["string"],
  "tags": ["string"],
  "settings": {
    "era": "string",
    "location": "string",
    "theme": "string"
  },
  "metadata": {
    "isPublic": boolean,
    "price": number,
    "language": "string",
    "version": "string"
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
    "difficulty": number,
    "playerCount": {
      "min": number,
      "max": number,
      "recommended": number
    },
    "duration": number,
    "genre": ["string"],
    "tags": ["string"],
    "settings": {
      "era": "string",
      "location": "string",
      "theme": "string"
    },
    "metadata": {
      "isPublic": boolean,
      "price": number,
      "language": "string",
      "version": "string"
    },
    "updatedAt": "string"
  }
}
```

## 删除剧本

删除指定的剧本。

### 请求

```http
DELETE /api/v1/scripts/:id
Authorization: Bearer <token>
```

### 响应

```json
{
  "success": true,
  "message": "删除成功"
}
```

## 发布剧本

将剧本状态更改为已发布。

### 请求

```http
POST /api/v1/scripts/:id/publish
Authorization: Bearer <token>
Content-Type: application/json

{
  "version": "string",
  "releaseNotes": "string",
  "price": number
}
```

### 参数说明

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| version | string | 是 | 发布版本号 |
| releaseNotes | string | 否 | 发布说明 |
| price | number | 否 | 发布价格 |

### 响应

```json
{
  "success": true,
  "message": "发布成功",
  "data": {
    "id": "string",
    "status": "published",
    "publishedAt": "string",
    "version": "string",
    "releaseNotes": "string",
    "price": number
  }
}
```

## 错误码

| 错误码 | 描述 | HTTP状态码 |
|--------|------|------------|
| SCRIPT_NOT_FOUND | 剧本不存在 | 404 |
| SCRIPT_TITLE_EXISTS | 剧本标题已存在 | 400 |
| SCRIPT_INVALID_TYPE | 无效的剧本类型 | 400 |
| SCRIPT_INVALID_DIFFICULTY | 无效的难度等级 | 400 |
| SCRIPT_INVALID_PLAYER_COUNT | 无效的玩家人数 | 400 |
| SCRIPT_INVALID_DURATION | 无效的游戏时长 | 400 |
| SCRIPT_NOT_COMPLETE | 剧本信息不完整 | 400 |
| SCRIPT_ALREADY_PUBLISHED | 剧本已发布 | 400 | 