import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginParams, RegisterParams, UpdateProfileParams } from '@/types/user'
import { AuthService } from '@/services/auth/auth.service'

export const useAuthStore = defineStore('auth', () => {
  const authService = new AuthService()
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const isVerified = computed(() => user.value?.isVerified ?? false)
  const userRole = computed(() => user.value?.role)

  // 初始化认证状态
  const init = async () => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (savedToken && savedUser) {
      token.value = savedToken
      user.value = JSON.parse(savedUser)

      try {
        const response = await fetch('/api/auth/verify-token', {
          headers: {
            'Authorization': `Bearer ${savedToken}`
          }
        })

        if (!response.ok) {
          throw new Error('Token 无效')
        }
      } catch {
        logout()
      }
    }
  }

  // 注册
  const register = async (params: RegisterParams) => {
    loading.value = true
    error.value = null

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
    } catch (e) {
      error.value = e instanceof Error ? e.message : '注册失败'
      throw e
    } finally {
      loading.value = false
    }
  }

  // 登录
  const login = async (params: LoginParams) => {
    loading.value = true
    error.value = null

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
      user.value = data.user
      token.value = data.token

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
    } catch (e) {
      error.value = e instanceof Error ? e.message : '登录失败'
      throw e
    } finally {
      loading.value = false
    }
  }

  // 登出
  const logout = async () => {
    loading.value = true
    error.value = null

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      })

      user.value = null
      token.value = null

      localStorage.removeItem('token')
      localStorage.removeItem('user')
    } catch (e) {
      error.value = e instanceof Error ? e.message : '登出失败'
      throw e
    } finally {
      loading.value = false
    }
  }

  // 更新用户信息
  const updateProfile = async (updates: UpdateProfileParams) => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.value}`
        },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        throw new Error('更新失败')
      }

      const data = await response.json()
      user.value = data.user
      return data.user
    } catch (e) {
      error.value = e instanceof Error ? e.message : '更新失败'
      throw e
    } finally {
      loading.value = false
    }
  }

  // 修改密码
  const changePassword = async (oldPassword: string, newPassword: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.value}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
      })

      if (!response.ok) {
        throw new Error('修改密码失败')
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '修改密码失败'
      throw e
    } finally {
      loading.value = false
    }
  }

  // 发送验证邮件
  const sendVerificationEmail = async () => {
    loading.value = true
    error.value = null

    try {
      await authService.sendVerificationEmail()
    } catch (e) {
      error.value = e instanceof Error ? e.message : '发送验证邮件失败'
      throw e
    } finally {
      loading.value = false
    }
  }

  // 验证邮箱
  const verifyEmail = async (token: string) => {
    loading.value = true
    error.value = null

    try {
      await authService.verifyEmail(token)
      if (user.value) {
        user.value.isVerified = true
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '邮箱验证失败'
      throw e
    } finally {
      loading.value = false
    }
  }

  // 请求重置密码
  const requestPasswordReset = async (email: string) => {
    loading.value = true
    error.value = null

    try {
      await authService.requestPasswordReset(email)
    } catch (e) {
      error.value = e instanceof Error ? e.message : '请求重置密码失败'
      throw e
    } finally {
      loading.value = false
    }
  }

  // 重置密码
  const resetPassword = async (token: string, newPassword: string) => {
    loading.value = true
    error.value = null

    try {
      await authService.resetPassword(token, newPassword)
    } catch (e) {
      error.value = e instanceof Error ? e.message : '重置密码失败'
      throw e
    } finally {
      loading.value = false
    }
  }

  // 检查权限
  const hasPermission = (permission: string) => {
    return authService.hasPermission(permission)
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isVerified,
    userRole,
    init,
    register,
    login,
    logout,
    updateProfile,
    changePassword,
    sendVerificationEmail,
    verifyEmail,
    requestPasswordReset,
    resetPassword,
    hasPermission
  }
}) 