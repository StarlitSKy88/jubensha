# 故事角色管理系统

一个专业的故事角色管理系统，帮助作者更好地创建、管理和分析故事中的角色。

## 功能特点

- 🎭 角色管理：创建、编辑、删除角色，支持丰富的角色属性设置
- 🔄 角色关系：可视化展示角色之间的关系网络，支持关系的添加、编辑和删除
- 📊 角色分析：基于 AI 的角色深度、一致性和发展性分析
- 🤖 AI 辅助：智能生成角色建议，帮助创作者构建更丰富的角色形象
- 📤 导入导出：支持角色数据的导入导出，方便数据备份和迁移
- 📱 响应式设计：支持多种设备访问，提供良好的用户体验

## 技术栈

- 前端：Vue 3 + TypeScript + Element Plus + AntV G6
- 后端：Node.js + Express + MongoDB
- AI：OpenAI GPT-4 API

## 快速开始

### 环境要求

- Node.js >= 16
- MongoDB >= 4.4
- OpenAI API Key

### 安装依赖

```bash
# 安装依赖
npm install
```

### 配置环境变量

1. 复制 `.env.example` 文件为 `.env`
2. 修改 `.env` 文件中的配置项：
   - `VITE_API_BASE_URL`: API 服务器地址
   - `VITE_OPENAI_API_KEY`: OpenAI API 密钥
   - `MONGODB_URI`: MongoDB 连接地址
   - `JWT_SECRET`: JWT 密钥
   - 其他配置项...

### 开发运行

```bash
# 启动开发服务器
npm run dev
```

### 生产部署

```bash
# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 项目结构

```
├── src/
│   ├── components/     # 组件
│   ├── views/         # 页面
│   ├── stores/        # 状态管理
│   ├── services/      # 服务
│   ├── utils/         # 工具函数
│   ├── types/         # 类型定义
│   ├── routes/        # 路由
│   ├── middlewares/   # 中间件
│   ├── models/        # 数据模型
│   └── controllers/   # 控制器
├── public/           # 静态资源
├── docs/            # 文档
└── tests/           # 测试
```

## API 文档

详细的 API 文档请参考 [API 文档](docs/api.md)。

## 开发指南

详细的开发指南请参考 [开发指南](docs/development.md)。

## 贡献指南

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 许可证

本项目使用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件。

## 联系我们

如果你有任何问题或建议，欢迎提出 Issue 或发送邮件。 