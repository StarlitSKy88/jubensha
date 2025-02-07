import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '@config/index';
import { UnauthorizedError } from '@utils/errors';
import { UserModel } from '@modules/user/models/user.model';

// 扩展 Request 类型以包含用户信息
declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        username: string;
        email: string;
        role: string;
        permissions?: string[];
        status?: string;
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
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedError('未提供认证令牌');
    }

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedError('无效的认证令牌格式');
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as {
        id: string;
      };

      const user = await UserModel.findById(decoded.id);
      if (!user) {
        throw new UnauthorizedError('用户不存在');
      }

      if (user.status !== 'active') {
        throw new UnauthorizedError('用户账号已被禁用');
      }

      req.user = {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        status: user.status
      };

      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('无效的认证令牌');
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
}; 