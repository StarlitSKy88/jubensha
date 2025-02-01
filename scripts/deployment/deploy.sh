#!/bin/bash

# 设置错误时退出
set -e

# 显示执行的命令
set -x

# 加载环境变量
if [ -f .env ]; then
    source .env
else
    echo "Error: .env file not found"
    exit 1
fi

# 检查必要的环境变量
required_vars=(
    "POSTGRES_PASSWORD"
    "REDIS_PASSWORD"
    "MINIO_ROOT_USER"
    "MINIO_ROOT_PASSWORD"
    "MINIO_ACCESS_KEY"
    "MINIO_SECRET_KEY"
    "OPENAI_API_KEY"
    "SECRET_KEY"
    "GRAFANA_ADMIN_USER"
    "GRAFANA_ADMIN_PASSWORD"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "Error: $var is not set in .env file"
        exit 1
    fi
done

# 创建必要的目录
mkdir -p data/{backups,logs,cache}
mkdir -p grafana/{provisioning,dashboards}

# 检查Docker和Docker Compose是否安装
if ! command -v docker &> /dev/null; then
    echo "Error: docker is not installed"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Error: docker-compose is not installed"
    exit 1
fi

# 停止并删除现有容器
echo "Stopping existing containers..."
docker-compose down --remove-orphans

# 清理未使用的数据卷（可选）
read -p "Do you want to clean unused volumes? [y/N] " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker volume prune -f
fi

# 拉取最新镜像
echo "Pulling latest images..."
docker-compose pull

# 构建应用镜像
echo "Building application image..."
docker-compose build --no-cache app

# 启动服务
echo "Starting services..."
docker-compose up -d

# 等待服务就绪
echo "Waiting for services to be ready..."
sleep 30

# 执行数据库迁移
echo "Running database migrations..."
docker-compose exec app poetry run alembic upgrade head

# 检查服务健康状态
echo "Checking service health..."
services=(
    "app:8000/api/v1/health"
    "prometheus:9090/-/healthy"
    "grafana:3000/api/health"
)

for service in "${services[@]}"; do
    IFS=: read -r name port_path <<< "$service"
    echo "Checking $name..."
    if ! curl -f "http://localhost:$port_path" &> /dev/null; then
        echo "Warning: $name is not healthy"
    fi
done

# 显示服务状态
echo "Service status:"
docker-compose ps

# 显示日志路径
echo "Logs are available at: ./data/logs/"

# 备份提醒
echo "Remember to configure backup schedule in your crontab"
echo "Example: 0 2 * * * /path/to/backup.sh"

echo "Deployment completed successfully!" 