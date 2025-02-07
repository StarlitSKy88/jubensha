import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from './notification'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'user'
  createdAt: Date
  updatedAt: Date
}

export const useUserStore = defineStore('user', () => {
  const router = useRouter()
  const notificationStore = useNotificationStore()
  
  // 当前用户
  const currentUser = ref<User | null>(null)
  
  // 是否已登录
  const isLoggedIn = computed(() => !!currentUser.value)
  
  // 是否是管理员
  const isAdmin = computed(() => currentUser.value?.role === 'admin')
  
  // 登录
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
      
      if (!response.ok) {
        throw new Error('登录失败')
      }
      
      const data = await response.json()
      currentUser.value = data.user
      
      notificationStore.addNotification({
        title: '登录成功',
        description: `欢迎回来，${data.user.name}`,
        type: 'system'
      })
      
      return data.user
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }
  
  // 登出
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST'
      })
      
      currentUser.value = null
      
      notificationStore.addNotification({
        title: '已登出',
        description: '您已成功退出登录',
        type: 'system'
      })
      
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
      throw error
    }
  }
  
  // 获取当前用户信息
  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/users/me')
      if (!response.ok) {
        throw new Error('获取用户信息失败')
      }
      
      const data = await response.json()
      currentUser.value = data
      return data
    } catch (error) {
      console.error('Fetch user failed:', error)
      throw error
    }
  }
  
  // 更新用户信息
  const updateProfile = async (updates: Partial<User>) => {
    try {
      const response = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })
      
      if (!response.ok) {
        throw new Error('更新用户信息失败')
      }
      
      const data = await response.json()
      currentUser.value = data
      
      notificationStore.addNotification({
        title: '更新成功',
        description: '您的个人信息已更新',
        type: 'system'
      })
      
      return data
    } catch (error) {
      console.error('Update profile failed:', error)
      throw error
    }
  }
  
  return {
    currentUser,
    isLoggedIn,
    isAdmin,
    login,
    logout,
    fetchCurrentUser,
    updateProfile
  }
}) 