import { Request, Response, NextFunction } from 'express';
import { ValidationChain, validationResult } from 'express-validator';
import { logger } from '../utils/logger';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 执行所有验证
      await Promise.all(validations.map(validation => validation.run(req)));

      // 获取验证结果
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.warn('请求参数验证失败:', {
          path: req.path,
          method: req.method,
          errors: errors.array()
        });

        return res.status(400).json({
          success: false,
          message: '请求参数验证失败',
          errors: errors.array().map(err => ({
            field: err.param,
            message: err.msg,
            value: err.value
          }))
        });
      }

      next();
    } catch (error) {
      logger.error('验证中间件执行失败:', error);
      res.status(500).json({
        success: false,
        message: '验证中间件执行失败'
      });
    }
  };
}; 