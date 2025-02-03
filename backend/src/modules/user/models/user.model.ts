import { Schema, Document, Types, model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  name?: string;
  avatar?: string;
  role: 'admin' | 'user' | 'guest';
  permissions: string[];
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: Date;
  metadata: {
    loginCount: number;
    failedLoginAttempts: number;
    lastFailedLogin?: Date;
    passwordChangedAt?: Date;
  };
  settings: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    notifications: boolean;
    twoFactorEnabled: boolean;
  };
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 50
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, '请提供有效的邮箱地址']
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false // 默认不返回密码
    },
    name: {
      type: String,
      trim: true,
      maxlength: 100
    },
    avatar: {
      type: String,
      trim: true
    },
    role: {
      type: String,
      enum: ['admin', 'user', 'guest'],
      default: 'user'
    },
    permissions: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'inactive'
    },
    lastLogin: Date,
    metadata: {
      loginCount: {
        type: Number,
        default: 0
      },
      failedLoginAttempts: {
        type: Number,
        default: 0
      },
      lastFailedLogin: Date,
      passwordChangedAt: Date
    },
    settings: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system'
      },
      language: {
        type: String,
        default: 'zh-CN'
      },
      notifications: {
        type: Boolean,
        default: true
      },
      twoFactorEnabled: {
        type: Boolean,
        default: false
      }
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// 索引
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ 'metadata.lastFailedLogin': 1 });

// 密码加密中间件
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    
    if (this.isModified('password') && !this.isNew) {
      this.metadata.passwordChangedAt = new Date();
    }
    
    next();
  } catch (error) {
    next(error as Error);
  }
});

// 比较密码方法
UserSchema.methods.comparePassword = async function(
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('密码比较失败');
  }
};

// 虚拟字段
UserSchema.virtual('isAdmin').get(function(this: IUser) {
  return this.role === 'admin';
});

UserSchema.virtual('isActive').get(function(this: IUser) {
  return this.status === 'active';
});

UserSchema.virtual('displayName').get(function(this: IUser) {
  return this.name || this.username;
});

export const User = model<IUser>('User', UserSchema); 