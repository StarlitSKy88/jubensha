import { Request, Response, NextFunction } from 'express';
import { createClient } from 'redis';
import { config } from '@config';
import { logger } from '@utils/logger';

// 创建Redis客户端
const redisClient = createClient({
  url: `redis://${config.redis.host}:${config.redis.port}`,
  password: config.redis.password
});

// 连接Redis
redisClient.connect().catch((err) => {
  logger.error('Redis连接失败:', err);
});

// 默认缓存时间（秒）
const DEFAULT_CACHE_TIME = 3600;

export const cache = (duration: number = DEFAULT_CACHE_TIME) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // 只缓存GET请求
    if (req.method !== 'GET') {
      return next();
    }

    const key = `${config.redis.keyPrefix}cache:${req.method}:${req.originalUrl}`;

    try {
      // 尝试从缓存获取数据
      const cachedData = await redisClient.get(key);

      if (cachedData) {
        logger.debug('从缓存获取数据:', { key });
        return res.json(JSON.parse(cachedData));
      }

      // 如果没有缓存，继续处理请求
      next();
    } catch (error) {
      logger.error('缓存中间件错误:', error);
      next();
    }
  };
};