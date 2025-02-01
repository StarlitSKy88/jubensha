import { ref } from 'vue'
import type { Ref } from 'vue'
import { useRouter } from 'vue-router'

// 用户类型
export interface User {
  id: string
  username: string
  email: string
  role: 'admin' | 'writer' | 'player'
  avatar?: string
  createdAt: Date
  lastLoginAt: Date
  isVerified: boolean
  settings: {
    theme: 'light' | 'dark' | 'system'
    language: string
    notifications: boolean
  }
}

// 注册参数
export interface RegisterParams {
  username: string
  email: string
  password: string
  role?: 'writer' | 'player'
}

// 登录参数
export interface LoginParams {
  email: string
  password: string
}

// 认证服务
export class AuthService {
  private currentUser: Ref<User | null> = ref(null)
  private token: Ref<string | null> = ref(null)
  private router = useRouter()

  // 注册
  async register(params: RegisterParams): Promise<User> {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      })

      if (!response.ok) {
        throw new Error('注册失败')
      }

      const data = await response.json()
      return data.user
    } catch (error) {
      console.error('注册错误：', error)
      throw new Error('注册服务暂时不可用')
    }
  }

  // 登录
  async login(params: LoginParams): Promise<void> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      })

      if (!response.ok) {
        throw new Error('登录失败')
      }

      const data = await response.json()
      this.currentUser.value = data.user
      this.token.value = data.token

      // 保存到 localStorage
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      // 更新最后登录时间
      this.currentUser.value.lastLoginAt = new Date()
    } catch (error) {
      console.error('登录错误：', error)
      throw new Error('登录服务暂时不可用')
    }
  }

  // 登出
  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token.value}`
        }
      })

      this.currentUser.value = null
      this.token.value = null

      // 清除 localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('user')

      // 跳转到登录页
      this.router.push('/login')
    } catch (error) {
      console.error('登出错误：', error)
      throw new Error('登出服务暂时不可用')
    }
  }

  // 获取当前用户
  getCurrentUser(): User | null {
    return this.currentUser.value
  }

  // 检查是否已登录
  isAuthenticated(): boolean {
    return !!this.currentUser.value && !!this.token.value
  }

  // 检查是否有权限
  hasPermission(permission: string): boolean {
    if (!this.currentUser.value) {
      return false
    }

    // 管理员拥有所有权限
    if (this.currentUser.value.role === 'admin') {
      return true
    }

    // 根据角色和权限检查
    const rolePermissions: Record<string, string[]> = {
      writer: ['create_script', 'edit_script', 'delete_script', 'manage_characters'],
      player: ['view_script', 'join_game', 'submit_feedback']
    }

    return rolePermissions[this.currentUser.value.role]?.includes(permission) || false
  }

  // 更新用户信息
  async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token.value}`
        },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        throw new Error('更新失败')
      }

      const data = await response.json()
      this.currentUser.value = data.user
      return data.user
    } catch (error) {
      console.error('更新用户信息错误：', error)
      throw new Error('更新服务暂时不可用')
    }
  }

  // 修改密码
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    try {
      const response = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token.value}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
      })

      if (!response.ok) {
        throw new Error('修改密码失败')
      }
    } catch (error) {
      console.error('修改密码错误：', error)
      throw new Error('密码修改服务暂时不可用')
    }
  }

  // 发送验证邮件
  async sendVerificationEmail(): Promise<void> {
    try {
      const response = await fetch('/api/auth/verify/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token.value}`
        }
      })

      if (!response.ok) {
        throw new Error('发送验证邮件失败')
      }
    } catch (error) {
      console.error('发送验证邮件错误：', error)
      throw new Error('邮件发送服务暂时不可用')
    }
  }

  // 验证邮箱
  async verifyEmail(token: string): Promise<void> {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      })

      if (!response.ok) {
        throw new Error('邮箱验证失败')
      }

      if (this.currentUser.value) {
        this.currentUser.value.isVerified = true
      }
    } catch (error) {
      console.error('邮箱验证错误：', error)
      throw new Error('验证服务暂时不可用')
    }
  }

  // 重置密码请求
  async requestPasswordReset(email: string): Promise<void> {
    try {
      const response = await fetch('/api/auth/password/reset/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })

      if (!response.ok) {
        throw new Error('重置密码请求失败')
      }
    } catch (error) {
      console.error('重置密码请求错误：', error)
      throw new Error('重置密码服务暂时不可用')
    }
  }

  // 重置密码
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const response = await fetch('/api/auth/password/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, newPassword })
      })

      if (!response.ok) {
        throw new Error('重置密码失败')
      }
    } catch (error) {
      console.error('重置密码错误：', error)
      throw new Error('重置密码服务暂时不可用')
    }
  }

  // 初始化认证状态
  async init(): Promise<void> {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')

    if (token && user) {
      this.token.value = token
      this.currentUser.value = JSON.parse(user)

      // 验证 token 是否有效
      try {
        const response = await fetch('/api/auth/verify-token', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('Token 无效')
        }
      } catch (error) {
        // Token 无效，清除状态
        this.logout()
      }
    }
  }
} 