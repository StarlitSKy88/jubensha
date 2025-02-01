# 配置目录

本目录包含项目的所有配置文件。

## 目录结构

```
config/
├── docker/        # Docker相关配置
│   ├── Dockerfile        # 主程序镜像构建文件
│   └── docker-compose.yml # 服务编排配置
├── monitoring/    # 监控配置
│   └── prometheus.yml    # Prometheus配置
└── env/          # 环境配置
    ├── .env          # 当前环境配置
    └── .env.example  # 环境配置示例
```

## 配置说明

### Docker配置
- `docker/Dockerfile`: 定义了应用的构建过程
- `docker/docker-compose.yml`: 定义了所有服务的配置和关系

### 监控配置
- `monitoring/prometheus.yml`: Prometheus的监控目标和规则配置

### 环境配置
- `env/.env`: 当前环境的配置（不要提交到版本控制）
- `env/.env.example`: 环境配置示例和说明

## 使用说明

1. 环境配置：
```bash
cp env/.env.example env/.env
# 编辑.env文件，填入必要的配置信息
```

2. 启动服务：
```bash
docker-compose -f docker/docker-compose.yml up -d
```

## 注意事项

1. 不要将包含敏感信息的配置文件（如.env）提交到版本控制
2. 修改配置后需要重启相关服务
3. 请确保配置文件的权限设置正确 