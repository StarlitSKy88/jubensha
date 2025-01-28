# 剧本杀游戏平台

一个现代化的剧本杀游戏平台，支持在线游戏、语音聊天和AI辅助主持。

## 功能特点

- 用户认证和授权
- 游戏房间管理
- 实时语音聊天
- AI生成剧本
- 角色匹配系统
- 情感分析
- AI主持助手
- 问卷调查系统

## 技术栈

### 前端
- React
- TypeScript
- Material-UI
- Redux Toolkit
- WebRTC
- Socket.IO

### 后端
- FastAPI
- SQLAlchemy
- PostgreSQL
- Redis
- WebSocket
- OpenAI GPT
- scikit-learn

## 开发环境设置

1. 克隆仓库
```bash
git clone https://github.com/yourusername/script-game.git
cd script-game
```

2. 启动开发环境
```bash
docker-compose -f docker-compose.dev.yml up --build
```

3. 访问应用
- 前端: http://localhost:3000
- 后端API: http://localhost:8000
- API文档: http://localhost:8000/docs

## 项目结构

```
.
├── src/
│   ├── frontend/           # React前端应用
│   │   ├── src/
│   │   │   ├── components/ # React组件
│   │   │   ├── store/     # Redux状态管理
│   │   │   └── theme/     # Material-UI主题
│   │   └── package.json
│   │
│   └── backend/           # FastAPI后端服务
│       ├── ai/           # AI模型
│       ├── api/          # API路由
│       ├── models/       # 数据库模型
│       └── services/     # 业务逻辑
│
├── tests/                # 测试文件
├── docs/                # 文档
└── docker-compose.yml   # Docker配置
```

## 测试

### 后端测试
```bash
cd src/backend
pytest
```

### 前端测试
```bash
cd src/frontend
npm test
```

## API文档

API文档使用Swagger UI自动生成，可在开发环境中访问：
http://localhost:8000/docs

## 贡献指南

1. Fork项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

## 许可证

本项目采用MIT许可证 - 查看 [LICENSE](LICENSE) 文件了解详情


