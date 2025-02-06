export const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0', 10),
  keyPrefix: process.env.REDIS_KEY_PREFIX || 'jubensha:',
  // 缓存配置
  cache: {
    ttl: parseInt(process.env.REDIS_CACHE_TTL || '3600', 10), // 默认缓存时间1小时
    maxItems: parseInt(process.env.REDIS_CACHE_MAX_ITEMS || '1000', 10)
  },
  // 速率限制配置
  rateLimit: {
    points: parseInt(process.env.RATE_LIMIT_POINTS || '100', 10), // 默认100个请求
    duration: parseInt(process.env.RATE_LIMIT_DURATION || '3600', 10) // 默认1小时
  }
}; 