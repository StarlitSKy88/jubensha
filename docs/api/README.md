# 剧本杀创作助手 API 文档

## 简介

剧本杀创作助手 API 提供了一套完整的 RESTful 接口，用于管理和创作剧本杀剧本。通过这些 API，您可以：

- 创建和管理剧本
- 设计和管理角色
- 编排事件和时间线
- 管理线索和关联
- 使用 AI 辅助创作

## 基础信息

### 接口规范

- 基础路径: `/api/v1`
- 请求方法: GET, POST, PUT, DELETE
- 内容类型: `application/json`
- 字符编码: UTF-8

### 认证方式

所有 API 请求都需要在 HTTP Header 中包含 JWT Token：

```http
Authorization: Bearer <token>
```

### 响应格式

标准响应格式：

```json
{
  "success": boolean,
  "message": "string",
  "data": object
}
```

分页响应格式：

```json
{
  "success": true,
  "data": {
    "items": [],
    "total": number,
    "page": number,
    "limit": number,
    "pages": number
  }
}
```

### 错误处理

错误响应格式：

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

HTTP 状态码使用：

- 200: 成功
- 400: 请求参数错误
- 401: 未认证
- 403: 权限不足
- 404: 资源不存在
- 409: 资源冲突
- 429: 请求频率超限
- 500: 服务器错误

### 限流规则

- 普通接口: 60次/分钟
- AI 生成接口: 10次/分钟
- 文件上传: 30次/小时

### 版本控制

- 当前版本: v1
- 版本格式: v{major}
- 向下兼容: 是

## API 目录

### 认证服务

- [用户认证](./services/auth.md)
  - 用户注册
  - 用户登录
  - 刷新令牌
  - 修改密码
  - 重置密码

### 剧本管理

- [剧本管理](./services/script.md)
  - 创建剧本
  - 获取剧本列表
  - 获取剧本详情
  - 更新剧本
  - 删除剧本
  - 发布剧本

### 角色管理

- [角色管理](./services/character.md)
  - 创建角色
  - 获取角色列表
  - 获取角色详情
  - 更新角色
  - 删除角色
  - 添加角色关系

### 事件管理

- [事件管理](./services/event.md)
  - 创建事件
  - 获取事件列表
  - 获取事件详情
  - 更新事件
  - 删除事件
  - 添加事件参与者

### 线索管理

- [线索管理](./services/clue.md)
  - 创建线索
  - 获取线索列表
  - 获取线索详情
  - 更新线索
  - 删除线索
  - 添加线索关联

### 时间线管理

- [时间线管理](./services/timeline.md)
  - 创建时间线
  - 获取时间线列表
  - 获取时间线详情
  - 更新时间线
  - 删除时间线
  - 添加时间线事件

### AI 服务

- [AI 服务](./services/ai.md)
  - 生成剧本大纲
  - 生成角色设定
  - 生成事件描述
  - 生成线索内容
  - 优化剧情结构

### 文档服务

- [文档服务](./services/document.md)
  - 创建文档
  - 获取文档列表
  - 获取文档详情
  - 更新文档
  - 删除文档
  - 文档版本管理

## 最佳实践

### 错误处理

1. 始终检查响应的 `success` 字段
2. 对 HTTP 状态码进行适当处理
3. 实现请求重试机制
4. 记录详细的错误日志

### 性能优化

1. 使用适当的分页参数
2. 合理设置缓存策略
3. 避免频繁的轮询请求
4. 压缩请求和响应数据

### 安全建议

1. 妥善保管 API 密钥
2. 使用 HTTPS 进行通信
3. 实现请求签名机制
4. 定期更新认证令牌

## 环境说明

### 开发环境

- 基础地址: `https://dev-api.jubensha.example.com`
- 限流规则: 放宽
- 调试功能: 开启
- 错误详情: 完整

### 测试环境

- 基础地址: `https://test-api.jubensha.example.com`
- 限流规则: 同生产
- 调试功能: 开启
- 错误详情: 完整

### 生产环境

- 基础地址: `https://api.jubensha.example.com`
- 限流规则: 严格
- 调试功能: 关闭
- 错误详情: 简化

## 更新日志

### v1.0.0 (2024-02-07)

- 初始版本发布
- 完整的剧本管理功能
- 基础的 AI 辅助功能

## 联系方式

- 技术支持: support@jubensha.example.com
- 问题反馈: feedback@jubensha.example.com
- 文档更新: docs@jubensha.example.com 