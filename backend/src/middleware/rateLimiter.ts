import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

// 创建基本的限流配置
const createRateLimiter = (options: {
  windowMs?: number;
  max?: number;
  message?: string;
}) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // 默认15分钟
    max: options.max || 100, // 默认限制100次请求
    message: options.message || '请求过于频繁，请稍后再试',
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// API 通用限流
export const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 每个IP限制100次请求
});

// 登录接口限流
export const loginLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1小时
  max: 5, // 每个IP限制5次尝试
  message: '登录尝试次数过多，请1小时后再试'
});

// 注册接口限流
export const registerLimiter = createRateLimiter({
  windowMs: 24 * 60 * 60 * 1000, // 24小时
  max: 3, // 每个IP限制3次注册
  message: '注册次数超限，请24小时后再试'
});

// 自定义限流中间件
export const customRateLimiter = (
  windowMs: number,
  max: number,
  message: string
) => {
  return createRateLimiter({ windowMs, max, message });
}; 