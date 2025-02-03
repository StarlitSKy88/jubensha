import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from './auth.guard'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/auth/RegisterView.vue')
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('@/views/auth/ForgotPasswordView.vue')
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('@/views/auth/ResetPasswordView.vue')
    },
    {
      path: '/verify-email',
      name: 'verify-email',
      component: () => import('@/views/auth/VerifyEmailView.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: {
        requiresAuth: true,
        requiresVerification: true
      }
    },
    {
      path: '/scripts',
      name: 'scripts',
      component: () => import('@/views/script/ScriptListView.vue'),
      meta: {
        requiresAuth: true,
        requiresVerification: true
      }
    },
    {
      path: '/scripts/new',
      name: 'new-script',
      component: () => import('@/views/script/ScriptEditorView.vue'),
      meta: {
        requiresAuth: true,
        requiresVerification: true,
        permissions: ['create_script']
      }
    },
    {
      path: '/scripts/:id',
      name: 'script-detail',
      component: () => import('@/views/script/ScriptDetailView.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/scripts/:id/edit',
      name: 'edit-script',
      component: () => import('@/views/script/ScriptEditorView.vue'),
      meta: {
        requiresAuth: true,
        requiresVerification: true,
        permissions: ['edit_script']
      }
    },
    {
      path: '/scripts/:id/timeline',
      name: 'script-timeline',
      component: () => import('@/views/script/timeline/TimelineView.vue'),
      meta: {
        requiresAuth: true,
        requiresVerification: true
      }
    },
    {
      path: '/scripts/:id/timeline/create',
      name: 'create-timeline-event',
      component: () => import('@/views/script/timeline/TimelineEventEditorView.vue'),
      meta: {
        requiresAuth: true,
        requiresVerification: true,
        permissions: ['edit_script']
      }
    },
    {
      path: '/scripts/:id/timeline/:eventId/edit',
      name: 'edit-timeline-event',
      component: () => import('@/views/script/timeline/TimelineEventEditorView.vue'),
      meta: {
        requiresAuth: true,
        requiresVerification: true,
        permissions: ['edit_script']
      }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/profile/ProfileView.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/profile/SettingsView.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/403',
      name: '403',
      component: () => import('@/views/error/403View.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      name: '404',
      component: () => import('@/views/error/404View.vue')
    }
  ]
})

// 添加全局前置守卫
router.beforeEach(authGuard)

export default router 