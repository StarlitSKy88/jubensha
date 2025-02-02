import { Request, Response, NextFunction } from 'express'
import { AuthService } from '../services/auth.service'
import { ValidationError } from '../utils/errors'
import { validateEmail, validatePassword } from '../utils/validators'

export class AuthController {
  private authService: AuthService

  constructor() {
    this.authService = new AuthService()
  }

  /**
   * 用户注册
   */
  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, email, password } = req.body

      // 验证输入
      if (!username || !email || !password) {
        throw new ValidationError('用户名、邮箱和密码都是必填项')
      }

      if (!validateEmail(email)) {
        throw new ValidationError('邮箱格式不正确')
      }

      if (!validatePassword(password)) {
        throw new ValidationError('密码必须包含至少6个字符')
      }

      const { user, token } = await this.authService.register({
        username,
        email,
        password
      })

      res.status(201).json({
        message: '注册成功',
        data: {
          user,
          token
        }
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * 用户登录
   */
  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body

      // 验证输入
      if (!email || !password) {
        throw new ValidationError('邮箱和密码都是必填项')
      }

      if (!validateEmail(email)) {
        throw new ValidationError('邮箱格式不正确')
      }

      const { user, token } = await this.authService.login({
        email,
        password
      })

      res.json({
        message: '登录成功',
        data: {
          user,
          token
        }
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * 重置密码
   */
  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params
      const { newPassword } = req.body

      if (!validatePassword(newPassword)) {
        throw new ValidationError('新密码必须包含至少6个字符')
      }

      await this.authService.resetPassword(userId, newPassword)

      res.json({
        message: '密码重置成功'
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * 获取当前用户信息
   */
  getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        message: '获取成功',
        data: {
          user: req.user
        }
      })
    } catch (error) {
      next(error)
    }
  }
} 