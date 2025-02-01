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

# 设置备份目录
BACKUP_DIR=${BACKUP_DIR:-"data/backups"}
BACKUP_RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="${BACKUP_DIR}/backup_${TIMESTAMP}"

# 创建备份目录
mkdir -p "${BACKUP_PATH}"

# 备份PostgreSQL数据库
echo "Backing up PostgreSQL database..."
docker-compose exec -T db pg_dump -U postgres scriptai > "${BACKUP_PATH}/database.sql"

# 备份Redis数据
echo "Backing up Redis data..."
docker-compose exec -T redis redis-cli -a "${REDIS_PASSWORD}" SAVE
docker-compose cp redis:/data/dump.rdb "${BACKUP_PATH}/redis_dump.rdb"

# 备份Milvus数据
echo "Backing up Milvus data..."
docker-compose exec -T milvus-standalone mkdir -p /backup
docker-compose exec -T milvus-standalone milvus-backup create -c default

# 备份MinIO数据
echo "Backing up MinIO data..."
docker-compose exec -T minio mc alias set myminio http://localhost:9000 "${MINIO_ROOT_USER}" "${MINIO_ROOT_PASSWORD}"
docker-compose exec -T minio mc mirror /data "${BACKUP_PATH}/minio"

# 备份应用配置
echo "Backing up application configuration..."
cp .env "${BACKUP_PATH}/env_backup"
cp docker-compose.yml "${BACKUP_PATH}/docker-compose_backup.yml"

# 压缩备份
echo "Compressing backup..."
cd "${BACKUP_DIR}"
tar -czf "backup_${TIMESTAMP}.tar.gz" "backup_${TIMESTAMP}"
rm -rf "backup_${TIMESTAMP}"

# 清理旧备份
echo "Cleaning up old backups..."
find "${BACKUP_DIR}" -name "backup_*.tar.gz" -type f -mtime +${BACKUP_RETENTION_DAYS} -delete

# 创建备份记录
echo "Creating backup record..."
curl -X POST "http://localhost:8000/api/v1/backup/backups" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
        "backup_type": "full",
        "metadata": {
            "timestamp": "'${TIMESTAMP}'",
            "path": "'${BACKUP_PATH}'",
            "size": "'$(du -sh "${BACKUP_PATH}.tar.gz" | cut -f1)'"
        }
    }'

echo "Backup completed successfully!"
echo "Backup location: ${BACKUP_PATH}.tar.gz" 