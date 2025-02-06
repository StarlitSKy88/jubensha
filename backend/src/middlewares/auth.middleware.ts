import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '@config/index';
import { AuthenticationError } from '@utils/errors';
import { UserModel } from '@modules/user/models/user.model';

// 扩展 Request 类型以包含用户信息
declare global {
  namespace Express {
    interface Request {
      user?: {
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

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '未提供认证令牌'
        }
      });
    }

    // 从 Authorization 头部获取 token
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '无效的认证令牌格式'
        }
      });
    }

    try {
      // 验证 token
      const decoded = jwt.verify(token, config.jwt.secret) as {
        id: string;
        username: string;
        email: string;
        role: string;
        permissions?: string[];
        status?: string;
      };

      // 查找用户
      const user = await UserModel.findById(decoded.id);

      if (!user) {
        throw new AuthenticationError('用户不存在');
      }

      // 将用户信息添加到请求对象
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
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: {
            code: 'TOKEN_EXPIRED',
            message: '认证令牌已过期'
          }
        });
      }

      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: '无效的认证令牌'
        }
      });
    }
  } catch (error) {
    next(error);
  }
}; 