import { Request, Response, NextFunction } from 'express';
import { BaseError } from '@utils/errors';
import { logger } from '@utils/logger';
import { StatusCodes } from 'http-status-codes';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // 记录错误日志
  logger.error('错误处理中间件捕获到错误:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    query: req.query,
    body: req.body
  });

  // 处理自定义错误
  if (err instanceof BaseError) {
    res.status(err.httpCode).json({
      status: 'error',
      code: err.httpCode,
      message: err.message,
      isOperational: err.isOperational
    });
    return;
  }

  // 处理验证错误
  if (err.name === 'ValidationError') {
    res.status(StatusCodes.BAD_REQUEST).json({
      status: 'error',
      code: StatusCodes.BAD_REQUEST,
      message: err.message,
      isOperational: true
    });
    return;
  }

  // 处理MongoDB错误
  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      message: '数据库操作失败',
      isOperational: false
    });
    return;
  }

  // 处理JWT错误
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    res.status(StatusCodes.UNAUTHORIZED).json({
      status: 'error',
      code: StatusCodes.UNAUTHORIZED,
      message: '无效的认证令牌',
      isOperational: true
    });
    return;
  }

  // 处理其他未知错误
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    status: 'error',
    code: StatusCodes.INTERNAL_SERVER_ERROR,
    message: '服务器内部错误',
    isOperational: false
  });
};