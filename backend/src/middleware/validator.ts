import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ValidationError } from '@utils/errors';
import { logger } from '@utils/logger';

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 验证请求数据
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });

      // 验证通过，继续处理请求
      return next();
    } catch (error) {
      // 处理Zod验证错误
      if (error instanceof ZodError) {
        logger.warn('请求数据验证失败:', {
          path: req.path,
          method: req.method,
          errors: error.errors
        });

        // 格式化错误信息
        const errorMessage = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));

        throw new ValidationError(JSON.stringify(errorMessage));
      }

      // 处理其他错误
      next(error);
    }
  };
}; 