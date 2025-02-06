# 认证接口

## 用户注册

创建新用户账号。

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password",
  "confirmPassword": "password"
}
```

### 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| email | string | 是 | 用户邮箱 |
| username | string | 是 | 用户名 |
| password | string | 是 | 密码 |
| confirmPassword | string | 是 | 确认密码 |

### 响应示例

```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "username": "username",
    "role": "user",
    "status": "active",
    "createdAt": "2024-02-07T10:00:00Z"
  }
}
```

### 错误响应

```json
{
  "success": false,
  "message": "注册失败",
  "errors": [
    {
      "field": "email",
      "message": "邮箱已被注册"
    }
  ]
}
```

## 用户登录

用户登录并获取访问令牌。

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}
```

### 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| email | string | 是 | 用户邮箱 |
| password | string | 是 | 密码 |

### 响应示例

```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400,
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "username": "username",
      "role": "user"
    }
  }
}
```

## 获取当前用户

获取当前登录用户的信息。

```http
GET /api/v1/auth/me
Authorization: Bearer <token>
```

### 响应示例

```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "username": "username",
    "role": "user",
    "status": "active",
    "createdAt": "2024-02-07T10:00:00Z",
    "lastLoginAt": "2024-02-07T15:00:00Z"
  }
}
```

## 更新用户信息

更新当前用户的个人信息。

```http
PUT /api/v1/auth/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "new_username",
  "avatar": "avatar_url",
  "bio": "用户简介"
}
```

### 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 否 | 新用户名 |
| avatar | string | 否 | 头像URL |
| bio | string | 否 | 用户简介 |

### 响应示例

```json
{
  "success": true,
  "message": "更新成功",
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "username": "new_username",
    "avatar": "avatar_url",
    "bio": "用户简介",
    "updatedAt": "2024-02-07T16:00:00Z"
  }
}
```

## 刷新令牌

使用刷新令牌获取新的访问令牌。

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| refreshToken | string | 是 | 刷新令牌 |

### 响应示例

```json
{
  "success": true,
  "message": "刷新成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400
  }
}
```

## 修改密码

修改当前用户的密码。

```http
PUT /api/v1/auth/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "old_password",
  "newPassword": "new_password",
  "confirmPassword": "new_password"
}
```

### 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| currentPassword | string | 是 | 当前密码 |
| newPassword | string | 是 | 新密码 |
| confirmPassword | string | 是 | 确认新密码 |

### 响应示例

```json
{
  "success": true,
  "message": "密码修改成功",
  "data": {
    "updatedAt": "2024-02-07T17:00:00Z"
  }
}
```

## 退出登录

注销当前用户的会话。

```http
POST /api/v1/auth/logout
Authorization: Bearer <token>
```

### 响应示例

```json
{
  "success": true,
  "message": "退出成功"
}
```

## 错误码

| 状态码 | 错误码 | 说明 |
|--------|--------|------|
| 400 | INVALID_PARAMS | 参数验证失败 |
| 401 | UNAUTHORIZED | 未认证或认证失败 |
| 403 | FORBIDDEN | 权限不足 |
| 404 | USER_NOT_FOUND | 用户不存在 |
| 409 | EMAIL_EXISTS | 邮箱已存在 |
| 409 | USERNAME_EXISTS | 用户名已存在 |
| 422 | INVALID_PASSWORD | 密码错误 | 