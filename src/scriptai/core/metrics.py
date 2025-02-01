"""监控指标模块."""
from prometheus_client import Counter, Gauge, Histogram

# API请求指标
http_requests_total = Counter(
    "http_requests_total",
    "Total number of HTTP requests",
    ["method", "endpoint", "status"],
)

http_request_duration_seconds = Histogram(
    "http_request_duration_seconds",
    "HTTP request duration in seconds",
    ["method", "endpoint"],
)

# 用户指标
active_users = Gauge(
    "active_users",
    "Number of active users",
)

user_registrations_total = Counter(
    "user_registrations_total",
    "Total number of user registrations",
)

# 剧本指标
scripts_total = Counter(
    "scripts_total",
    "Total number of scripts",
    ["status"],
)

script_generations_total = Counter(
    "script_generations_total",
    "Total number of script generations",
    ["status"],
)

script_optimizations_total = Counter(
    "script_optimizations_total",
    "Total number of script optimizations",
    ["status"],
)

# 数据库指标
db_connections = Gauge(
    "db_connections",
    "Number of database connections",
)

db_queries_total = Counter(
    "db_queries_total",
    "Total number of database queries",
    ["operation"],
)

db_query_duration_seconds = Histogram(
    "db_query_duration_seconds",
    "Database query duration in seconds",
    ["operation"],
)

# 缓存指标
cache_hits_total = Counter(
    "cache_hits_total",
    "Total number of cache hits",
)

cache_misses_total = Counter(
    "cache_misses_total",
    "Total number of cache misses",
)

cache_size = Gauge(
    "cache_size",
    "Current size of cache",
)

# AI服务指标
ai_requests_total = Counter(
    "ai_requests_total",
    "Total number of AI service requests",
    ["operation", "status"],
)

ai_request_duration_seconds = Histogram(
    "ai_request_duration_seconds",
    "AI service request duration in seconds",
    ["operation"],
)

ai_tokens_total = Counter(
    "ai_tokens_total",
    "Total number of tokens used",
    ["operation", "model"],
)

# 系统指标
system_memory_bytes = Gauge(
    "system_memory_bytes",
    "System memory usage in bytes",
    ["type"],
)

system_cpu_usage = Gauge(
    "system_cpu_usage",
    "System CPU usage",
)

system_disk_usage_bytes = Gauge(
    "system_disk_usage_bytes",
    "System disk usage in bytes",
    ["path"],
) 