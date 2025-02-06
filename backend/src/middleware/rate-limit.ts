import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';
import { config } from '@config';
import { logger } from '@utils/logger';
import { RateLimitError } from '@utils/errors';

// 创建Redis客户端
const redisClient = createClient({
  url: `redis://${config.redis.host}:${config.redis.port}`,
  password: config.redis.password
});

// 连接Redis
redisClient.connect().catch((err) => {
  logger.error('Redis连接失败:', err);
});

// 创建速率限制中间件
export const rateLimitMiddleware = rateLimit({
  windowMs: config.redis.rateLimit.duration * 1000, // 转换为毫秒
  max: config.redis.rateLimit.points, // 最大请求数
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
    prefix: `${config.redis.keyPrefix}ratelimit:`
  }),
  handler: (req: Request, res: Response) => {
    logger.warn('请求超出速率限制', {
      ip: req.ip,
      path: req.path,
      method: req.method
    });
    throw new RateLimitError('请求频率超出限制，请稍后再试');
  },
  skip: (req: Request) => {
    // 跳过健康检查等特定路由
    return req.path === '/health' || req.path === '/metrics';
  },
  keyGenerator: (req: Request) => {
    // 使用用户ID或IP作为限制键
    return req.user?.id || req.ip;
  }
});

// 导出自定义速率限制中间件
export const customRateLimit = (
  points: number,
  duration: number
) => {
  return rateLimit({
    windowMs: duration * 1000,
    max: points,
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
      sendCommand: (...args: string[]) => redisClient.sendCommand(args),
      prefix: `${config.redis.keyPrefix}ratelimit:`
    }),
    handler: (req: Request, res: Response) => {
      logger.warn('请求超出自定义速率限制', {
        ip: req.ip,
        path: req.path,
        method: req.method,
        points,
        duration
      });
      throw new RateLimitError('请求频率超出限制，请稍后再试');
    }
  });
};