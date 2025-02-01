# 工具脚本目录

本目录包含项目的所有工具脚本。

## 目录结构

```
scripts/
├── deployment/         # 部署相关脚本
│   ├── deploy.sh       # 部署脚本
│   ├── backup.sh       # 备份脚本
│   ├── restore.sh      # 恢复脚本
│   └── init_vault.sh   # 密钥库初始化脚本
├── database/          # 数据库相关脚本
│   └── migrate.py      # 数据库迁移脚本
└── knowledge_base/    # 知识库相关脚本
    └── init_knowledge_base.py  # 知识库初始化脚本
```

## 脚本说明

### 部署脚本
- `deploy.sh`: 自动化部署服务
- `backup.sh`: 备份数据和配置
- `restore.sh`: 恢复数据和配置
- `init_vault.sh`: 初始化密钥管理系统

### 数据库脚本
- `migrate.py`: 执行数据库迁移

### 知识库脚本
- `init_knowledge_base.py`: 初始化和更新知识库

## 使用说明

1. 部署服务：
```bash
./deployment/deploy.sh
```

2. 备份数据：
```bash
./deployment/backup.sh
```

3. 恢复数据：
```bash
./deployment/restore.sh <backup_file>
```

4. 数据库迁移：
```bash
python database/migrate.py
```

5. 初始化知识库：
```bash
python knowledge_base/init_knowledge_base.py
```

## 注意事项

1. 执行脚本前请确保有相应的权限
2. 备份脚本会自动创建带时间戳的备份文件
3. 部署脚本会自动检查环境依赖
4. 所有脚本都有日志输出，方便追踪问题 