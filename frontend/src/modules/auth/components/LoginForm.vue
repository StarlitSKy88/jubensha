<template>
  <div class="login-form">
    <h2>登录</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="email">邮箱</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          required
          :class="{ 'error': errors.email }"
          @input="clearError('email')"
        >
        <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
      </div>

      <div class="form-group">
        <label for="password">密码</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          required
          :class="{ 'error': errors.password }"
          @input="clearError('password')"
        >
        <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
      </div>

      <div class="form-actions">
        <button type="submit" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
        <router-link to="/auth/register">没有账号？立即注册</router-link>
      </div>

      <div v-if="error" class="alert error">
        {{ error }}
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth.store';

interface LoginForm {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

export default defineComponent({
  name: 'LoginForm',
  
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    
    const form = reactive<LoginForm>({
      email: '',
      password: ''
    });
    
    const errors = reactive<FormErrors>({});
    const error = ref<string>('');
    const loading = ref(false);

    const validateForm = (): boolean => {
      let isValid = true;
      errors.email = '';
      errors.password = '';

      if (!form.email) {
        errors.email = '请输入邮箱';
        isValid = false;
      } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(form.email)) {
        errors.email = '请输入有效的邮箱地址';
        isValid = false;
      }

      if (!form.password) {
        errors.password = '请输入密码';
        isValid = false;
      } else if (form.password.length < 6) {
        errors.password = '密码至少需要6个字符';
        isValid = false;
      }

      return isValid;
    };

    const clearError = (field: keyof FormErrors) => {
      errors[field] = '';
      error.value = '';
    };

    const handleSubmit = async () => {
      if (!validateForm()) return;
      
      loading.value = true;
      error.value = '';

      try {
        await authStore.login(form);
        router.push('/dashboard');
      } catch (err) {
        error.value = err instanceof Error ? err.message : '登录失败，请重试';
      } finally {
        loading.value = false;
      }
    };

    return {
      form,
      errors,
      error,
      loading,
      handleSubmit,
      clearError
    };
  }
});
</script>

<style scoped>
.login-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

input.error {
  border-color: #dc3545;
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
}

button {
  padding: 0.5rem 1.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

a {
  color: #007bff;
  text-decoration: none;
}

.alert {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 4px;
}

.alert.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
</style> 