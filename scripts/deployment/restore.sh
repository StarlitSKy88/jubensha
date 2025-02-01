#!/bin/bash

# 设置错误时退出
set -e

# 显示执行的命令
set -x

# 检查参数
if [ $# -ne 1 ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

BACKUP_FILE=$1

# 检查备份文件是否存在
if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

# 加载环境变量
if [ -f .env ]; then
    source .env
else
    echo "Error: .env file not found"
    exit 1
fi

# 创建临时恢复目录
RESTORE_DIR=$(mktemp -d)
trap 'rm -rf "$RESTORE_DIR"' EXIT

# 解压备份文件
echo "Extracting backup..."
tar -xzf "$BACKUP_FILE" -C "$RESTORE_DIR"
BACKUP_NAME=$(basename "$BACKUP_FILE" .tar.gz)
BACKUP_PATH="$RESTORE_DIR/$BACKUP_NAME"

# 停止服务
echo "Stopping services..."
docker-compose down

# 恢复PostgreSQL数据库
echo "Restoring PostgreSQL database..."
docker-compose up -d db
sleep 10  # 等待数据库启动
cat "${BACKUP_PATH}/database.sql" | docker-compose exec -T db psql -U postgres scriptai

# 恢复Redis数据
echo "Restoring Redis data..."
docker-compose up -d redis
sleep 5  # 等待Redis启动
docker-compose cp "${BACKUP_PATH}/redis_dump.rdb" redis:/data/dump.rdb
docker-compose restart redis

# 恢复MinIO数据
echo "Restoring MinIO data..."
docker-compose up -d minio
sleep 10  # 等待MinIO启动
docker-compose exec -T minio mc alias set myminio http://localhost:9000 "${MINIO_ROOT_USER}" "${MINIO_ROOT_PASSWORD}"
docker-compose exec -T minio mc mirror "${BACKUP_PATH}/minio" /data

# 恢复Milvus数据
echo "Restoring Milvus data..."
docker-compose up -d etcd minio milvus-standalone
sleep 30  # 等待Milvus启动
docker-compose exec -T milvus-standalone milvus-backup restore -c default

# 恢复应用配置
echo "Restoring application configuration..."
if [ -f "${BACKUP_PATH}/env_backup" ]; then
    cp "${BACKUP_PATH}/env_backup" .env.restore
    echo "Backup .env file saved as .env.restore"
fi
if [ -f "${BACKUP_PATH}/docker-compose_backup.yml" ]; then
    cp "${BACKUP_PATH}/docker-compose_backup.yml" docker-compose.restore.yml
    echo "Backup docker-compose.yml file saved as docker-compose.restore.yml"
fi

# 启动所有服务
echo "Starting all services..."
docker-compose up -d

# 等待服务就绪
echo "Waiting for services to be ready..."
sleep 30

# 执行数据库迁移
echo "Running database migrations..."
docker-compose exec -T app poetry run alembic upgrade head

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

# 创建恢复记录
echo "Creating restore record..."
curl -X POST "http://localhost:8000/api/v1/backup/backups/${BACKUP_ID}/restore" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}" \
    -H "Content-Type: application/json"

echo "Restore completed successfully!"
echo "Please review .env.restore and docker-compose.restore.yml for any configuration changes" 