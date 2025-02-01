# 注册表单组件

<template>
  <div class="register-form">
    <h2>注册</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="username">用户名</label>
        <input
          id="username"
          v-model="form.username"
          type="text"
          required
          placeholder="请输入用户名"
        >
      </div>
      <div class="form-group">
        <label for="email">邮箱</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          required
          placeholder="请输入邮箱"
        >
      </div>
      <div class="form-group">
        <label for="password">密码</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          required
          placeholder="请输入密码"
        >
        <p class="password-hint">密码至少包含8个字符，需包含大小写字母、数字和特殊符号</p>
      </div>
      <div class="form-group">
        <label for="role">角色</label>
        <select id="role" v-model="form.role" required>
          <option value="writer">剧本作家</option>
          <option value="player">玩家</option>
        </select>
      </div>
      <div class="form-actions">
        <button type="submit" :disabled="loading || !isFormValid">
          {{ loading ? '注册中...' : '注册' }}
        </button>
      </div>
      <div class="form-footer">
        <p>已有账号？<router-link to="/login">立即登录</router-link></p>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { RegisterParams } from '@/services/auth/auth.service'
import { AuthService } from '@/services/auth/auth.service'

const router = useRouter()
const authService = new AuthService()

const form = ref<RegisterParams>({
  username: '',
  email: '',
  password: '',
  role: 'player'
})

const loading = ref(false)
const error = ref<string | null>(null)

// 密码验证规则
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

// 表单验证
const isFormValid = computed(() => {
  return (
    form.value.username.length >= 3 &&
    form.value.email.includes('@') &&
    passwordRegex.test(form.value.password)
  )
})

const handleSubmit = async () => {
  if (!isFormValid.value) {
    return
  }

  loading.value = true
  error.value = null

  try {
    await authService.register(form.value)
    // 注册成功后自动登录
    await authService.login({
      email: form.value.email,
      password: form.value.password
    })
    router.push('/dashboard')
  } catch (e) {
    error.value = e instanceof Error ? e.message : '注册失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: var(--color-heading);
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

input,
select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

input:focus,
select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.password-hint {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-text-light);
}

.form-actions {
  margin-top: 1.5rem;
}

button {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover {
  background-color: var(--color-primary-dark);
}

button:disabled {
  background-color: var(--color-disabled);
  cursor: not-allowed;
}

.form-footer {
  margin-top: 2rem;
  text-align: center;
}

a {
  color: var(--color-primary);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style> 