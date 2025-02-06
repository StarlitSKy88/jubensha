import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { MongooseError } from 'mongoose';

// 自定义错误类
export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// 处理Mongoose验证错误
const handleValidationErrorDB = (err: MongooseError) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `无效的输入数据: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// 处理Mongoose重复键错误
const handleDuplicateFieldsDB = (err: any) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `重复的字段值: ${value}。请使用其他值！`;
  return new AppError(message, 400);
};

// 处理Zod验证错误
const handleZodError = (err: ZodError) => {
  const message = err.errors.map((error) => error.message).join('. ');
  return new AppError(message, 400);
};

// 开发环境错误处理
const sendErrorDev = (err: AppError, res: Response) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

// 生产环境错误处理
const sendErrorProd = (err: AppError, res: Response) => {
  // 可操作的错误：发送消息给客户端
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } 
  // 编程错误：不泄露错误详情
  else {
    console.error('ERROR 💥', err);
    res.status(500).json({
      status: 'error',
      message: '服务器内部错误',
    });
  }
};

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = err as AppError;
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    if (err instanceof MongooseError && err.name === 'ValidationError') {
      error = handleValidationErrorDB(err);
    }
    if (err instanceof MongooseError && err.name === 'CastError') {
      error = new AppError('无效的ID', 400);
    }
    if (err.name === 'MongoServerError' && (err as any).code === 11000) {
      error = handleDuplicateFieldsDB(err);
    }
    if (err instanceof ZodError) {
      error = handleZodError(err);
    }
    sendErrorProd(error, res);
  }
}; 