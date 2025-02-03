import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { AuthError } from '../errors/auth.error';

// 扩展Request类型以包含用户信息
declare global {
  namespace Express {
    interface Request {
      user?: any;
      token?: string;
    }
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 从请求头获取token
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new AuthError('未提供认证令牌', 401);
    }

    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // 查找用户
    const user = await User.findById((decoded as any).id);

    if (!user) {
      throw new AuthError('用户不存在', 401);
    }

    if (!user.isActive) {
      throw new AuthError('用户账号已被禁用', 403);
    }

    // 将用户信息和token添加到请求对象
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AuthError('无效的认证令牌', 401));
    } else {
      next(error);
    }
  }
};

// 角色验证中间件
export const checkRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AuthError('未经授权', 401);
    }

    if (!roles.includes(req.user.role)) {
      throw new AuthError('权限不足', 403);
    }

    next();
  };
}; 