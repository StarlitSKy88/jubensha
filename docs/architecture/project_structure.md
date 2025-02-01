# 项目结构说明

本文档详细说明了ScriptAI项目的目录结构和各个组件的用途。

## 目录结构

```
项目根目录/
├── .github/            # GitHub 工作流配置
│   ├── workflows/     # GitHub Actions 工作流配置
│   └── ISSUE_TEMPLATE/# Issue 模板
├── .venv/             # Python 虚拟环境（本地开发）
├── config/            # 配置文件目录
│   ├── app/          # 应用配置
│   ├── docker/       # Docker相关配置
│   ├── monitoring/   # 监控配置
│   ├── vault/        # 密钥管理配置
│   └── env/         # 环境配置
├── docs/             # 文档目录
│   ├── api/         # API文档
│   ├── architecture/# 架构文档
│   ├── database/    # 数据库文档
│   ├── development/ # 开发文档
│   └── workflow/    # 工作流程文档
├── migrations/       # 数据库迁移文件
│   ├── versions/    # 迁移版本文件
│   └── env.py      # Alembic 环境配置
├── monitoring/       # 监控系统配置和脚本
│   ├── grafana/     # Grafana 仪表盘和配置
│   └── prometheus/  # Prometheus 配置和规则
├── scripts/         # 工具脚本目录
│   ├── deployment/  # 部署相关脚本
│   ├── database/    # 数据库维护脚本
│   └── utils/      # 通用工具脚本
├── src/             # 源代码目录
│   └── scriptai/    # 主程序包
│       ├── api/     # API接口
│       ├── core/    # 核心功能
│       ├── models/  # 数据模型
│       └── utils/   # 工具函数
├── tests/           # 测试用例目录
│   ├── unit/       # 单元测试
│   ├── integration/# 集成测试
│   └── e2e/        # 端到端测试
│
# 配置文件
├── .dockerignore    # Docker 忽略文件
├── .gitignore      # Git 忽略文件
├── .pre-commit-config.yaml  # pre-commit 钩子配置
├── alembic.ini     # Alembic 数据库迁移配置
├── CHANGELOG.md    # 变更日志
├── CODE_OF_CONDUCT.md  # 行为准则
├── CONTRIBUTING.md # 贡献指南
├── LICENSE         # 许可证
├── MANIFEST.in     # Python 包清单文件
├── mkdocs.yml      # MkDocs 文档配置
├── pyproject.toml  # Python 项目配置
├── README.md       # 项目说明
├── requirements-dev.txt  # 开发环境依赖
├── requirements.txt      # 生产环境依赖
└── setup.py        # Python 包安装配置
```

## 主要组件说明

### 配置目录 (config/)
- `app/`: 应用程序的配置文件，包括服务器设置、日志配置等
- `docker/`: Docker相关的配置文件，包括Dockerfile和docker-compose文件
- `monitoring/`: 监控系统的配置文件
- `vault/`: HashiCorp Vault的配置文件，用于密钥管理
- `env/`: 环境变量配置文件

### 文档目录 (docs/)
- `api/`: API接口文档
- `architecture/`: 系统架构文档
- `database/`: 数据库设计文档
- `development/`: 开发指南和规范
- `workflow/`: 工作流程文档

### 监控系统 (monitoring/)
- `grafana/`: Grafana仪表盘配置
- `prometheus/`: Prometheus监控配置

### 脚本目录 (scripts/)
- `deployment/`: 部署相关脚本
- `database/`: 数据库维护脚本
- `utils/`: 通用工具脚本

### 源代码目录 (src/scriptai/)
- `api/`: REST API实现
- `core/`: 核心业务逻辑
- `models/`: 数据模型定义
- `utils/`: 通用工具函数

### 测试目录 (tests/)
- `unit/`: 单元测试
- `integration/`: 集成测试
- `e2e/`: 端到端测试

## 配置文件说明

- `.dockerignore`: 指定Docker构建时要忽略的文件
- `.gitignore`: 指定Git要忽略的文件
- `.pre-commit-config.yaml`: pre-commit钩子配置
- `alembic.ini`: Alembic数据库迁移工具配置
- `CHANGELOG.md`: 项目变更记录
- `CODE_OF_CONDUCT.md`: 项目行为准则
- `CONTRIBUTING.md`: 项目贡献指南
- `LICENSE`: 项目许可证
- `MANIFEST.in`: Python包含文件配置
- `mkdocs.yml`: MkDocs文档生成配置
- `pyproject.toml`: Python项目配置
- `requirements.txt`: 生产环境依赖
- `requirements-dev.txt`: 开发环境依赖
- `setup.py`: Python包安装配置 