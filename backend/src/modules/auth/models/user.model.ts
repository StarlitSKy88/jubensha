import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  isActive: boolean;
  lastLogin?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
}

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: [true, '用户名是必需的'],
    unique: true,
    trim: true,
    minlength: [3, '用户名至少需要3个字符'],
    maxlength: [20, '用户名不能超过20个字符']
  },
  email: {
    type: String,
    required: [true, '邮箱是必需的'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, '请输入有效的邮箱地址']
  },
  password: {
    type: String,
    required: [true, '密码是必需的'],
    minlength: [6, '密码至少需要6个字符'],
    select: false // 查询时默认不返回密码
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true // 自动添加 createdAt 和 updatedAt 字段
});

// 保存前加密密码
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// 比较密码
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('密码比较失败');
  }
};

// 生成JWT令牌
userSchema.methods.generateAuthToken = function(): string {
  const token = jwt.sign(
    { 
      id: this._id,
      username: this.username,
      role: this.role 
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { 
      expiresIn: '24h' 
    }
  );
  return token;
};

export const User = model<IUser>('User', userSchema); 