import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginParams, RegisterParams } from '@/services/auth/auth.service'
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
    try {
      await authService.init()
      user.value = authService.getCurrentUser()
      token.value = localStorage.getItem('token')
    } catch (e) {
      console.error('初始化认证状态失败：', e)
    }
  }

  // 注册
  const register = async (params: RegisterParams) => {
    loading.value = true
    error.value = null

    try {
      const newUser = await authService.register(params)
      user.value = newUser
      // 注册成功后自动登录
      await login({
        email: params.email,
        password: params.password
      })
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
      await authService.login(params)
      user.value = authService.getCurrentUser()
      token.value = localStorage.getItem('token')
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
      await authService.logout()
      user.value = null
      token.value = null
    } catch (e) {
      error.value = e instanceof Error ? e.message : '登出失败'
      throw e
    } finally {
      loading.value = false
    }
  }

  // 更新用户信息
  const updateProfile = async (updates: Partial<User>) => {
    loading.value = true
    error.value = null

    try {
      const updatedUser = await authService.updateProfile(updates)
      user.value = updatedUser
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
      await authService.changePassword(oldPassword, newPassword)
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