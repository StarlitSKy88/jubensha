# 角色管理接口

## 创建角色

在指定剧本中创建新角色。

```http
POST /api/v1/scripts/{script_id}/characters
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "角色名称",
  "gender": "male",
  "age": 28,
  "occupation": "医生",
  "description": "角色简介",
  "personality": {
    "traits": ["冷静", "理性", "谨慎"],
    "mbti": "INTJ"
  },
  "background": "角色背景故事",
  "motivation": "角色动机",
  "secrets": [
    {
      "content": "秘密内容",
      "level": "core",
      "relatedCharacters": ["character_id1", "character_id2"]
    }
  ],
  "relationships": [
    {
      "targetId": "character_id1",
      "type": "friend",
      "description": "关系描述"
    }
  ],
  "items": [
    {
      "name": "物品名称",
      "description": "物品描述",
      "isKey": true
    }
  ],
  "tags": ["关键人物", "嫌疑人"]
}
```

### 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 角色名称 |
| gender | string | 是 | 性别(male/female/other) |
| age | number | 是 | 年龄 |
| occupation | string | 是 | 职业 |
| description | string | 是 | 角色简介 |
| personality | object | 是 | 性格特征 |
| personality.traits | string[] | 是 | 性格标签 |
| personality.mbti | string | 否 | MBTI类型 |
| background | string | 是 | 背景故事 |
| motivation | string | 是 | 角色动机 |
| secrets | object[] | 否 | 秘密列表 |
| secrets[].content | string | 是 | 秘密内容 |
| secrets[].level | string | 是 | 重要程度(core/major/minor) |
| secrets[].relatedCharacters | string[] | 否 | 相关角色ID |
| relationships | object[] | 否 | 角色关系 |
| relationships[].targetId | string | 是 | 目标角色ID |
| relationships[].type | string | 是 | 关系类型 |
| relationships[].description | string | 是 | 关系描述 |
| items | object[] | 否 | 随身物品 |
| items[].name | string | 是 | 物品名称 |
| items[].description | string | 是 | 物品描述 |
| items[].isKey | boolean | 否 | 是否关键物品 |
| tags | string[] | 否 | 标签列表 |

### 响应示例

```json
{
  "success": true,
  "message": "创建成功",
  "data": {
    "id": "character_id",
    "scriptId": "script_id",
    "name": "角色名称",
    "gender": "male",
    "age": 28,
    "occupation": "医生",
    "description": "角色简介",
    "personality": {
      "traits": ["冷静", "理性", "谨慎"],
      "mbti": "INTJ"
    },
    "background": "角色背景故事",
    "motivation": "角色动机",
    "secrets": [
      {
        "id": "secret_id",
        "content": "秘密内容",
        "level": "core",
        "relatedCharacters": ["character_id1", "character_id2"]
      }
    ],
    "relationships": [
      {
        "id": "relationship_id",
        "targetId": "character_id1",
        "type": "friend",
        "description": "关系描述"
      }
    ],
    "items": [
      {
        "id": "item_id",
        "name": "物品名称",
        "description": "物品描述",
        "isKey": true
      }
    ],
    "tags": ["关键人物", "嫌疑人"],
    "createdAt": "2024-02-07T10:00:00Z",
    "createdBy": "user_id"
  }
}
```

## 获取角色列表

获取剧本中的角色列表。

```http
GET /api/v1/scripts/{script_id}/characters?page=1&limit=10&tags=关键人物
Authorization: Bearer <token>
```

### 查询参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码(默认1) |
| limit | number | 否 | 每页数量(默认10) |
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
        "id": "character_id",
        "name": "角色名称",
        "gender": "male",
        "age": 28,
        "occupation": "医生",
        "description": "角色简介",
        "tags": ["关键人物", "嫌疑人"],
        "createdAt": "2024-02-07T10:00:00Z"
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

## 获取角色详情

获取单个角色的详细信息。

```http
GET /api/v1/scripts/{script_id}/characters/{character_id}
Authorization: Bearer <token>
```

### 响应示例

```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "id": "character_id",
    "scriptId": "script_id",
    "name": "角色名称",
    "gender": "male",
    "age": 28,
    "occupation": "医生",
    "description": "角色简介",
    "personality": {
      "traits": ["冷静", "理性", "谨慎"],
      "mbti": "INTJ"
    },
    "background": "角色背景故事",
    "motivation": "角色动机",
    "secrets": [
      {
        "id": "secret_id",
        "content": "秘密内容",
        "level": "core",
        "relatedCharacters": ["character_id1", "character_id2"]
      }
    ],
    "relationships": [
      {
        "id": "relationship_id",
        "targetId": "character_id1",
        "type": "friend",
        "description": "关系描述",
        "character": {
          "id": "character_id1",
          "name": "关联角色名称"
        }
      }
    ],
    "items": [
      {
        "id": "item_id",
        "name": "物品名称",
        "description": "物品描述",
        "isKey": true
      }
    ],
    "tags": ["关键人物", "嫌疑人"],
    "timeline": ["event_id1", "event_id2"],
    "createdAt": "2024-02-07T10:00:00Z",
    "updatedAt": "2024-02-07T15:00:00Z",
    "createdBy": "user_id"
  }
}
```

## 更新角色

更新角色信息。

```http
PUT /api/v1/scripts/{script_id}/characters/{character_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "新角色名称",
  "description": "新角色简介",
  "personality": {
    "traits": ["冷静", "理性", "谨慎", "新特征"],
    "mbti": "INTJ"
  },
  "background": "更新的背景故事",
  "motivation": "更新的动机",
  "secrets": [
    {
      "content": "新的秘密",
      "level": "major",
      "relatedCharacters": ["character_id3"]
    }
  ]
}
```

### 响应示例

```json
{
  "success": true,
  "message": "更新成功",
  "data": {
    "id": "character_id",
    "name": "新角色名称",
    "description": "新角色简介",
    "personality": {
      "traits": ["冷静", "理性", "谨慎", "新特征"],
      "mbti": "INTJ"
    },
    "background": "更新的背景故事",
    "motivation": "更新的动机",
    "secrets": [
      {
        "id": "secret_id",
        "content": "新的秘密",
        "level": "major",
        "relatedCharacters": ["character_id3"]
      }
    ],
    "updatedAt": "2024-02-07T16:00:00Z"
  }
}
```

## 删除角色

删除指定的角色。

```http
DELETE /api/v1/scripts/{script_id}/characters/{character_id}
Authorization: Bearer <token>
```

### 响应示例

```json
{
  "success": true,
  "message": "删除成功"
}
```

## 获取角色关系图

获取角色之间的关系网络。

```http
GET /api/v1/scripts/{script_id}/characters/network
Authorization: Bearer <token>
```

### 响应示例

```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "nodes": [
      {
        "id": "character_id1",
        "name": "角色1",
        "type": "suspect"
      },
      {
        "id": "character_id2",
        "name": "角色2",
        "type": "victim"
      }
    ],
    "edges": [
      {
        "source": "character_id1",
        "target": "character_id2",
        "type": "friend",
        "description": "关系描述"
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
| 404 | CHARACTER_NOT_FOUND | 角色不存在 |
| 404 | SCRIPT_NOT_FOUND | 剧本不存在 |
| 409 | NAME_EXISTS | 角色名称已存在 | 