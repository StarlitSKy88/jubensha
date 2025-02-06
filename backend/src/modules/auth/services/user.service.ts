import { UserModel, IUser, UserRole, UserStatus } from '../models/user.model';
import { 
  AuthenticationError, 
  ValidationError, 
  NotFoundError 
} from '@utils/errors';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '@config';

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: IUser;
  token: string;
}

export interface UpdateProfileInput {
  username?: string;
  email?: string;
  profile?: {
    avatar?: string;
    bio?: string;
    location?: string;
  };
}

export interface ChangePasswordInput {
  oldPassword: string;
  newPassword: string;
}

export class UserService {
  /**
   * 用户注册
   */
  async register(data: RegisterInput): Promise<IUser> {
    // 检查用户名是否已存在
    const existingUsername = await UserModel.findOne({ username: data.username });
    if (existingUsername) {
      throw new ValidationError('用户名已存在', [
        { field: 'username', message: '用户名已存在' }
      ]);
    }

    // 检查邮箱是否已存在
    const existingEmail = await UserModel.findOne({ email: data.email });
    if (existingEmail) {
      throw new ValidationError('邮箱已被注册', [
        { field: 'email', message: '邮箱已被注册' }
      ]);
    }

    // 创建新用户
    const user = new UserModel({
      ...data,
      role: data.role || UserRole.USER,
      status: UserStatus.ACTIVE,
      permissions: []
    });

    await user.save();
    return user;
  }

  /**
   * 用户登录
   */
  async login(data: LoginInput): Promise<LoginResponse> {
    // 查找用户
    const user = await UserModel.findOne({ email: data.email });
    if (!user) {
      throw new AuthenticationError('用户不存在');
    }

    // 验证密码
    const isValid = await user.comparePassword(data.password);
    if (!isValid) {
      throw new AuthenticationError('密码错误');
    }

    // 更新最后登录时间
    user.lastLogin = new Date();
    await user.save();

    // 生成token
    const signOptions: SignOptions = {
      expiresIn: config.jwt.expiresIn,
      algorithm: 'HS256'
    };

    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role
      },
      config.jwt.secret,
      signOptions
    );

    return { user, token };
  }

  /**
   * 更新用户资料
   */
  async updateProfile(userId: string, data: UpdateProfileInput): Promise<IUser> {
    // 查找用户
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError('用户不存在');
    }

    // 如果要更新用户名，检查是否已存在
    if (data.username) {
      const existingUsername = await UserModel.findOne({ 
        username: data.username,
        _id: { $ne: userId }
      });
      if (existingUsername) {
        throw new ValidationError('用户名已存在', [
          { field: 'username', message: '用户名已存在' }
        ]);
      }
    }

    // 如果要更新邮箱，检查是否已存在
    if (data.email) {
      const existingEmail = await UserModel.findOne({ 
        email: data.email,
        _id: { $ne: userId }
      });
      if (existingEmail) {
        throw new ValidationError('邮箱已被注册', [
          { field: 'email', message: '邮箱已被注册' }
        ]);
      }
    }

    // 更新用户资料
    Object.assign(user, data);
    await user.save();
    return user;
  }

  /**
   * 修改密码
   */
  async changePassword(userId: string, data: ChangePasswordInput): Promise<void> {
    // 查找用户
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError('用户不存在');
    }

    // 验证旧密码
    const isValid = await user.comparePassword(data.oldPassword);
    if (!isValid) {
      throw new AuthenticationError('原密码错误');
    }

    // 更新密码
    user.password = data.newPassword;
    await user.save();
  }

  /**
   * 获取用户信息
   */
  async getUserById(userId: string): Promise<IUser> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError('用户不存在');
    }
    return user;
  }

  /**
   * 获取用户列表
   */
  async getUsers(options: {
    page?: number;
    limit?: number;
    role?: UserRole;
    status?: UserStatus;
  } = {}): Promise<{ users: IUser[]; total: number }> {
    const { 
      page = 1, 
      limit = 10, 
      role, 
      status 
    } = options;

    const query: any = {};
    if (role) query.role = role;
    if (status) query.status = status;

    const [users, total] = await Promise.all([
      UserModel.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 }),
      UserModel.countDocuments(query)
    ]);

    return { users, total };
  }
} 