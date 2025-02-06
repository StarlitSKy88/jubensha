import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AuthService, type User, type LoginParams, type RegisterParams } from '../../src/services/auth/auth.service'

describe('AuthService', () => {
  let authService: AuthService
  let mockFetch: ReturnType<typeof vi.fn>

  beforeEach(() => {
    // 清除 localStorage
    localStorage.clear()

    // 模拟 fetch
    mockFetch = vi.fn()
    global.fetch = mockFetch as unknown as typeof global.fetch

    // 创建服务实例
    authService = new AuthService()
  })

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockUser: User = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'writer',
        createdAt: new Date(),
        lastLoginAt: new Date(),
        isVerified: false,
        settings: {
          theme: 'light',
          language: 'zh-CN',
          notifications: true
        }
      }

      const registerParams: RegisterParams = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
        role: 'writer'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser })
      } as Response)

      const result = await authService.register(registerParams)
      expect(result).toEqual(mockUser)
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registerParams)
      })
    })

    it('should throw error when registration fails', async () => {
      const registerParams: RegisterParams = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
        role: 'writer'
      }

      mockFetch.mockResolvedValueOnce({
        ok: false
      } as Response)

      await expect(authService.register(registerParams)).rejects.toThrow('注册失败')
    })
  })

  describe('login', () => {
    it('should login user successfully', async () => {
      const mockUser: User = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'writer',
        createdAt: new Date(),
        lastLoginAt: new Date(),
        isVerified: false,
        settings: {
          theme: 'light',
          language: 'zh-CN',
          notifications: true
        }
      }

      const loginParams: LoginParams = {
        email: 'test@example.com',
        password: 'Password123!'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser, token: 'mock-token' })
      } as Response)

      await authService.login(loginParams)
      expect(localStorage.getItem('token')).toBe('mock-token')
      expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser))
      expect(authService.getCurrentUser()).toEqual(mockUser)
    })

    it('should throw error when login fails', async () => {
      const loginParams: LoginParams = {
        email: 'test@example.com',
        password: 'wrong-password'
      }

      mockFetch.mockResolvedValueOnce({
        ok: false
      } as Response)

      await expect(authService.login(loginParams)).rejects.toThrow('登录失败')
    })
  })

  describe('logout', () => {
    it('should logout user successfully', async () => {
      // 先设置用户状态
      localStorage.setItem('token', 'mock-token')
      localStorage.setItem('user', JSON.stringify({ id: '1' }))

      mockFetch.mockResolvedValueOnce({
        ok: true
      } as Response)

      await authService.logout()
      expect(localStorage.getItem('token')).toBeNull()
      expect(localStorage.getItem('user')).toBeNull()
      expect(authService.getCurrentUser()).toBeNull()
    })
  })

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      const mockUser: User = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'writer',
        createdAt: new Date(),
        lastLoginAt: new Date(),
        isVerified: false,
        settings: {
          theme: 'light',
          language: 'zh-CN',
          notifications: true
        }
      }

      const updates = {
        username: 'newname'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: { ...mockUser, ...updates } })
      } as Response)

      const result = await authService.updateProfile(updates)
      expect(result).toEqual({ ...mockUser, ...updates })
    })

    it('should throw error when update fails', async () => {
      const updates = {
        username: 'newname'
      }

      mockFetch.mockResolvedValueOnce({
        ok: false
      } as Response)

      await expect(authService.updateProfile(updates)).rejects.toThrow('更新失败')
    })
  })

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      const mockToken = 'verification-token'

      mockFetch.mockResolvedValueOnce({
        ok: true
      } as Response)

      await authService.verifyEmail(mockToken)
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: mockToken })
      })
    })

    it('should throw error when verification fails', async () => {
      const mockToken = 'invalid-token'

      mockFetch.mockResolvedValueOnce({
        ok: false
      } as Response)

      await expect(authService.verifyEmail(mockToken)).rejects.toThrow('邮箱验证失败')
    })
  })

  describe('hasPermission', () => {
    it('should return true for admin role', () => {
      const mockUser: User = {
        id: '1',
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin',
        createdAt: new Date(),
        lastLoginAt: new Date(),
        isVerified: true,
        settings: {
          theme: 'light',
          language: 'zh-CN',
          notifications: true
        }
      }

      // 设置当前用户
      vi.spyOn(authService as any, 'getCurrentUser').mockReturnValue(mockUser)

      expect(authService.hasPermission('any_permission')).toBe(true)
    })

    it('should check writer permissions correctly', () => {
      const mockUser: User = {
        id: '1',
        username: 'writer',
        email: 'writer@example.com',
        role: 'writer',
        createdAt: new Date(),
        lastLoginAt: new Date(),
        isVerified: true,
        settings: {
          theme: 'light',
          language: 'zh-CN',
          notifications: true
        }
      }

      // 设置当前用户
      vi.spyOn(authService as any, 'getCurrentUser').mockReturnValue(mockUser)

      expect(authService.hasPermission('create_script')).toBe(true)
      expect(authService.hasPermission('admin_action')).toBe(false)
    })
  })
}) 