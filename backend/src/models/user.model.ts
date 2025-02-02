import { Schema, model } from 'mongoose'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'

export interface IUser {
  id: string
  username: string
  email: string
  password: string
  role: 'admin' | 'user'
  status: 'active' | 'inactive'
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const userSchema = new Schema<IUser>(
  {
    id: {
      type: String,
      default: () => nanoid(),
      unique: true,
      required: true
    },
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
      select: false
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user'
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    lastLoginAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
)

// 密码加密中间件
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next()
  }

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error: any) {
    next(error)
  }
})

// 密码比较方法
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password)
  } catch (error) {
    throw new Error('密码比较失败')
  }
}

// 创建索引
userSchema.index({ email: 1 })
userSchema.index({ username: 1 })
userSchema.index({ id: 1 })

export const User = model<IUser>('User', userSchema) 