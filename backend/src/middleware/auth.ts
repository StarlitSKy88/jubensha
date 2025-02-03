import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { errorResponse } from './validator';

// 扩展 Request 类型以包含用户信息
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        email: string;
        role: string;
      };
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 从请求头获取 token
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return errorResponse(res, 401, '未提供访问令牌');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return errorResponse(res, 401, '无效的访问令牌格式');
    }

    // 验证 token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
      id: string;
      username: string;
      email: string;
      role: string;
    };

    // 将用户信息添加到请求对象
    req.user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return errorResponse(res, 401, '无效的访问令牌');
    }
    if (error instanceof jwt.TokenExpiredError) {
      return errorResponse(res, 401, '访问令牌已过期');
    }
    return errorResponse(res, 500, '认证过程发生错误');
  }
};

// 角色验证中间件
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return errorResponse(res, 401, '未经授权的访问');
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(res, 403, '没有足够的权限');
    }

    next();
  };
};

// 资源所有者验证中间件
export const isResourceOwner = (
  getUserId: (req: Request) => string | undefined
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return errorResponse(res, 401, '未经授权的访问');
    }

    const resourceUserId = getUserId(req);
    if (!resourceUserId || resourceUserId !== req.user.id) {
      return errorResponse(res, 403, '没有权限访问此资源');
    }

    next();
  };
}; 