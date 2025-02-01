import type { NavigationGuard } from 'vue-router'
import { AuthService } from '@/services/auth/auth.service'

const authService = new AuthService()

export const authGuard: NavigationGuard = async (to, from, next) => {
  // 初始化认证状态
  await authService.init()

  // 检查路由是否需要认证
  if (to.meta.requiresAuth) {
    // 检查用户是否已登录
    if (!authService.isAuthenticated()) {
      // 未登录，重定向到登录页
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
      return
    }

    // 检查是否需要特定权限
    if (to.meta.permissions) {
      const permissions = to.meta.permissions as string[]
      const hasPermission = permissions.every(permission =>
        authService.hasPermission(permission)
      )

      if (!hasPermission) {
        // 没有权限，重定向到 403 页面
        next({ name: '403' })
        return
      }
    }

    // 检查是否需要邮箱验证
    if (to.meta.requiresVerification && !authService.getCurrentUser()?.isVerified) {
      // 未验证邮箱，重定向到验证页面
      next({ name: 'verify-email' })
      return
    }
  }

  // 已登录用户访问登录/注册页面时重定向到首页
  if (authService.isAuthenticated() && (to.name === 'login' || to.name === 'register')) {
    next({ name: 'dashboard' })
    return
  }

  // 允许访问
  next()
}

// 路由元数据类型
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    permissions?: string[]
    requiresVerification?: boolean
  }
} 