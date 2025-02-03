import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';
import { config } from '../config';
import { logger } from '../utils/logger';

// 创建 Redis 客户端
const redisClient = createClient({
  url: `redis://${config.redis.host}:${config.redis.port}`,
  password: config.redis.password
});

redisClient.on('error', (err) => {
  logger.error('Redis 连接错误:', err);
});

redisClient.on('connect', () => {
  logger.info('Redis 连接成功');
});

// 连接 Redis
redisClient.connect().catch((err) => {
  logger.error('Redis 连接失败:', err);
});

// 创建速率限制中间件
export const rateLimitMiddleware = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
    prefix: 'rate-limit:'
  }),
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 15分钟内最多100个请求
  message: {
    success: false,
    message: '请求过于频繁，请稍后再试'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('请求频率超限:', {
      ip: req.ip,
      path: req.path,
      method: req.method
    });
    res.status(429).json({
      success: false,
      message: '请求过于频繁，请稍后再试'
    });
  },
  skip: (req) => {
    // 跳过某些路径的限制
    const skipPaths = ['/health', '/metrics'];
    return skipPaths.includes(req.path);
  },
  keyGenerator: (req) => {
    // 使用 IP 和路径组合作为限制键
    return `${req.ip}:${req.path}`;
  }
}); 