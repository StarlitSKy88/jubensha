import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ValidationError } from '@utils/errors';
import { logger } from '@utils/logger';

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn('请求验证失败:', error.errors);
        const validationError = new ValidationError(
          '请求参数验证失败',
          error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        );
        next(validationError);
      } else {
        next(error);
      }
    }
  };
}; 