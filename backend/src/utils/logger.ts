import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { config } from '../config';

// 日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// 创建日志记录器
const logger = winston.createLogger({
  level: config.log.level,
  format: logFormat,
  transports: [
    // 控制台输出
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // 按日期轮转的文件输出
    new DailyRotateFile({
      filename: `logs/%DATE%-${config.log.filename}`,
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d'
    })
  ]
});

// 开发环境下的额外配置
if (config.server.env === 'development') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  );
}

// 自定义日志级别
export interface CustomLogger extends winston.Logger {
  success(message: string, ...meta: any[]): winston.Logger;
  fail(message: string, ...meta: any[]): winston.Logger;
  api(message: string, ...meta: any[]): winston.Logger;
  db(message: string, ...meta: any[]): winston.Logger;
  cache(message: string, ...meta: any[]): winston.Logger;
  auth(message: string, ...meta: any[]): winston.Logger;
}

// 添加自定义日志级别
const customLevels = {
  error: 0,
  warn: 1,
  fail: 2,
  info: 3,
  success: 4,
  http: 5,
  api: 6,
  db: 7,
  cache: 8,
  auth: 9,
  debug: 10
};

// 为每个级别添加颜色
winston.addColors({
  error: 'red',
  warn: 'yellow',
  fail: 'red',
  info: 'green',
  success: 'green',
  http: 'magenta',
  api: 'blue',
  db: 'cyan',
  cache: 'yellow',
  auth: 'magenta',
  debug: 'gray'
});

// 扩展日志记录器
const extendedLogger = logger as CustomLogger;

// 添加自定义方法
extendedLogger.success = function(message: string, ...meta: any[]): winston.Logger {
  return this.log('success', message, ...meta);
};

extendedLogger.fail = function(message: string, ...meta: any[]): winston.Logger {
  return this.log('fail', message, ...meta);
};

extendedLogger.api = function(message: string, ...meta: any[]): winston.Logger {
  return this.log('api', message, ...meta);
};

extendedLogger.db = function(message: string, ...meta: any[]): winston.Logger {
  return this.log('db', message, ...meta);
};

extendedLogger.cache = function(message: string, ...meta: any[]): winston.Logger {
  return this.log('cache', message, ...meta);
};

extendedLogger.auth = function(message: string, ...meta: any[]): winston.Logger {
  return this.log('auth', message, ...meta);
};

// 导出扩展后的日志记录器
export { extendedLogger as logger };

// 记录未捕获的异常
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// 记录未处理的 Promise 拒绝
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// 导出日志级别类型
export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

// 导出日志接口
export interface ILogger {
  error(message: string, ...meta: any[]): void;
  warn(message: string, ...meta: any[]): void;
  info(message: string, ...meta: any[]): void;
  debug(message: string, ...meta: any[]): void;
}

// 导出日志工具函数
export const log = (level: LogLevel, message: string, ...meta: any[]) => {
  logger[level](message, ...meta);
}; 