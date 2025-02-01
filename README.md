# ScriptAI - 智能剧本创作平台

ScriptAI是一个基于人工智能的剧本创作辅助平台，旨在帮助编剧和创作者更高效地进行剧本创作。

## 功能特点

- 智能剧本生成
- 角色设计辅助
- 情节发展建议
- 对话优化
- 剧本格式化
- 协同创作支持

## 技术栈

- 后端：Python, FastAPI
- 数据库：PostgreSQL, Redis
- 向量数据库：Milvus
- AI模型：OpenAI API
- 监控：Prometheus + Grafana
- 容器化：Docker

## 项目结构

```
项目根目录/
├── .github/            # GitHub 工作流配置
├── .venv/             # Python 虚拟环境
├── config/            # 配置文件目录
├── docs/             # 文档目录
├── migrations/       # 数据库迁移文件
├── monitoring/       # 监控系统配置和脚本
├── scripts/         # 工具脚本目录
├── src/             # 源代码目录
└── tests/           # 测试用例目录
```

更详细的项目结构说明请参考 [项目结构文档](docs/architecture/project_structure.md)。

## 快速开始

### 环境要求

- Docker 24.0+
- Docker Compose 2.20+
- Python 3.10+
- 至少8GB RAM
- 20GB可用磁盘空间

### 安装步骤

1. 克隆仓库：
```bash
git clone https://github.com/yourusername/scriptai.git
cd scriptai
```

2. 配置环境变量：
```bash
cp config/env/.env.example config/env/.env
# 编辑.env文件，填入必要的配置信息
```

3. 启动服务：
```bash
docker-compose -f config/docker/docker-compose.yml up -d
```

4. 访问服务：
- Web界面：http://localhost:3000
- API文档：http://localhost:8000/docs
- Grafana监控：http://localhost:3000

## 开发指南

### 本地开发环境搭建

1. 创建虚拟环境：
```bash
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate  # Windows
```

2. 安装依赖：
```bash
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

3. 运行测试：
```bash
pytest
```

### 代码规范

- 使用black进行代码格式化
- 使用flake8进行代码检查
- 使用mypy进行类型检查
- 遵循PEP 8规范

## 许可证

本项目采用MIT许可证 - 详见 [LICENSE](LICENSE) 文件

## 联系方式

- 项目主页：[GitHub](https://github.com/yourusername/scriptai)
- 问题反馈：[Issue Tracker](https://github.com/yourusername/scriptai/issues)

## 部署方案

### 架构概述

我们采用全部署在腾讯云CloudBase的方案，主要包含以下组件：

1. 静态网站托管
- 免费额度：1GB存储 + 5GB流量/月
- 支持自定义域名
- 自动HTTPS
- CDN加速

2. 云函数服务
- 免费额度：20万次/月
- 资源使用量40万GBs
- 外网出流量1GB
- 支持触发器

3. 数据库服务
- 免费额度：2GB存储
- 50万次读写
- 支持向量检索

4. 存储服务
- 免费额度：5GB存储
- 5GB流量/月
- 文件管理

### 部署步骤

1. 环境准备
```bash
# 1. 注册腾讯云账号并开通CloudBase
# 2. 安装CloudBase CLI
npm install -g @cloudbase/cli

# 3. 登录CloudBase
tcb login

# 4. 初始化项目
tcb init
```

2. 前端部署
```bash
# 1. 构建前端项目
npm run build

# 2. 部署到静态托管
tcb hosting deploy ./dist -e your-env-id
```

3. 后端部署
```bash
# 1. 部署云函数
tcb fn deploy

# 2. 配置触发器
tcb fn trigger create

# 3. 配置环境变量
tcb env create
```

4. 数据库配置
```bash
# 1. 创建数据库
tcb database create

# 2. 导入数据
tcb database import

# 3. 配置索引
tcb database index create
```

### 环境要求

1. Node.js环境
- Node.js 14.x 或以上
- npm 6.x 或以上

2. 开发工具
- VS Code
- CloudBase CLI
- Git

3. 域名要求
- 已备案的域名（如需配置自定义域名）

### 配置说明

1. 前端配置
```json
{
  "hosting": {
    "ignore": ["node_modules", "cloudbaserc.json"],
    "headers": [{
      "source": "**/*.@(js|css)",
      "headers": [{
        "key": "Cache-Control",
        "value": "max-age=31536000"
      }]
    }]
  }
}
```

2. 云函数配置
```json
{
  "functions": [{
    "name": "api",
    "timeout": 5,
    "envVariables": {},
    "runtime": "Nodejs12.16",
    "memorySize": 128
  }]
}
```

3. 数据库配置
```json
{
  "database": {
    "collection": "users",
    "indexes": [{
      "name": "user_id_idx",
      "unique": true,
      "keys": ["user_id"]
    }]
  }
}
```

### 注意事项

1. 资源限制
- 注意监控免费资源用量
- 合理使用资源避免超额
- 做好数据备份

2. 安全配置
- 设置合理的访问权限
- 配置安全规则
- 加密敏感数据

3. 性能优化
- 合理配置缓存
- 优化数据库查询
- 使用CDN加速

4. 监控告警
- 配置资源监控
- 设置告警规则
- 定期检查日志

### 常见问题

1. 部署失败
- 检查网络连接
- 验证账号权限
- 查看错误日志

2. 性能问题
- 检查资源配置
- 优化代码逻辑
- 使用缓存策略

3. 数据问题
- 定期备份数据
- 验证数据一致性
- 监控数据大小

### 技术支持

如遇到问题，可通过以下方式获取帮助：

1. 官方文档
- [CloudBase文档中心](https://docs.cloudbase.net)
- [开发指南](https://docs.cloudbase.net/quick-start)
- [API参考](https://docs.cloudbase.net/api-reference)

2. 问题反馈
- 提交Issue
- 社区讨论
- 技术支持 