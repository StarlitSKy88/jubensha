# API 规范文档

## 认证接口

### 1. 用户注册
```http
POST /api/v1/auth/register

Request:
{
    "username": "string",
    "email": "string",
    "password": "string"
}

Response:
{
    "user_id": "string",
    "username": "string",
    "email": "string",
    "created_at": "datetime"
}
```

### 2. 用户登录
```http
POST /api/v1/auth/login

Request:
{
    "username": "string",
    "password": "string"
}

Response:
{
    "token": "string",
    "user": {
        "user_id": "string",
        "username": "string",
        "email": "string"
    }
}
```

### 3. 会话检查
```http
GET /api/v1/auth/session

Headers:
Authorization: Bearer <token>

Response:
{
    "is_valid": boolean,
    "user": {
        "user_id": "string",
        "username": "string",
        "email": "string"
    }
}
```

### 4. 登出
```http
POST /api/v1/auth/logout

Headers:
Authorization: Bearer <token>

Response:
{
    "message": "Successfully logged out"
}
```

## 项目管理接口

### 1. 创建项目
```http
POST /api/v1/projects

Headers:
Authorization: Bearer <token>

Request:
{
    "title": "string",
    "description": "string",
    "template_id": "string"
}

Response:
{
    "project_id": "string",
    "title": "string",
    "description": "string",
    "created_at": "datetime",
    "updated_at": "datetime"
}
```

### 2. 获取项目列表
```http
GET /api/v1/projects

Headers:
Authorization: Bearer <token>

Query Parameters:
page: integer (default: 1)
limit: integer (default: 10)

Response:
{
    "total": integer,
    "page": integer,
    "limit": integer,
    "projects": [
        {
            "project_id": "string",
            "title": "string",
            "description": "string",
            "created_at": "datetime",
            "updated_at": "datetime"
        }
    ]
}
```

## AI生成接口

### 1. 生成内容
```http
POST /api/v1/ai/generate

Headers:
Authorization: Bearer <token>

Request:
{
    "project_id": "string",
    "prompt": "string",
    "type": "string" // "plot" | "character" | "dialogue"
}

Response:
{
    "content": "string",
    "suggestions": [
        {
            "type": "string",
            "content": "string"
        }
    ]
}
```

### 2. 优化内容
```http
POST /api/v1/ai/optimize

Headers:
Authorization: Bearer <token>

Request:
{
    "project_id": "string",
    "content": "string",
    "aspect": "string" // "logic" | "style" | "emotion"
}

Response:
{
    "optimized_content": "string",
    "changes": [
        {
            "type": "string",
            "description": "string"
        }
    ]
}
```

## 导出接口

### 1. 导出项目
```http
POST /api/v1/export

Headers:
Authorization: Bearer <token>

Request:
{
    "project_id": "string",
    "format": "string", // "docx" | "pdf"
    "template_id": "string"
}

Response:
{
    "download_url": "string",
    "expires_at": "datetime"
}
```

## 错误响应格式

```http
{
    "error": {
        "code": "string",
        "message": "string",
        "details": object
    }
}
```

## 状态码说明

- 200: 成功
- 201: 创建成功
- 400: 请求参数错误
- 401: 未认证
- 403: 无权限
- 404: 资源不存在
- 409: 资源冲突
- 429: 请求过于频繁
- 500: 服务器错误

## WebSocket接口

### 1. 会话管理
```websocket
WS /ws/session

Events:
1. 强制登出
{
    "type": "FORCE_LOGOUT",
    "message": "string"
}

2. 会话过期
{
    "type": "SESSION_EXPIRED",
    "message": "string"
}
```

## 安全要求

1. 认证要求
   - 所有非公开接口必须包含有效的JWT token
   - Token通过Authorization header传递
   - Token过期时间为24小时

2. 请求限制
   - 登录接口: 5次/分钟
   - AI生成接口: 10次/分钟
   - 普通接口: 60次/分钟

3. 数据验证
   - 所有输入必须进行验证和清理
   - 敏感数据必须加密传输
   - 文件上传限制大小和类型 