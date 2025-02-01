# API接口文档

## 接口规范
1. 基础URL: `/api/v1`
2. 认证方式: JWT Token
3. 响应格式: JSON
4. 错误处理: 统一错误响应格式

## 认证相关接口

### 用户注册
```http
POST /auth/register
Content-Type: application/json

{
    "email": "user@example.com",
    "username": "username",
    "password": "password"
}

Response 200:
{
    "id": 1,
    "email": "user@example.com",
    "username": "username",
    "is_active": true
}
```

### 用户登录
```http
POST /auth/login
Content-Type: application/json

{
    "username": "username",
    "password": "password"
}

Response 200:
{
    "access_token": "eyJ...",
    "token_type": "bearer"
}
```

## 项目相关接口

### 创建项目
```http
POST /projects
Authorization: Bearer {token}
Content-Type: application/json

{
    "title": "项目标题",
    "description": "项目描述",
    "cover_url": "封面URL"
}

Response 200:
{
    "id": 1,
    "title": "项目标题",
    "description": "项目描述",
    "cover_url": "封面URL",
    "status": "draft",
    "version": 1
}
```

### 获取项目列表
```http
GET /projects
Authorization: Bearer {token}

Response 200:
{
    "total": 10,
    "items": [
        {
            "id": 1,
            "title": "项目标题",
            "description": "项目描述",
            "status": "draft",
            "created_at": "2024-01-30T10:00:00Z"
        }
    ]
}
```

### 获取项目详情
```http
GET /projects/{project_id}
Authorization: Bearer {token}

Response 200:
{
    "id": 1,
    "title": "项目标题",
    "description": "项目描述",
    "content": "项目内容",
    "status": "draft",
    "version": 1,
    "created_at": "2024-01-30T10:00:00Z",
    "updated_at": "2024-01-30T10:00:00Z"
}
```

## AI服务接口

### 获取写作建议
```http
POST /ai/suggestions
Authorization: Bearer {token}
Content-Type: application/json

{
    "project_id": 1,
    "content": "当前内容",
    "type": "plot"  // plot, character, dialogue
}

Response 200:
{
    "suggestions": [
        {
            "type": "plot",
            "content": "建议内容",
            "confidence": 0.95
        }
    ],
    "usage": {
        "tokens": 100,
        "cost": 0.002
    }
}
```

### 生成对话
```http
POST /ai/dialogues
Authorization: Bearer {token}
Content-Type: application/json

{
    "project_id": 1,
    "characters": ["角色A", "角色B"],
    "context": "场景描述",
    "tone": "欢快"
}

Response 200:
{
    "dialogue": [
        {
            "character": "角色A",
            "content": "对话内容"
        }
    ],
    "usage": {
        "tokens": 150,
        "cost": 0.003
    }
}
```

## 错误码说明
- 400: 请求参数错误
- 401: 未认证
- 403: 权限不足
- 404: 资源不存在
- 500: 服务器内部错误

## 限流策略
1. 普通用户
   - API调用: 100次/分钟
   - AI服务: 1000 tokens/分钟

2. 高级用户
   - API调用: 1000次/分钟
   - AI服务: 10000 tokens/分钟 