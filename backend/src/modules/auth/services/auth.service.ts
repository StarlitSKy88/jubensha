import { User, IUser } from '../models/user.model';
import { CreateUserDto, LoginUserDto } from '../dtos/auth.dto';
import { AuthError } from '../errors/auth.error';

// 定义返回给客户端的用户对象接口
export interface IUserResponse {
  username: string;
  email: string;
  role: 'user' | 'admin';
  isActive: boolean;
  lastLogin?: Date;
}

export class AuthService {
  /**
   * 用户注册
   */
  async register(userData: CreateUserDto): Promise<{ user: IUserResponse; token: string }> {
    try {
      // 检查用户是否已存在
      const existingUser = await User.findOne({
        $or: [
          { email: userData.email },
          { username: userData.username }
        ]
      });

      if (existingUser) {
        throw new AuthError('用户已存在', 400);
      }

      // 创建新用户
      const user = new User(userData);
      await user.save();

      // 生成token
      const token = user.generateAuthToken();

      // 不返回密码，只返回必要的用户信息
      const userResponse: IUserResponse = {
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin
      };

      return { user: userResponse, token };
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError('注册失败', 500);
    }
  }

  /**
   * 用户登录
   */
  async login(loginData: LoginUserDto): Promise<{ user: IUserResponse; token: string }> {
    try {
      // 查找用户
      const user = await User.findOne({ email: loginData.email }).select('+password');
      
      if (!user) {
        throw new AuthError('用户不存在', 404);
      }

      // 验证密码
      const isValidPassword = await user.comparePassword(loginData.password);
      if (!isValidPassword) {
        throw new AuthError('密码错误', 401);
      }

      // 更新最后登录时间
      user.lastLogin = new Date();
      await user.save();

      // 生成token
      const token = user.generateAuthToken();

      // 不返回密码，只返回必要的用户信息
      const userResponse: IUserResponse = {
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin
      };

      return { user: userResponse, token };
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError('登录失败', 500);
    }
  }

  /**
   * 获取用户信息
   */
  async getUserProfile(userId: string): Promise<IUserResponse> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AuthError('用户不存在', 404);
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
      if (error instanceof AuthError) throw error;
      throw new AuthError('获取用户信息失败', 500);
    }
  }

  /**
   * 更新用户信息
   */
  async updateProfile(userId: string, updateData: Partial<IUserResponse>): Promise<IUserResponse> {
    try {
      // 不允许更新敏感字段
      delete updateData.role;  // 只删除角色字段，因为密码字段不在 IUserResponse 中

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!user) {
        throw new AuthError('用户不存在', 404);
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
      if (error instanceof AuthError) throw error;
      throw new AuthError('更新用户信息失败', 500);
    }
  }
}

export const authService = new AuthService(); 