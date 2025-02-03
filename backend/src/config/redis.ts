import Redis from 'ioredis';
import { logger } from '../utils/logger';

// Redis 配置
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
};

// 创建 Redis 客户端
export const redis = new Redis(redisConfig);

// 监听连接事件
redis.on('connect', () => {
  logger.info('Redis connected successfully');
});

redis.on('error', (error) => {
  logger.error('Redis connection error:', error);
});

// 缓存键前缀
export const CACHE_KEYS = {
  CHARACTER: 'character:',
  CHARACTER_LIST: 'character:list:',
  CHARACTER_SEARCH: 'character:search:',
  CHARACTER_NETWORK: 'character:network:',
  CHARACTER_SIMILAR: 'character:similar:'
};

// 缓存过期时间（秒）
export const CACHE_TTL = {
  CHARACTER: 3600, // 1小时
  CHARACTER_LIST: 1800, // 30分钟
  CHARACTER_SEARCH: 300, // 5分钟
  CHARACTER_NETWORK: 1800, // 30分钟
  CHARACTER_SIMILAR: 1800 // 30分钟
}; 