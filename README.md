# 剧本杀创作助手

一个专业的剧本杀创作辅助系统，帮助创作者更高效地创作、管理和优化剧本内容。

## 功能特点

- 🎭 角色管理：创建、编辑、删除角色，支持丰富的角色属性设置
- 📝 剧本创作：AI辅助的剧本创作，提供情节发展建议
- 🔄 时间线管理：可视化的剧情时间线，帮助管理剧情发展
- 🕵️ 线索系统：智能的线索分布和关联管理
- 📊 剧情分析：基于AI的剧情完整性和合理性分析
- 🤖 AI 辅助：集成LangChain实现智能创作辅助
- 📚 知识库：RAG增强的专业知识支持
- 📱 响应式设计：支持多种设备访问，提供良好的用户体验

## 技术栈

- 前端：Vue 3 + TypeScript + Element Plus
- 后端：Node.js + Express + MongoDB
- AI：LangChain + Deepseek API
- 向量数据库：Milvus (Zilliz Cloud)

## 开发状态

### 当前进度
- 整体完成度：25%
- 基础设施：80%
- AI服务：重构中（迁移至LangChain）
- RAG模块：25%
- 时间线模块：45%

### 开发重点
1. 架构优化
   - 重构AI服务，迁移至LangChain
   - 完善RAG知识库系统
   - 优化项目结构，清理冗余代码

2. 核心功能
   - 剧本创作功能
   - 时间线管理
   - 角色关系图谱
   - 线索系统开发

3. 质量提升
   - 完善测试覆盖
   - 优化错误处理
   - 提升代码质量

## 快速开始

### 环境要求

- Node.js >= 16
- MongoDB >= 4.4
- Deepseek API Key
- Zilliz Cloud 账号

### 安装依赖

```bash
# 安装依赖
npm install
```

### 配置环境变量

1. 复制 `.env.example` 文件为 `.env`
2. 修改 `.env` 文件中的配置项：
   - `VITE_API_BASE_URL`: API 服务器地址
   - `DEEPSEEK_API_KEY`: Deepseek API 密钥
   - `ZILLIZ_CLOUD_URI`: Zilliz Cloud 连接地址
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
├── frontend/          # 前端代码
│   ├── src/
│   │   ├── components/  # 组件
│   │   ├── views/      # 页面
│   │   ├── stores/     # 状态管理
│   │   ├── services/   # 服务
│   │   ├── utils/      # 工具函数
│   │   ├── types/      # 类型定义
│   │   └── router/     # 路由
├── backend/           # 后端代码
│   ├── src/
│   │   ├── modules/    # 业务模块
│   │   ├── middlewares/# 中间件
│   │   ├── models/     # 数据模型
│   │   ├── services/   # 服务层
│   │   └── utils/      # 工具函数
├── docs/             # 文档
├── tests/            # 测试
└── scripts/          # 工具脚本
```

## 文档

- [API 文档](docs/api.md)
- [开发指南](docs/development.md)
- [架构说明](docs/architecture/README.md)
- [AI服务集成](docs/architecture/ai-service.md)
- [RAG模块说明](docs/architecture/rag-module.md)

## 开发规范

1. 代码规范
   - 使用TypeScript
   - 遵循ESLint规则
   - 编写完整的注释
   - 保持代码简洁清晰

2. Git工作流
   - 遵循Git Flow
   - 提交信息规范
   - 及时同步代码
   - 做好版本管理

3. 测试要求
   - 单元测试覆盖
   - 集成测试验证
   - E2E测试保障
   - 性能测试达标

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交改动 (`git commit -m 'feat: add some feature'`)
4. 推送分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 许可证

本项目使用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件。

## 联系我们

如果你有任何问题或建议，欢迎提出 Issue 或发送邮件。 