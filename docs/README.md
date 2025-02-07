# 项目文档中心

## 文档结构

### 开发文档 (`development/`)
- `development.md` - 主要开发日志,记录所有开发进度
- `task_board.md` - 任务看板,管理所有开发任务

### 项目文档 (`project/`)
- `progress-tracking.md` - 项目进度跟踪
- `project_map.md` - 项目地图和概览
- `implementation-plan.md` - 实施计划
- `development-plan.md` - 开发计划

### API文档 (`api/`)
- API接口文档
- API使用指南

### 架构文档 (`architecture/`)
- 系统架构设计
- 技术选型说明

### 工作流程 (`workflow/`)
- 开发工作流程
- 部署流程
- 测试流程

### 数据库文档 (`database/`)
- 数据库设计
- 数据模型

### 部署文档 (`deployment/`)
- 部署指南
- 环境配置
- 运维手册

### 后端文档 (`backend/`)
- 后端服务文档
- 服务接口说明

## 文档更新规范

1. 开发日志更新
   - 每日更新开发进度
   - 记录重要决策和变更
   - 标注时间戳(UTC)

2. 进度跟踪更新
   - 每周更新项目进度
   - 更新任务完成情况
   - 更新风险评估

3. 文档版本控制
   - 重要文档变更需要评审
   - 保持文档的一致性
   - 及时更新相关文档

## 最近更新

1. 2024-02-07: 文档结构重组
   - 整合开发日志
   - 统一进度跟踪
   - 优化文档结构

2. 2024-02-06: 添加新文档
   - 添加API文档
   - 更新部署指南
   - 补充测试文档

## 目录结构

```
docs/
├── architecture/       # 架构设计文档
│   ├── ai-service.md      # AI服务架构
│   ├── rag-module.md      # RAG模块设计
│   ├── system-flow.md     # 系统流程
│   └── adr/              # 架构决策记录
├── api/               # API文档
│   └── README.md         # API索引
├── development/      # 开发文档
│   ├── guide.md          # 开发指南
│   ├── workflow.md       # 开发工作流
│   └── standards.md      # 开发规范
├── database/         # 数据库文档
│   ├── schema.md         # 数据库模式
│   └── migrations.md     # 迁移说明
├── deployment/       # 部署文档
│   ├── setup.md          # 环境搭建
│   └── operations.md     # 运维指南
└── project/          # 项目管理
    ├── requirements.md   # 需求文档
    ├── roadmap.md        # 项目规划
    ├── progress.md       # 进度跟踪
    └── testing.md        # 测试清单
```

## 文档索引

### 架构文档
- [AI服务架构](./architecture/ai-service.md) - AI服务技术栈和实现方案
- [RAG模块设计](./architecture/rag-module.md) - 检索增强生成模块设计
- [系统流程](./architecture/system-flow.md) - 系统整体流程设计

### 开发文档
- [开发指南](./development/guide.md) - 开发环境搭建和基本流程
- [开发工作流](./development/workflow.md) - Git工作流和协作规范
- [开发规范](./development/standards.md) - 代码规范和最佳实践

### 项目管理
- [需求文档](./project/requirements.md) - 项目需求说明
- [项目规划](./project/roadmap.md) - 项目里程碑和时间线
- [进度跟踪](./project/progress.md) - 项目进度和燃尽图
- [测试清单](./project/testing.md) - 测试用例和测试进度

## 文档更新日志

最近更新:
- 2024-03-20: 更新AI服务架构文档,添加LangChain和LangGraph方案
- 2024-03-19: 更新开发规范,补充代码审查规则
- 2024-03-18: 新增RAG模块设计文档

## 文档规范

1. 文件命名规范
- 使用小写字母
- 单词间用连字符(-)连接
- 使用有意义的描述性名称

2. 文档格式规范
- 使用Markdown格式
- 标题使用层级结构
- 代码块指定语言
- 图表使用Mermaid

3. 文档管理规范
- 定期更新文档
- 及时删除过期内容
- 保持文档结构清晰
- 添加适当的注释和说明 