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

# 等待Vault启动
echo "Waiting for Vault to start..."
until curl -fs http://127.0.0.1:8200/v1/sys/health > /dev/null; do
    sleep 1
done

# 设置Vault地址和token
export VAULT_ADDR=http://127.0.0.1:8200
export VAULT_TOKEN=${VAULT_TOKEN}

# 启用审计日志
echo "Enabling audit device..."
vault audit enable file file_path=/vault/logs/audit.log

# 启用密钥引擎
echo "Enabling secrets engines..."
vault secrets enable -path=secret kv-v2
vault secrets enable transit

# 创建密钥策略
echo "Creating policies..."

# 应用策略 - 允许应用访问特定路径的密钥
cat > app-policy.hcl << EOF
path "secret/data/scriptai/*" {
  capabilities = ["read"]
}

path "transit/encrypt/scriptai" {
  capabilities = ["update"]
}

path "transit/decrypt/scriptai" {
  capabilities = ["update"]
}
EOF

vault policy write app-policy app-policy.hcl

# 管理员策略 - 允许管理所有密钥
cat > admin-policy.hcl << EOF
path "secret/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}

path "transit/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}

path "sys/audit*" {
  capabilities = ["read", "sudo"]
}

path "sys/policies/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}

path "auth/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}
EOF

vault policy write admin-policy admin-policy.hcl

# 创建加密密钥
echo "Creating encryption keys..."
vault write -f transit/keys/scriptai type=chacha20-poly1305

# 存储应用密钥
echo "Storing application secrets..."
vault kv put secret/scriptai/database \
    url="postgresql://postgres:${POSTGRES_PASSWORD}@db:5432/scriptai"

vault kv put secret/scriptai/redis \
    url="redis://redis:6379/0" \
    password="${REDIS_PASSWORD}"

vault kv put secret/scriptai/minio \
    access_key="${MINIO_ACCESS_KEY}" \
    secret_key="${MINIO_SECRET_KEY}"

vault kv put secret/scriptai/openai \
    api_key="${OPENAI_API_KEY}"

# 启用密钥轮换
echo "Enabling key rotation..."
vault write transit/keys/scriptai/config \
    deletion_allowed=true \
    min_decryption_version=1 \
    min_encryption_version=1 \
    auto_rotate_period="24h"

# 创建应用角色
echo "Creating application role..."
vault write auth/approle/role/scriptai \
    secret_id_ttl=0 \
    token_ttl=1h \
    token_max_ttl=24h \
    policies="app-policy"

# 获取角色ID和密钥ID
ROLE_ID=$(vault read -field=role_id auth/approle/role/scriptai/role-id)
SECRET_ID=$(vault write -f -field=secret_id auth/approle/role/scriptai/secret-id)

# 保存角色凭证
echo "Saving role credentials..."
echo "VAULT_ROLE_ID=${ROLE_ID}" >> .env
echo "VAULT_SECRET_ID=${SECRET_ID}" >> .env

echo "Vault initialization completed successfully!"
echo "Please make sure to securely store the role credentials." 