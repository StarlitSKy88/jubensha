storage "file" {
  path = "/vault/data"
}

listener "tcp" {
  address = "0.0.0.0:8200"
  tls_disable = 1  # 仅用于开发环境，生产环境应启用TLS
}

api_addr = "http://0.0.0.0:8200"
cluster_addr = "https://0.0.0.0:8201"

ui = true

# 审计日志配置
audit_device "file" {
  path = "/vault/logs/audit.log"
  log_raw = true
}

# 密钥轮换配置
default_lease_ttl = "24h"
max_lease_ttl = "720h"  # 30天

# 插件目录
plugin_directory = "/vault/plugins"

# 禁用生产环境不需要的功能
disable_mlock = true

# 集群配置
cluster {
  name = "scriptai-vault"
}

# 遥测配置
telemetry {
  prometheus_retention_time = "24h"
  disable_hostname = true
} 