import { Request, Response, NextFunction } from 'express';
import { ValidationChain, validationResult } from 'express-validator';
import { Types } from 'mongoose';
import { logger } from '../utils/logger';

/**
 * 验证中间件
 * 执行express-validator验证链并处理结果
 */
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

/**
 * MongoDB ObjectId 验证
 */
export const isValidObjectId = (value: string) => {
  return Types.ObjectId.isValid(value);
};

/**
 * 通用错误响应
 */
export const errorResponse = (res: Response, status: number, message: string, errors?: any) => {
  return res.status(status).json({
    success: false,
    message,
    ...(errors && { errors })
  });
};

/**
 * 通用成功响应
 */
export const successResponse = (res: Response, data: any, message = '操作成功') => {
  return res.status(200).json({
    success: true,
    message,
    data
  });
};

/**
 * 分页参数验证和处理
 */
export const validatePagination = (req: Request) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip
  };
};

/**
 * 排序参数验证和处理
 */
export const validateSort = (req: Request, defaultSort = { createdAt: -1 }) => {
  const sortField = req.query.sortBy as string;
  const sortOrder = req.query.sortOrder as string;

  if (!sortField || !sortOrder) {
    return defaultSort;
  }

  return {
    [sortField]: sortOrder === 'desc' ? -1 : 1
  };
};

/**
 * 搜索参数验证和处理
 */
export const validateSearch = (req: Request, searchFields: string[]) => {
  const searchTerm = req.query.search as string;
  
  if (!searchTerm) {
    return {};
  }

  return {
    $or: searchFields.map(field => ({
      [field]: new RegExp(searchTerm, 'i')
    }))
  };
};

/**
 * 日期范围验证和处理
 */
export const validateDateRange = (startDate?: string, endDate?: string) => {
  const dateFilter: any = {};

  if (startDate) {
    dateFilter.$gte = new Date(startDate);
  }

  if (endDate) {
    dateFilter.$lte = new Date(endDate);
  }

  return Object.keys(dateFilter).length > 0 ? dateFilter : null;
}; 