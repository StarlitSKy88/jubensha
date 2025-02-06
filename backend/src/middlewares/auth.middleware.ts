import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '@config';
import { logger } from '@utils/logger';
import { User } from '@models/user.model';

/**
 * 主认证中间件
 * 验证JWT token并加载用户信息
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 从请求头获取 token
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: '未提供认证令牌'
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({
        success: false,
        message: '无效的认证令牌格式'
      });
      return;
    }

    try {
      // 验证 token
      const decoded = jwt.verify(token, config.jwt.secret) as any;

      // 检查用户是否存在
      const user = await User.findById(decoded.userId).select('-password');
      if (!user) {
        res.status(401).json({
          success: false,
          message: '用户不存在'
        });
        return;
      }

      // 检查用户状态
      if (user.status !== 'active') {
        res.status(401).json({
          success: false,
          message: '用户账号已被禁用'
        });
        return;
      }

      // 将用户信息和token添加到请求对象
      req.user = {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        status: user.status
      };
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
        res.status(401).json({
          success: false,
          message: '认证令牌已过期'
        });
        return;
      }

      if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json({
          success: false,
          message: '无效的认证令牌'
        });
        return;
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

/**
 * 可选认证中间件
 * 如果提供了有效token则加载用户信息，否则继续处理
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      next();
      return;
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as any;
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.status === 'active') {
        req.user = {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          permissions: user.permissions,
          status: user.status
        };
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

/**
 * 角色验证中间件
 * 检查用户是否具有所需角色
 */
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: '未经过身份认证'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: '没有足够的权限'
      });
      return;
    }

    next();
  };
};

/**
 * 权限验证中间件
 * 检查用户是否具有所需权限
 */
export const requirePermissions = (...permissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: '未经过身份认证'
      });
      return;
    }

    const hasPermission = permissions.every(permission =>
      req.user.permissions?.includes(permission)
    );

    if (!hasPermission) {
      res.status(403).json({
        success: false,
        message: '没有足够的权限'
      });
      return;
    }

    next();
  };
};

/**
 * 资源所有者验证中间件
 * 检查用户是否为资源所有者
 */
export const isResourceOwner = (
  getUserId: (req: Request) => string | undefined
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: '未经过身份认证'
      });
      return;
    }

    const resourceUserId = getUserId(req);
    if (!resourceUserId || resourceUserId !== req.user.id) {
      res.status(403).json({
        success: false,
        message: '没有权限访问此资源'
      });
      return;
    }

    next();
  };
}; 