import { UserModel } from '../models/user.model';
import { TokenService } from './token.service';
import { PasswordService } from './password.service';
import { AuthenticationError } from '@utils/errors';
import { logger } from '@utils/logger';

// 定义返回给客户端的用户对象接口
export interface IUserResponse {
  username: string;
  email: string;
  role: 'user' | 'admin';
  isActive: boolean;
  lastLogin?: Date;
}

export class AuthService {
  constructor(
    private tokenService: TokenService,
    private passwordService: PasswordService
  ) {}

  /**
   * 用户注册
   */
  async register(userData: {
    username: string;
    email: string;
    password: string;
  }) {
    try {
      // 检查用户是否已存在
      const existingUser = await UserModel.findOne({
        $or: [{ email: userData.email }, { username: userData.username }]
      });

      if (existingUser) {
        throw new AuthenticationError('用户已存在');
      }

      // 创建新用户
      const hashedPassword = await this.passwordService.hashPassword(userData.password);
      const user = await UserModel.create({
        ...userData,
        password: hashedPassword,
        role: 'user',
        status: 'active'
      });

      // 生成token
      const token = await this.tokenService.generateToken({
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      });

      return {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        token
      };
    } catch (error) {
      logger.error('注册失败:', error);
      throw error;
    }
  }

  /**
   * 用户登录
   */
  async login(credentials: { email: string; password: string }) {
    try {
      // 查找用户
      const user = await UserModel.findOne({ email: credentials.email });
      if (!user) {
        throw new AuthenticationError('用户不存在');
      }

      // 验证密码
      const isValid = await this.passwordService.comparePassword(
        credentials.password,
        user.password
      );

      if (!isValid) {
        throw new AuthenticationError('密码错误');
      }

      // 检查用户状态
      if (user.status !== 'active') {
        throw new AuthenticationError('账户已被禁用');
      }

      // 生成token
      const token = await this.tokenService.generateToken({
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      });

      // 更新最后登录时间
      await UserModel.updateOne(
        { _id: user._id },
        { $set: { lastLoginAt: new Date() } }
      );

      return {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        token
      };
    } catch (error) {
      logger.error('登录失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户信息
   */
  async getUserProfile(userId: string): Promise<IUserResponse> {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new AuthenticationError('用户不存在');
      }
      const userResponse: IUserResponse = {
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin
      };
      return userResponse;
    } catch (error) {
      logger.error('获取用户信息失败:', error);
      throw error;
    }
  }

  /**
   * 更新用户信息
   */
  async updateProfile(userId: string, updates: {
    username?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  }) {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new AuthenticationError('用户不存在');
      }

      // 如果要更新密码
      if (updates.currentPassword && updates.newPassword) {
        const isValid = await this.passwordService.comparePassword(
          updates.currentPassword,
          user.password
        );

        if (!isValid) {
          throw new AuthenticationError('当前密码错误');
        }

        updates.password = await this.passwordService.hashPassword(updates.newPassword);
      }

      // 更新用户信息
      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        { $set: updates },
        { new: true }
      );

      return {
        user: {
          id: updatedUser._id,
          username: updatedUser.username,
          email: updatedUser.email,
          role: updatedUser.role
        }
      };
    } catch (error) {
      logger.error('更新用户信息失败:', error);
      throw error;
    }
  }

  async refreshToken(token: string) {
    try {
      // 验证旧token
      const payload = await this.tokenService.verifyToken(token);

      // 生成新token
      const newToken = await this.tokenService.generateToken({
        id: payload.id,
        username: payload.username,
        email: payload.email,
        role: payload.role
      });

      return { token: newToken };
    } catch (error) {
      logger.error('刷新token失败:', error);
      throw error;
    }
  }

  async logout(userId: string) {
    try {
      // 清除用户的token(如果使用Redis存储)
      await this.tokenService.removeToken(userId);
      
      return { success: true };
    } catch (error) {
      logger.error('退出登录失败:', error);
      throw error;
    }
  }
}

export const authService = new AuthService(new TokenService(), new PasswordService()); 