# API 文档

## 概述

剧本杀创作助手API提供了一套完整的RESTful接口，用于支持剧本创作、角色管理、时间线管理等功能。

## 基础信息

- 基础URL: `http://localhost:3000/api/v1`
- 认证方式: Bearer Token
- 响应格式: JSON
- 默认分页: 10条/页

## 通用格式

### 请求头

```http
Authorization: Bearer <token>
Content-Type: application/json
Accept: application/json
```

### 成功响应

```json
{
  "success": true,
  "message": "操作成功",
  "data": {}
}
```

### 错误响应

```json
{
  "success": false,
  "message": "错误信息",
  "error": {
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

### 分页响应

```json
{
  "success": true,
  "data": {
    "items": [],
    "total": 0,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

## 错误码

| 错误码 | 描述 | HTTP状态码 |
|--------|------|------------|
| UNAUTHORIZED | 未认证 | 401 |
| FORBIDDEN | 无权限 | 403 |
| NOT_FOUND | 资源不存在 | 404 |
| VALIDATION_ERROR | 参数验证失败 | 400 |
| INTERNAL_ERROR | 服务器内部错误 | 500 |

## API 目录

1. [认证服务](./auth.md)
   - 用户注册
   - 用户登录
   - 获取当前用户
   - 更新用户信息

2. [剧本管理](./script.md)
   - 创建剧本
   - 更新剧本
   - 获取剧本列表
   - 获取剧本详情

3. [角色管理](./character.md)
   - 创建角色
   - 更新角色
   - 获取角色列表
   - 获取角色详情

4. [时间线管理](./timeline.md)
   - 创建事件
   - 更新事件
   - 获取时间线
   - 获取事件详情

5. [知识库管理](./knowledge.md)
   - 创建知识
   - 更新知识
   - 搜索知识
   - 批量导入

6. [AI服务](./ai.md)
   - 获取建议
   - 生成内容
   - 分析剧情
   - 优化对话

## 使用指南

### 认证流程

1. 调用登录接口获取token
2. 在请求头中添加token
3. 使用refresh token续期

### 错误处理

1. 检查响应状态码
2. 解析错误信息
3. 根据错误码处理

### 最佳实践

1. 使用适当的HTTP方法
2. 处理所有错误情况
3. 实现请求重试机制
4. 合理使用缓存

## 更新日志

### v1.0.0 (2024-02-16)
- 初始版本发布
- 基础功能实现
- 认证系统完成

## 联系我们

如有问题或建议，请通过以下方式联系：
- 提交Issue
- 发送邮件
- 参与讨论 