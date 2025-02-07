<template>
  <div class="login-page">
    <div class="login-container">
      <div class="header">
        <h1>欢迎回来</h1>
        <p>请登录您的账号以继续</p>
      </div>

      <form class="login-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="email">邮箱</label>
          <div class="input-wrapper">
            <i class="icon-mail"></i>
            <input
              id="email"
              v-model="form.email"
              type="email"
              placeholder="请输入邮箱"
              :class="{ error: errors.email }"
              @input="validateEmail"
            >
          </div>
          <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label for="password">密码</label>
          <div class="input-wrapper">
            <i class="icon-lock"></i>
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入密码"
              :class="{ error: errors.password }"
              @input="validatePassword"
            >
            <button 
              type="button"
              class="toggle-password"
              @click="showPassword = !showPassword"
            >
              <i :class="showPassword ? 'icon-eye-off' : 'icon-eye'"></i>
            </button>
          </div>
          <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
        </div>

        <div class="form-options">
          <label class="remember-me">
            <input
              v-model="form.rememberMe"
              type="checkbox"
            >
            <span>记住我</span>
          </label>
          <router-link to="/forgot-password" class="forgot-password">
            忘记密码？
          </router-link>
        </div>

        <button 
          type="submit" 
          class="submit-btn"
          :disabled="isSubmitting || !isFormValid"
        >
          <span v-if="!isSubmitting">登录</span>
          <i v-else class="icon-spinner animate-spin"></i>
        </button>
      </form>

      <div class="divider">
        <span>或</span>
      </div>

      <div class="social-login">
        <button class="social-btn github" @click="handleGithubLogin">
          <i class="icon-github"></i>
          使用GitHub登录
        </button>
        <button class="social-btn google" @click="handleGoogleLogin">
          <i class="icon-google"></i>
          使用Google登录
        </button>
      </div>

      <div class="register-link">
        还没有账号？
        <router-link to="/register">立即注册</router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useNotificationStore } from '@/stores/notification'

const router = useRouter()
const userStore = useUserStore()
const notificationStore = useNotificationStore()

// 表单数据
const form = ref({
  email: '',
  password: '',
  rememberMe: false
})

// 错误信息
const errors = ref({
  email: '',
  password: ''
})

// 表单状态
const isSubmitting = ref(false)
const showPassword = ref(false)

// 表单验证
const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!form.value.email) {
    errors.value.email = '请输入邮箱'
  } else if (!emailRegex.test(form.value.email)) {
    errors.value.email = '请输入有效的邮箱地址'
  } else {
    errors.value.email = ''
  }
}

const validatePassword = () => {
  if (!form.value.password) {
    errors.value.password = '请输入密码'
  } else if (form.value.password.length < 6) {
    errors.value.password = '密码长度不能小于6位'
  } else {
    errors.value.password = ''
  }
}

// 表单是否有效
const isFormValid = computed(() => {
  return form.value.email && 
         form.value.password && 
         !errors.value.email && 
         !errors.value.password
})

// 提交表单
const handleSubmit = async () => {
  if (!isFormValid.value || isSubmitting.value) return

  try {
    isSubmitting.value = true
    await userStore.login(form.value.email, form.value.password)
    router.push('/')
  } catch (error: any) {
    notificationStore.addNotification({
      title: '登录失败',
      description: error.message || '请检查您的邮箱和密码',
      type: 'warning'
    })
  } finally {
    isSubmitting.value = false
  }
}

// 社交登录
const handleGithubLogin = () => {
  // TODO: 实现GitHub登录
  window.location.href = '/api/auth/github'
}

const handleGoogleLogin = () => {
  // TODO: 实现Google登录
  window.location.href = '/api/auth/google'
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background-color: var(--color-bg-secondary);
}

.login-container {
  width: 100%;
  max-width: 400px;
  padding: 32px;
  background-color: var(--color-bg-primary);
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
}

.header {
  text-align: center;
  margin-bottom: 32px;

  h1 {
    font-size: 24px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 8px;
  }

  p {
    font-size: 14px;
    color: var(--color-text-secondary);
  }
}

.login-form {
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 20px;

  label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text-primary);
    margin-bottom: 8px;
  }
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;

  i {
    position: absolute;
    left: 12px;
    color: var(--color-text-placeholder);
    font-size: 16px;
  }

  input {
    width: 100%;
    height: 40px;
    padding: 0 40px;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    background-color: var(--color-bg-primary);
    color: var(--color-text-primary);
    transition: all 0.3s ease;

    &::placeholder {
      color: var(--color-text-placeholder);
    }

    &:focus {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 2px var(--color-primary-light);
    }

    &.error {
      border-color: var(--color-danger);
    }
  }
}

.toggle-password {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: var(--color-text-placeholder);
  cursor: pointer;
  padding: 0;

  &:hover {
    color: var(--color-text-secondary);
  }
}

.error-message {
  display: block;
  font-size: 12px;
  color: var(--color-danger);
  margin-top: 4px;
}

.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.remember-me {
  display: flex;
  align-items: center;
  cursor: pointer;

  input {
    margin-right: 8px;
  }

  span {
    font-size: 14px;
    color: var(--color-text-secondary);
  }
}

.forgot-password {
  font-size: 14px;
  color: var(--color-primary);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

.submit-btn {
  width: 100%;
  height: 40px;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background-color: var(--color-primary-dark);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.divider {
  position: relative;
  text-align: center;
  margin: 24px 0;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    width: calc(50% - 24px);
    height: 1px;
    background-color: var(--color-border);
  }

  &::before {
    left: 0;
  }

  &::after {
    right: 0;
  }

  span {
    background-color: var(--color-bg-primary);
    padding: 0 12px;
    color: var(--color-text-secondary);
    font-size: 14px;
  }
}

.social-login {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  padding: 0 16px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  i {
    margin-right: 8px;
    font-size: 16px;
  }

  &:hover {
    background-color: var(--color-bg-hover);
  }

  &.github {
    background-color: #24292e;
    color: white;
    border: none;

    &:hover {
      background-color: #1b1f23;
    }
  }

  &.google {
    background-color: white;
    color: #757575;
    border-color: #dbdbdb;

    &:hover {
      background-color: #f8f8f8;
    }
  }
}

.register-link {
  text-align: center;
  font-size: 14px;
  color: var(--color-text-secondary);

  a {
    color: var(--color-primary);
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style> 
</style> 