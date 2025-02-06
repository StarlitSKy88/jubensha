import { Request, Response, NextFunction } from 'express';
import { monitorConfig } from '@config/monitor.config';
import { logger } from '@utils/logger';
import { performance } from 'perf_hooks';
import os from 'os';

// 性能指标收集
interface PerformanceMetrics {
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  timestamp: number;
}

// 错误计数器
const errorCounter = new Map<string, number>();

// 性能指标存储
const performanceMetrics: PerformanceMetrics[] = [];

// 监控中间件
export const monitorMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = performance.now();
  const startUsage = process.cpuUsage();

  // 响应完成后收集指标
  res.on('finish', () => {
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    const endUsage = process.cpuUsage(startUsage);
    const cpuUsage = (endUsage.user + endUsage.system) / 1000000; // 转换为秒
    const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024; // 转换为MB

    // 记录性能指标
    const metrics: PerformanceMetrics = {
      responseTime,
      memoryUsage,
      cpuUsage,
      timestamp: Date.now()
    };
    performanceMetrics.push(metrics);

    // 检查是否超过阈值
    checkPerformanceThresholds(metrics, req);
  });

  next();
};

// 错误监控中间件
export const errorMonitorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
  const errorType = err.constructor.name;
  const currentCount = (errorCounter.get(errorType) || 0) + 1;
  errorCounter.set(errorType, currentCount);

  // 检查错误阈值
  if (currentCount >= monitorConfig.error.errorThreshold) {
    triggerErrorAlert(errorType, currentCount);
  }

  next(err);
};

// 检查性能阈值
function checkPerformanceThresholds(metrics: PerformanceMetrics, req: Request) {
  const { slowApiThreshold, memoryThreshold, cpuThreshold } = monitorConfig.performance;

  // 检查响应时间
  if (metrics.responseTime > slowApiThreshold) {
    logger.warn('慢API检测', {
      path: req.path,
      method: req.method,
      responseTime: metrics.responseTime,
      threshold: slowApiThreshold
    });
  }

  // 检查内存使用
  if (metrics.memoryUsage > memoryThreshold) {
    logger.warn('内存使用过高', {
      memoryUsage: metrics.memoryUsage,
      threshold: memoryThreshold
    });
  }

  // 检查CPU使用
  if (metrics.cpuUsage > cpuThreshold) {
    logger.warn('CPU使用过高', {
      cpuUsage: metrics.cpuUsage,
      threshold: cpuThreshold
    });
  }
}

// 触发错误告警
function triggerErrorAlert(errorType: string, count: number) {
  logger.error('错误告警', {
    errorType,
    count,
    threshold: monitorConfig.error.errorThreshold
  });

  // TODO: 实现具体的告警逻辑（邮件、Slack等）
}

// 定期清理性能指标数据
setInterval(() => {
  const cutoffTime = Date.now() - 24 * 60 * 60 * 1000; // 保留24小时的数据
  const index = performanceMetrics.findIndex(m => m.timestamp > cutoffTime);
  if (index > 0) {
    performanceMetrics.splice(0, index);
  }
}, monitorConfig.performance.sampleInterval);

// 定期重置错误计数器
setInterval(() => {
  errorCounter.clear();
}, 60 * 1000); // 每分钟重置一次 