# 角色管理 API

## 创建角色

在剧本中创建新角色。

### 请求

```http
POST /api/v1/scripts/:scriptId/characters
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "string",
  "gender": "string",
  "age": number,
  "role": "string",
  "description": "string",
  "background": "string",
  "personality": "string",
  "goals": ["string"],
  "relationships": [
    {
      "targetId": "string",
      "type": "string",
      "description": "string"
    }
  ],
  "metadata": {
    "occupation": "string",
    "status": "string",
    "isPublic": boolean,
    "tags": ["string"]
  }
}
```

### 参数说明

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| name | string | 是 | 角色名称 |
| gender | string | 是 | 性别 |
| age | number | 是 | 年龄 |
| role | string | 是 | 角色类型，如 'main', 'support', 'npc' |
| description | string | 是 | 角色简介 |
| background | string | 否 | 背景故事 |
| personality | string | 否 | 性格特征 |
| goals | string[] | 否 | 目标列表 |
| relationships | object[] | 否 | 角色关系 |
| relationships[].targetId | string | 是 | 关系目标角色ID |
| relationships[].type | string | 是 | 关系类型 |
| relationships[].description | string | 否 | 关系描述 |
| metadata | object | 否 | 元数据 |
| metadata.occupation | string | 否 | 职业 |
| metadata.status | string | 否 | 状态 |
| metadata.isPublic | boolean | 否 | 是否公开 |
| metadata.tags | string[] | 否 | 标签列表 |

### 响应

```json
{
  "success": true,
  "message": "创建成功",
  "data": {
    "id": "string",
    "name": "string",
    "gender": "string",
    "age": number,
    "role": "string",
    "description": "string",
    "background": "string",
    "personality": "string",
    "goals": ["string"],
    "relationships": [
      {
        "targetId": "string",
        "type": "string",
        "description": "string"
      }
    ],
    "metadata": {
      "occupation": "string",
      "status": "string",
      "isPublic": boolean,
      "tags": ["string"]
    },
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

## 获取角色列表

获取剧本中的角色列表。

### 请求

```http
GET /api/v1/scripts/:scriptId/characters
Authorization: Bearer <token>
```

### 查询参数

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| role | string | 否 | 角色类型过滤 |
| gender | string | 否 | 性别过滤 |
| age | string | 否 | 年龄范围，如 '18-25' |
| search | string | 否 | 搜索关键词 |
| tags | string | 否 | 标签过滤（逗号分隔） |
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
        "name": "string",
        "gender": "string",
        "age": number,
        "role": "string",
        "description": "string",
        "metadata": {
          "occupation": "string",
          "status": "string",
          "tags": ["string"]
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

## 获取角色详情

获取单个角色的详细信息。

### 请求

```http
GET /api/v1/scripts/:scriptId/characters/:id
Authorization: Bearer <token>
```

### 响应

```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "gender": "string",
    "age": number,
    "role": "string",
    "description": "string",
    "background": "string",
    "personality": "string",
    "goals": ["string"],
    "relationships": [
      {
        "target": {
          "id": "string",
          "name": "string",
          "role": "string"
        },
        "type": "string",
        "description": "string"
      }
    ],
    "metadata": {
      "occupation": "string",
      "status": "string",
      "isPublic": boolean,
      "tags": ["string"]
    },
    "statistics": {
      "eventCount": number,
      "clueCount": number,
      "relationshipCount": number
    },
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

## 更新角色

更新角色信息。

### 请求

```http
PUT /api/v1/scripts/:scriptId/characters/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "string",
  "gender": "string",
  "age": number,
  "role": "string",
  "description": "string",
  "background": "string",
  "personality": "string",
  "goals": ["string"],
  "relationships": [
    {
      "targetId": "string",
      "type": "string",
      "description": "string"
    }
  ],
  "metadata": {
    "occupation": "string",
    "status": "string",
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
    "name": "string",
    "gender": "string",
    "age": number,
    "role": "string",
    "description": "string",
    "background": "string",
    "personality": "string",
    "goals": ["string"],
    "relationships": [
      {
        "targetId": "string",
        "type": "string",
        "description": "string"
      }
    ],
    "metadata": {
      "occupation": "string",
      "status": "string",
      "isPublic": boolean,
      "tags": ["string"]
    },
    "updatedAt": "string"
  }
}
```

## 删除角色

删除指定的角色。

### 请求

```http
DELETE /api/v1/scripts/:scriptId/characters/:id
Authorization: Bearer <token>
```

### 响应

```json
{
  "success": true,
  "message": "删除成功"
}
```

## 添加角色关系

添加角色之间的关系。

### 请求

```http
POST /api/v1/scripts/:scriptId/characters/:id/relationships
Authorization: Bearer <token>
Content-Type: application/json

{
  "targetId": "string",
  "type": "string",
  "description": "string",
  "isSecret": boolean,
  "metadata": {
    "strength": number,
    "tags": ["string"]
  }
}
```

### 参数说明

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| targetId | string | 是 | 目标角色ID |
| type | string | 是 | 关系类型 |
| description | string | 否 | 关系描述 |
| isSecret | boolean | 否 | 是否为隐藏关系 |
| metadata | object | 否 | 元数据 |
| metadata.strength | number | 否 | 关系强度(1-5) |
| metadata.tags | string[] | 否 | 关系标签 |

### 响应

```json
{
  "success": true,
  "message": "添加成功",
  "data": {
    "id": "string",
    "sourceId": "string",
    "targetId": "string",
    "type": "string",
    "description": "string",
    "isSecret": boolean,
    "metadata": {
      "strength": number,
      "tags": ["string"]
    },
    "createdAt": "string"
  }
}
```

## 错误码

| 错误码 | 描述 | HTTP状态码 |
|--------|------|------------|
| CHARACTER_NOT_FOUND | 角色不存在 | 404 |
| CHARACTER_NAME_EXISTS | 角色名称已存在 | 400 |
| CHARACTER_INVALID_ROLE | 无效的角色类型 | 400 |
| CHARACTER_INVALID_AGE | 无效的年龄 | 400 |
| CHARACTER_RELATIONSHIP_EXISTS | 关系已存在 | 400 |
| CHARACTER_RELATIONSHIP_INVALID | 无效的关系类型 | 400 | 