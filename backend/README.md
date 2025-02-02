# Story Character Manager Backend

故事角色管理系统的后端服务。

## 技术栈

- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- OpenAI API
- Jest + Supertest

## 开发环境

### 系统要求

- Node.js >= 16
- MongoDB >= 4.4
- Git

### 安装依赖

```bash
npm install
```

### 配置环境变量

```bash
# 复制环境变量示例文件
cp .env.example .env

# 修改环境变量
vim .env
```

### 开发运行

```bash
# 启动开发服务器
npm run dev
```

### 生产构建

```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm run start
```

## 项目结构

```
.
├── src/
│   ├── controllers/   # 控制器
│   ├── models/        # 数据模型
│   ├── routes/        # 路由
│   ├── services/      # 服务
│   ├── middlewares/   # 中间件
│   ├── utils/         # 工具函数
│   ├── types/         # 类型定义
│   └── __tests__/     # 测试文件
├── uploads/          # 上传文件目录
└── docs/            # 文档
```

## API 文档

详细的 API 文档请参考 [API 文档](../docs/api.md)。

## 测试

```bash
# 运行所有测试
npm test

# 运行测试并监听文件变化
npm run test:watch

# 生成测试覆盖率报告
npm run test:coverage
```

## 代码规范

- 使用 ESLint + Prettier 进行代码格式化
- 遵循 TypeScript 严格模式
- 编写单元测试和集成测试
- 保持代码简洁清晰，添加必要的注释

## 部署

### 开发环境

```bash
npm run dev
```

### 生产环境

```bash
# 构建
npm run build

# 启动
npm run start
```

## 性能优化

- 数据库索引优化
- 请求缓存
- 并发控制
- 错误处理
- 日志管理

## 安全措施

- JWT 认证
- 请求验证
- 文件上传限制
- 错误处理
- 日志记录

## 监控告警

- API 响应时间
- 错误率统计
- 资源使用情况
- 系统异常

## 常见问题

### 开发环境问题
1. 环境变量配置
2. 依赖安装失败
3. 启动错误
4. 构建失败

### 运行时问题
1. 数据库连接失败
2. API 调用失败
3. 文件上传失败
4. 性能问题

## 贡献指南

1. Fork 本仓库
2. 创建特性分支
3. 提交代码
4. 创建 Pull Request

## 许可证

[MIT](LICENSE) 