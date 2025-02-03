# 搜索管理系统

这是一个基于 React + TypeScript 的搜索管理系统前端项目，用于监控和管理搜索服务的性能和状态。

## 功能特性

- 实时监控搜索性能指标
- 查看系统各组件状态
- 追踪热门搜索查询
- 监控缓存使用情况
- 查看告警历史记录

## 技术栈

- React 18
- TypeScript
- Ant Design
- ECharts
- React Router
- Axios

## 开发环境要求

- Node.js >= 14
- npm >= 6

## 安装和运行

1. 安装依赖：

```bash
npm install
```

2. 启动开发服务器：

```bash
npm start
```

应用将在 http://localhost:3001 启动。

## 项目结构

```
src/
  ├── components/     # 可复用组件
  ├── pages/         # 页面组件
  ├── services/      # API 服务
  ├── hooks/         # 自定义 Hooks
  ├── utils/         # 工具函数
  ├── layouts/       # 布局组件
  └── assets/        # 静态资源
```

## 环境变量

- `REACT_APP_API_BASE_URL`: API 服务器地址
- `PORT`: 开发服务器端口

## 构建部署

构建生产版本：

```bash
npm run build
```

构建后的文件将生成在 `build` 目录中。

## 开发指南

1. 遵循 TypeScript 类型定义
2. 使用 ESLint 和 Prettier 保持代码风格一致
3. 组件使用函数式组件和 Hooks
4. 使用 Ant Design 组件库构建 UI
5. 使用 React Router 进行路由管理

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交变更
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT 