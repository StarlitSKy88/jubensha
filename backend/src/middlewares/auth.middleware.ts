import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { logger } from '../utils/logger';
import { User } from '../modules/user/models/user.model';

// 扩展 Request 类型以包含用户信息
declare global {
  namespace Express {
    interface Request {
      user?: any;
      token?: string;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 从请求头获取 token
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '无效的认证令牌格式'
      });
    }

    try {
      // 验证 token
      const decoded = jwt.verify(token, config.jwt.secret) as any;

      // 检查用户是否存在
      const user = await User.findById(decoded.userId).select('-password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: '用户不存在'
        });
      }

      // 检查用户状态
      if (user.status !== 'active') {
        return res.status(401).json({
          success: false,
          message: '用户账号已被禁用'
        });
      }

      // 将用户信息和token添加到请求对象
      req.user = user;
      req.token = token;

      // 记录认证成功
      logger.auth('用户认证成功', {
        userId: user._id,
        path: req.path,
        method: req.method
      });

      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
          success: false,
          message: '认证令牌已过期'
        });
      }

      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({
          success: false,
          message: '无效的认证令牌'
        });
      }

      throw error;
    }
  } catch (error) {
    logger.error('认证中间件执行失败:', error);
    res.status(500).json({
      success: false,
      message: '认证过程发生错误'
    });
  }
};

// 可选的认证中间件
export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return next();
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as any;
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.status === 'active') {
        req.user = user;
        req.token = token;
      }
    } catch (error) {
      // 忽略token验证错误
      logger.debug('可选认证失败:', error);
    }

    next();
  } catch (error) {
    logger.error('可选认证中间件执行失败:', error);
    next();
  }
};

// 角色验证中间件
export const roleMiddleware = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '未经过身份认证'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: '没有足够的权限'
      });
    }

    next();
  };
};

// 权限验证中间件
export const permissionMiddleware = (...permissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '未经过身份认证'
      });
    }

    const hasPermission = permissions.every(permission =>
      req.user.permissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: '没有足够的权限'
      });
    }

    next();
  };
}; 