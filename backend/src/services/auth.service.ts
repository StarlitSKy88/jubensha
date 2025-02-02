import jwt from 'jsonwebtoken'
import { User, IUser } from '../models/user.model'
import { BusinessError } from '../utils/errors'

export class AuthService {
  /**
   * 用户注册
   */
  async register(userData: {
    username: string
    email: string
    password: string
  }): Promise<{ user: IUser; token: string }> {
    // 检查用户是否已存在
    const existingUser = await User.findOne({
      $or: [{ email: userData.email }, { username: userData.username }]
    })

    if (existingUser) {
      throw new BusinessError('AUTH_ERROR', '用户名或邮箱已存在', 400)
    }

    // 创建新用户
    const user = await User.create(userData)

    // 生成 token
    const token = this.generateToken(user)

    return { user, token }
  }

  /**
   * 用户登录
   */
  async login(credentials: {
    email: string
    password: string
  }): Promise<{ user: IUser; token: string }> {
    // 查找用户并包含密码字段
    const user = await User.findOne({ email: credentials.email }).select('+password')

    if (!user) {
      throw new BusinessError('AUTH_ERROR', '用户不存在', 404)
    }

    // 验证密码
    const isPasswordValid = await user.comparePassword(credentials.password)
    if (!isPasswordValid) {
      throw new BusinessError('AUTH_ERROR', '密码错误', 401)
    }

    // 更新最后登录时间
    user.lastLoginAt = new Date()
    await user.save()

    // 生成 token
    const token = this.generateToken(user)

    // 移除密码字段
    user.password = undefined as any

    return { user, token }
  }

  /**
   * 重置密码
   */
  async resetPassword(userId: string, newPassword: string): Promise<void> {
    const user = await User.findOne({ id: userId })

    if (!user) {
      throw new BusinessError('AUTH_ERROR', '用户不存在', 404)
    }

    user.password = newPassword
    await user.save()
  }

  /**
   * 验证 token
   */
  async verifyToken(token: string): Promise<IUser> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
      const user = await User.findOne({ id: decoded.userId })

      if (!user) {
        throw new BusinessError('AUTH_ERROR', '用户不存在', 404)
      }

      return user
    } catch (error) {
      throw new BusinessError('AUTH_ERROR', 'token无效或已过期', 401)
    }
  }

  /**
   * 生成 JWT token
   */
  private generateToken(user: IUser): string {
    return jwt.sign(
      {
        userId: user.id,
        role: user.role
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      }
    )
  }
} 