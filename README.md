# AI辅助剧本杀创作平台

一个专注于剧本杀创作的智能辅助平台，提供AI驱动的内容生成、质量验证和游戏测试功能。

## 功能特点

### 创作功能
- AI辅助创作
- 分层生成系统
- 专业内容库
- 智能推荐

### AI能力
- 双模型架构（Generator + Validator）
- 智能剧本生成
- 质量评估反馈
- 专业规范检查

### 测试功能
- 游戏流程模拟
- 数据分析
- 问题诊断
- 优化建议

## 技术栈

### 前端
- React + TypeScript
- Ant Design组件库
- D3.js可视化
- WebSocket实时通信

### 后端
- FastAPI
- PostgreSQL
- Redis
- WebSocket

### AI服务
- DeepSeek-7B
- GPT-4
- 自研评估模型
- 专业知识库

## 项目结构

```
.
├── src/
│   ├── frontend/          # 前端应用
│   │   ├── components/   # 公共组件
│   │   ├── pages/       # 页面
│   │   ├── services/    # 服务
│   │   └── utils/       # 工具
│   │
│   └── backend/          # 后端服务
│       ├── api/         # API接口
│       ├── core/        # 核心服务
│       ├── models/      # 数据模型
│       └── services/    # 业务服务
│           ├── ai/      # AI服务
│           ├── content/ # 内容服务
│           └── test/    # 测试服务
│
├── docs/                # 文档
└── tests/              # 测试文件
```

## 开发环境搭建

1. 后端环境
```bash
# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 启动服务
uvicorn src.backend.main:app --reload
```

2. 前端环境
```bash
# 安装依赖
cd src/frontend
npm install

# 启动开发服务器
npm run dev
```

## API文档

- 开发环境：http://localhost:8000/docs
- 生产环境：https://api.example.com/docs

## 开发规范

### Git工作流
1. 主分支
   - main：生产环境
   - develop：开发环境

2. 功能分支
   - feature/*：新功能
   - bugfix/*：问题修复
   - release/*：版本发布

### 代码规范
- 使用ESLint和Prettier
- 遵循PEP 8规范
- 编写单元测试
- 代码审查

## 部署说明

1. 开发环境
```bash
docker-compose -f docker-compose.dev.yml up --build
```

2. 生产环境
```bash
docker-compose -f docker-compose.prod.yml up --build
```

## 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 发起Pull Request

## 许可证

MIT License 