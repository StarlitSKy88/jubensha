import { Request, Response, NextFunction } from 'express';
import { logger } from '@utils/logger';

// 性能监控阈值（毫秒）
const SLOW_API_THRESHOLD = 1000;

export const performanceMonitor = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // 记录请求开始时间
  const startTime = Date.now();

  // 在响应结束时记录性能指标
  res.on('finish', () => {
    const duration = Date.now() - startTime;

    // 记录性能指标
    const performanceData = {
      method: req.method,
      path: req.path,
      duration: `${duration}ms`,
      statusCode: res.statusCode
    };

    // 检查是否超过阈值
    if (duration > SLOW_API_THRESHOLD) {
      logger.warn('检测到慢速API请求:', {
        ...performanceData,
        threshold: `${SLOW_API_THRESHOLD}ms`
      });
    } else {
      logger.debug('API性能指标:', performanceData);
    }

    // 监控内存使用
    const memoryUsage = process.memoryUsage();
    logger.debug('内存使用情况:', {
      heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`,
      heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)}MB`,
      rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)}MB`
    });
  });

  next();
};
