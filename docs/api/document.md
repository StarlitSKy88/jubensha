# 文档服务 API 文档

## 基础信息

- 基础路径: `/api/v1/documents`
- 需要认证: 是
- 权限要求: 用户级别

## API 端点

### 1. 创建文档

#### 请求

- 方法: `POST`
- 路径: `/`
- 请求体:
```json
{
  "title": "string",
  "content": "string",
  "type": "script | rule | note",
  "tags": ["string"],
  "status": "draft | published | archived"
}
```

#### 响应

- 成功响应 (200):
```json
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "content": "string",
    "type": "string",
    "tags": ["string"],
    "status": "string",
    "version": 1,
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

### 2. 获取文档列表

#### 请求

- 方法: `GET`
- 路径: `/`
- 查询参数:
  - `page`: 页码 (默认: 1)
  - `limit`: 每页数量 (默认: 10)
  - `type`: 文档类型
  - `status`: 文档状态
  - `tags`: 标签数组

#### 响应

- 成功响应 (200):
```json
{
  "success": true,
  "data": {
    "items": [{
      "id": "string",
      "title": "string",
      "type": "string",
      "status": "string",
      "updatedAt": "string"
    }],
    "total": 0,
    "page": 1,
    "limit": 10,
    "pages": 0
  }
}
```

### 3. 获取文档详情

#### 请求

- 方法: `GET`
- 路径: `/:id`

#### 响应

- 成功响应 (200):
```json
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "content": "string",
    "type": "string",
    "tags": ["string"],
    "status": "string",
    "version": 1,
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

### 4. 更新文档

#### 请求

- 方法: `PUT`
- 路径: `/:id`
- 请求体:
```json
{
  "title": "string",
  "content": "string",
  "type": "string",
  "tags": ["string"],
  "status": "string"
}
```

#### 响应

- 成功响应 (200):
```json
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "content": "string",
    "type": "string",
    "tags": ["string"],
    "status": "string",
    "version": 2,
    "updatedAt": "string"
  }
}
```

### 5. 删除文档

#### 请求

- 方法: `DELETE`
- 路径: `/:id`

#### 响应

- 成功响应 (200):
```json
{
  "success": true,
  "message": "文档已删除"
}
```

### 6. 获取文档版本历史

#### 请求

- 方法: `GET`
- 路径: `/:id/versions`
- 查询参数:
  - `page`: 页码 (默认: 1)
  - `limit`: 每页数量 (默认: 10)

#### 响应

- 成功响应 (200):
```json
{
  "success": true,
  "data": {
    "items": [{
      "version": 1,
      "title": "string",
      "changes": [{
        "field": "string",
        "oldValue": "any",
        "newValue": "any"
      }],
      "createdAt": "string",
      "createdBy": "string"
    }],
    "total": 0,
    "page": 1,
    "limit": 10,
    "pages": 0
  }
}
```

## 错误响应

所有API端点的错误响应格式统一如下：

```json
{
  "success": false,
  "error": {
    "code": "string",
    "message": "string",
    "details": "object | null"
  }
}
```

### 错误代码说明

- 400: 请求参数错误
- 401: 未认证
- 403: 无权限
- 404: 资源不存在
- 409: 资源冲突
- 500: 服务器内部错误 