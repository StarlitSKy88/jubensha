# 开发指南

## 项目概述

故事角色管理系统是一个专业的角色管理工具，帮助作者更好地创建、管理和分析故事中的角色。系统提供了丰富的功能，包括角色管理、关系图谱、AI 分析等。

## 技术栈

### 前端
- Vue 3 + TypeScript
- Element Plus
- Pinia
- Vue Router
- AntV G6
- OpenAI API

### 后端
- Node.js + Express
- MongoDB + Mongoose
- JWT 认证
- Multer 文件上传

## 开发环境搭建

1. 安装依赖
```bash
# 安装前端依赖
cd frontend
npm install

# 安装后端依赖
cd backend
npm install
```

2. 配置环境变量
```bash
# 复制环境变量示例文件
cp .env.example .env

# 修改环境变量
vim .env
```

3. 启动开发服务器
```bash
# 启动前端开发服务器
cd frontend
npm run dev

# 启动后端开发服务器
cd backend
npm run dev
```

## 项目结构

```
.
├── frontend/                # 前端项目
│   ├── src/
│   │   ├── components/     # 组件
│   │   ├── views/         # 页面
│   │   ├── stores/        # 状态管理
│   │   ├── services/      # 服务
│   │   ├── utils/         # 工具函数
│   │   ├── types/         # 类型定义
│   │   ├── routes/        # 路由
│   │   ├── middlewares/   # 中间件
│   │   ├── models/        # 数据模型
│   │   └── controllers/   # 控制器
│   ├── public/           # 静态资源
│   └── tests/           # 测试文件
│
├── backend/                # 后端项目
│   ├── src/
│   │   ├── controllers/   # 控制器
│   │   ├── models/        # 数据模型
│   │   ├── routes/        # 路由
│   │   ├── services/      # 服务
│   │   ├── middlewares/   # 中间件
│   │   └── utils/         # 工具函数
│   └── tests/           # 测试文件
│
├── docs/                  # 文档
├── uploads/              # 上传文件目录
└── README.md            # 项目说明
```

## 开发规范

### 代码风格
- 使用 ESLint + Prettier 进行代码格式化
- 遵循 TypeScript 严格模式
- 使用 Vue 3 组合式 API
- 保持代码简洁清晰，添加必要的注释

### Git 提交规范
- feat: 新功能
- fix: 修复问题
- docs: 文档修改
- style: 代码格式修改
- refactor: 代码重构
- test: 测试用例修改
- chore: 其他修改

### 命名规范
- 文件名：kebab-case
- 组件名：PascalCase
- 变量名：camelCase
- 常量名：UPPER_CASE
- 类型名：PascalCase
- 接口名：IPascalCase

## 功能模块

### 角色管理
- 基础 CRUD 操作
- 角色属性设置
- 角色关系管理
- 角色分析

### AI 功能
- 角色分析
- 角色建议
- 关系优化
- 情节建议

### 数据导入导出
- JSON 格式导出
- 批量导入
- 数据备份

## 测试

### 单元测试
```bash
# 运行前端测试
cd frontend
npm run test

# 运行后端测试
cd backend
npm run test
```

### E2E 测试
```bash
# 运行 Cypress 测试
cd frontend
npm run test:e2e
```

## 部署

### 开发环境
```bash
# 启动开发服务器
npm run dev
```

### 生产环境
```bash
# 构建前端
cd frontend
npm run build

# 构建后端
cd backend
npm run build

# 启动服务
npm run start
```

## 性能优化

### 前端优化
- 路由懒加载
- 组件按需加载
- 图片懒加载
- 虚拟滚动
- 缓存优化

### 后端优化
- 数据库索引
- 请求缓存
- 并发控制
- 错误处理
- 日志管理

## 安全措施

### 前端安全
- XSS 防护
- CSRF 防护
- 输入验证
- 敏感信息加密

### 后端安全
- JWT 认证
- 请求验证
- 文件上传限制
- 错误处理
- 日志记录

## 监控告警

### 性能监控
- 页面加载时间
- API 响应时间
- 资源使用情况
- 错误率统计

### 错误监控
- 前端错误
- 后端错误
- API 异常
- 系统异常

## 文档维护

### API 文档
- 接口说明
- 参数说明
- 返回值说明
- 错误码说明

### 开发文档
- 环境搭建
- 功能说明
- 代码规范
- 部署说明

## 常见问题

### 开发环境问题
1. 环境变量配置
2. 依赖安装失败
3. 启动错误
4. 构建失败

### 运行时问题
1. API 调用失败
2. 文件上传失败
3. 数据库连接失败
4. 性能问题

## 联系方式

如有问题，请通过以下方式联系：
1. 提交 Issue
2. 发送邮件
3. 项目讨论组 