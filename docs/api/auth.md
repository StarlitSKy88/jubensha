# 认证服务 API

## 用户注册

注册新用户账号。

### 请求

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string",
  "confirmPassword": "string"
}
```

### 参数说明

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| username | string | 是 | 用户名，3-20个字符 |
| email | string | 是 | 邮箱地址 |
| password | string | 是 | 密码，至少8个字符 |
| confirmPassword | string | 是 | 确认密码 |

### 响应

```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "role": "user",
      "createdAt": "string"
    },
    "token": "string"
  }
}
```

## 用户登录

登录已有账号。

### 请求

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}
```

### 参数说明

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| email | string | 是 | 邮箱地址 |
| password | string | 是 | 密码 |

### 响应

```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "role": "string",
      "createdAt": "string"
    },
    "token": "string",
    "refreshToken": "string"
  }
}
```

## 获取当前用户

获取当前登录用户的信息。

### 请求

```http
GET /api/v1/auth/me
Authorization: Bearer <token>
```

### 响应

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "role": "string",
      "createdAt": "string",
      "lastLoginAt": "string"
    }
  }
}
```

## 更新用户信息

更新当前用户的个人信息。

### 请求

```http
PUT /api/v1/auth/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "currentPassword": "string",
  "newPassword": "string"
}
```

### 参数说明

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| username | string | 否 | 新用户名 |
| email | string | 否 | 新邮箱地址 |
| currentPassword | string | 是* | 当前密码（修改密码时必需） |
| newPassword | string | 否 | 新密码 |

### 响应

```json
{
  "success": true,
  "message": "更新成功",
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "role": "string",
      "updatedAt": "string"
    }
  }
}
```

## 刷新Token

使用refresh token获取新的访问token。

### 请求

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "string"
}
```

### 参数说明

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| refreshToken | string | 是 | 刷新令牌 |

### 响应

```json
{
  "success": true,
  "data": {
    "token": "string",
    "refreshToken": "string"
  }
}
```

## 退出登录

注销当前用户的会话。

### 请求

```http
POST /api/v1/auth/logout
Authorization: Bearer <token>
```

### 响应

```json
{
  "success": true,
  "message": "退出成功"
}
```

## 错误码

| 错误码 | 描述 | HTTP状态码 |
|--------|------|------------|
| AUTH_INVALID_CREDENTIALS | 无效的凭证 | 401 |
| AUTH_EMAIL_EXISTS | 邮箱已存在 | 400 |
| AUTH_USERNAME_EXISTS | 用户名已存在 | 400 |
| AUTH_PASSWORD_MISMATCH | 密码不匹配 | 400 |
| AUTH_TOKEN_EXPIRED | Token已过期 | 401 |
| AUTH_TOKEN_INVALID | Token无效 | 401 |
| AUTH_USER_NOT_FOUND | 用户不存在 | 404 | 