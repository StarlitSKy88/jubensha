import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '@config';
import { AuthenticationError, AuthorizationError } from '@utils/errors';
import { logger } from '@utils/logger';

// 定义用户接口
interface IUser {
  id: string;
  username: string;
  email: string;
  role: string;
  permissions: string[];
  status?: string;
}

// 扩展Request类型以包含用户信息
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

// 验证JWT令牌
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      throw new AuthenticationError('未提供认证令牌');
    }

    // 验证令牌
    const decoded = jwt.verify(token, config.jwt.secret) as IUser;

    // 将用户信息添加到请求对象
    req.user = decoded;

    logger.debug('用户认证成功:', {
      userId: decoded.id,
      role: decoded.role
    });

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthenticationError('无效的认证令牌');
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthenticationError('认证令牌已过期');
    }
    next(error);
  }
};

// 检查用户角色
export const checkRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AuthenticationError('未认证的用户');
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('用户权限不足:', {
        userId: req.user.id,
        requiredRoles: roles,
        userRole: req.user.role
      });
      throw new AuthorizationError('没有足够的权限执行此操作');
    }

    next();
  };
};

// 检查用户权限
export const checkPermission = (requiredPermissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AuthenticationError('未认证的用户');
    }

    const hasAllPermissions = requiredPermissions.every(permission =>
      req.user.permissions.includes(permission)
    );

    if (!hasAllPermissions) {
      logger.warn('用户权限不足:', {
        userId: req.user.id,
        requiredPermissions,
        userPermissions: req.user.permissions
      });
      throw new AuthorizationError('没有足够的权限执行此操作');
    }

    next();
  };
};