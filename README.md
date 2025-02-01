# 剧本杀游戏平台

一个现代化的剧本杀游戏平台，支持剧本创作、游戏管理、玩家社交等功能。

## 功能特性

- 🎭 剧本系统
  - AI 辅助剧本创作
  - 多种剧本类型支持
  - 剧本导入导出
  - 版本管理

- 🎮 游戏系统
  - 游戏房间管理
  - 实时游戏状态同步
  - 角色分配与管理
  - 进度追踪

- 👥 玩家系统
  - 账户管理
  - 好友系统
  - 成就系统
  - 个性化设置

- 💬 聊天系统
  - 实时消息
  - 多种消息类型
  - 聊天室管理
  - 消息历史

## 技术栈

- 前端框架：Vue 3
- 状态管理：Pinia
- UI 组件：Element Plus
- 网络通信：WebSocket
- AI 集成：LangSmith
- 构建工具：Vite
- 测试框架：Vitest

## 开发环境

### 系统要求

- Node.js >= 18
- npm >= 9

### 安装依赖

```bash
npm install
```

### 开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 运行测试

```bash
# 运行单元测试
npm run test

# 运行测试覆盖率报告
npm run test:coverage
```

### 代码检查

```bash
# 运行 ESLint
npm run lint

# 运行 Prettier
npm run format
```

## 项目结构

```
.
├── docs/               # 文档
├── public/            # 静态资源
├── src/               # 源代码
│   ├── assets/        # 资源文件
│   ├── components/    # 组件
│   ├── composables/   # 组合式函数
│   ├── router/        # 路由配置
│   ├── services/      # 服务
│   ├── stores/        # 状态管理
│   ├── types/         # 类型定义
│   ├── utils/         # 工具函数
│   └── views/         # 页面
├── tests/             # 测试文件
└── types/             # 全局类型定义
```

## 开发规范

### Git 提交规范

- feat: 新功能
- fix: 修复问题
- docs: 文档修改
- style: 代码格式修改
- refactor: 代码重构
- test: 测试用例修改
- chore: 其他修改

### 代码风格

- 使用 TypeScript 编写代码
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码
- 编写单元测试
- 保持代码简洁清晰

## 部署

### 环境变量

```env
VITE_API_URL=your_api_url
VITE_WS_URL=your_websocket_url
VITE_LANGSMITH_API_KEY=your_langsmith_api_key
```

### Docker 部署

```bash
# 构建镜像
docker build -t murder-mystery-game .

# 运行容器
docker run -p 80:80 murder-mystery-game
```

## 贡献指南

1. Fork 本仓库
2. 创建特性分支
3. 提交代码
4. 创建 Pull Request

## 许可证

[MIT](LICENSE) 