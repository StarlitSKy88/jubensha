import { z } from 'zod';
import { UserRole } from '../models/user.model';

// 注册验证模式
export const registerSchema = z.object({
  body: z.object({
    username: z.string()
      .min(3, '用户名至少需要3个字符')
      .max(30, '用户名不能超过30个字符'),
    email: z.string()
      .email('请输入有效的邮箱地址'),
    password: z.string()
      .min(8, '密码至少需要8个字符')
      .max(100, '密码不能超过100个字符')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, 
        '密码必须包含至少一个大写字母、一个小写字母和一个数字'),
    confirmPassword: z.string()
  }).refine((data) => data.password === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  })
});

// 登录验证模式
export const loginSchema = z.object({
  body: z.object({
    email: z.string()
      .email('请输入有效的邮箱地址'),
    password: z.string()
      .min(1, '请输入密码')
  })
});

// 更新个人信息验证模式
export const updateProfileSchema = z.object({
  body: z.object({
    username: z.string()
      .min(3, '用户名至少需要3个字符')
      .max(30, '用户名不能超过30个字符')
      .optional(),
    email: z.string()
      .email('请输入有效的邮箱地址')
      .optional(),
    profile: z.object({
      avatar: z.string().url('请输入有效的头像URL').optional(),
      bio: z.string().max(500, '个人简介不能超过500个字符').optional(),
      location: z.string().max(100, '地址不能超过100个字符').optional(),
    }).optional()
  })
});

// 修改密码验证模式
export const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string()
      .min(1, '请输入当前密码'),
    newPassword: z.string()
      .min(8, '新密码至少需要8个字符')
      .max(100, '新密码不能超过100个字符')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, 
        '密码必须包含至少一个大写字母、一个小写字母和一个数字'),
    confirmPassword: z.string()
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "两次输入的新密码不一致",
    path: ["confirmPassword"],
  })
});

// 更新用户角色验证模式
export const updateUserRoleSchema = z.object({
  body: z.object({
    role: z.nativeEnum(UserRole, {
      errorMap: () => ({ message: '无效的用户角色' })
    }),
    permissions: z.array(z.string())
      .min(1, '至少需要指定一个权限')
      .optional()
  })
});