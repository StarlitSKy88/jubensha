# API 文档

## 概述

本文档描述了AI辅助剧本杀创作平台的API接口。所有API都使用HTTP/HTTPS协议,返回JSON格式的数据。

## 基础信息

- 基础URL: `https://api.example.com/api/v1`
- 所有请求都需要在header中携带认证token: `Authorization: Bearer <token>`
- 所有时间相关的字段都使用UTC时间,格式为ISO 8601

## 认证

### 登录

```http
POST /auth/login
```

请求参数:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

响应:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer"
}
```

### 注册

```http
POST /auth/register
```

请求参数:
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

响应:
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "is_active": true,
  "created_at": "2024-01-28T12:00:00Z"
}
```

## 项目管理

### 获取项目列表

```http
GET /projects?skip=0&limit=10&status=draft
```

查询参数:
- `skip`: 跳过的记录数(分页)
- `limit`: 返回的最大记录数(分页)
- `status`: 项目状态(draft/published/archived)

响应:
```json
{
  "total": 100,
  "items": [
    {
      "id": 1,
      "title": "项目标题",
      "description": "项目描述",
      "cover_url": "https://example.com/cover.jpg",
      "status": "draft",
      "version": 1,
      "created_at": "2024-01-28T12:00:00Z",
      "updated_at": "2024-01-28T12:00:00Z"
    }
  ]
}
```

### 创建项目

```http
POST /projects
```

请求参数:
```json
{
  "title": "项目标题",
  "description": "项目描述",
  "cover_url": "https://example.com/cover.jpg"
}
```

响应: 返回创建的项目详情

### 获取项目详情

```http
GET /projects/{project_id}
```

响应: 返回项目详情

### 更新项目

```http
PUT /projects/{project_id}
```

请求参数:
```json
{
  "title": "新标题",
  "description": "新描述",
  "status": "published"
}
```

响应: 返回更新后的项目详情

### 删除项目

```http
DELETE /projects/{project_id}
```

响应:
```json
{
  "status": "success"
}
```

## AI服务

### 生成内容

```http
POST /ai/generate
```

请求参数:
```json
{
  "project_id": 1,
  "prompt": "生成一个悬疑剧本的开场",
  "type": "content",
  "max_tokens": 2000,
  "temperature": 0.7,
  "top_p": 0.9,
  "context": {
    "background": "故事发生在一个偏远的山村...",
    "characters": [
      {
        "name": "张三",
        "description": "村长,50岁"
      }
    ]
  }
}
```

响应:
```json
{
  "content": "生成的内容...",
  "metadata": {
    "tokens": 1500,
    "processingTime": 2.5
  }
}
```

### 验证内容

```http
POST /ai/validate
```

请求参数:
```json
{
  "project_id": 1,
  "content": "待验证的内容...",
  "type": "logic",
  "criteria": {
    "logic_check": true,
    "character_check": true
  },
  "context": {
    "rules": [
      "故事必须符合逻辑",
      "人物性格要统一"
    ]
  }
}
```

响应:
```json
{
  "is_valid": true,
  "score": 85,
  "issues": [
    {
      "type": "logic",
      "description": "情节存在逻辑漏洞",
      "suggestion": "建议修改...",
      "severity": "medium"
    }
  ],
  "suggestions": [
    "建议1",
    "建议2"
  ],
  "metadata": {
    "tokens": 1000,
    "processingTime": 1.5
  }
}
```

### 获取使用统计

```http
GET /ai/usage
```

响应:
```json
{
  "total_calls": 100,
  "total_tokens": 150000,
  "avg_processing_time": 2.3,
  "operation_stats": {
    "generate": {
      "count": 80,
      "tokens": 120000,
      "avg_processing_time": 2.5
    },
    "validate": {
      "count": 20,
      "tokens": 30000,
      "avg_processing_time": 1.5
    }
  }
}
```

## 错误处理

所有API在发生错误时都会返回相应的HTTP状态码和错误信息:

```json
{
  "message": "错误信息",
  "code": "error_code",
  "details": {
    "field": "错误详情"
  }
}
```

常见错误码:
- 400: 请求参数错误
- 401: 未认证
- 403: 无权限
- 404: 资源不存在
- 429: 请求过于频繁
- 500: 服务器内部错误

## 数据模型

### User
```typescript
{
  id: number;
  email: string;
  username: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
}
```

### Project
```typescript
{
  id: number;
  title: string;
  description?: string;
  cover_url?: string;
  status: "draft" | "published" | "archived";
  user_id: number;
  version: number;
  parent_version?: number;
  content?: string;
  metadata?: object;
  created_at: string;
  updated_at: string;
}
```

### AIUsage
```typescript
{
  id: number;
  user_id: number;
  project_id?: number;
  operation_type: string;
  model_name: string;
  tokens_used: number;
  processing_time: number;
  cost: number;
  request_params: object;
  response_metadata: object;
  created_at: string;
}
``` 