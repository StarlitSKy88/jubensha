import { Request, Response, NextFunction } from 'express'
import { AuthService } from '../services/auth.service'
import { AuthenticationError, AuthorizationError } from '../utils/errors'

// 扩展 Request 类型以包含用户信息
declare global {
  namespace Express {
    interface Request {
      user?: any
    }
  }
}

const authService = new AuthService()

/**
 * 验证 JWT token 中间件
 */
export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      throw new AuthenticationError('未提供认证token')
    }

    const token = authHeader.split(' ')[1]
    if (!token) {
      throw new AuthenticationError('token格式错误')
    }

    const user = await authService.verifyToken(token)
    req.user = user
    next()
  } catch (error) {
    next(error)
  }
}

/**
 * 角色验证中间件
 */
export const authorize = (roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AuthenticationError('用户未认证')
    }

    if (!roles.includes(req.user.role)) {
      throw new AuthorizationError('没有权限访问此资源')
    }

    next()
  }
}

/**
 * 资源所有者验证中间件
 */
export const authorizeOwner = (resourceIdPath: string) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AuthenticationError('用户未认证')
    }

    // 从请求中获取资源ID
    const resourceId = resourceIdPath.split('.').reduce((obj: any, key: string) => obj[key], req)

    // 管理员可以访问所有资源
    if (req.user.role === 'admin') {
      return next()
    }

    // 验证资源所有者
    if (req.user.id !== resourceId) {
      throw new AuthorizationError('没有权限访问此资源')
    }

    next()
  }
} 