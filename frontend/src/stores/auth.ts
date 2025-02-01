import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<any>(null)
  
  const isAuthenticated = computed(() => !!token.value)
  
  async function login(username: string, password: string) {
    try {
      const response = await axios.post('/api/v1/auth/login', {
        username,
        password
      })
      
      token.value = response.data.access_token
      localStorage.setItem('token', token.value)
      
      // 获取用户信息
      await fetchUserInfo()
      
      return true
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }
  
  async function register(data: {
    username: string
    email: string
    password: string
  }) {
    try {
      const response = await axios.post('/api/v1/auth/register', data)
      return response.data
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    }
  }
  
  async function logout() {
    try {
      await axios.post('/api/v1/auth/logout')
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      token.value = null
      user.value = null
      localStorage.removeItem('token')
    }
  }
  
  async function fetchUserInfo() {
    try {
      const response = await axios.get('/api/v1/profiles/me/profile')
      user.value = response.data
    } catch (error) {
      console.error('Failed to fetch user info:', error)
      throw error
    }
  }
  
  // 设置axios默认headers
  watch(token, (newToken) => {
    if (newToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  }, { immediate: true })
  
  return {
    token,
    user,
    isAuthenticated,
    login,
    register,
    logout,
    fetchUserInfo
  }
}) 