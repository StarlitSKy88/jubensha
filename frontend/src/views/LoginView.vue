<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <h2 class="login-title">登录</h2>
      </template>
      
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @submit.prevent="handleSubmit"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            :prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            native-type="submit"
            :loading="loading"
            class="submit-btn"
          >
            登录
          </el-button>
        </el-form-item>
        
        <div class="form-footer">
          <router-link to="/register">注册账号</router-link>
          <router-link to="/forgot-password">忘记密码？</router-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const formRef = ref<FormInstance>()
const loading = ref(false)
const form = ref({
  username: '',
  password: ''
})

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名至少3个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6个字符', trigger: 'blur' }
  ]
}

async function handleSubmit() {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    const success = await authStore.login(form.value.username, form.value.password)
    
    if (success) {
      ElMessage.success('登录成功')
      // 如果有重定向地址，跳转到重定向地址
      const redirect = route.query.redirect as string
      router.push(redirect || '/')
    } else {
      ElMessage.error('用户名或密码错误')
    }
  } catch (error) {
    console.error('Login error:', error)
    ElMessage.error('登录失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.login-card {
  width: 100%;
  max-width: 400px;
  
  .login-title {
    margin: 0;
    text-align: center;
    font-size: 24px;
    color: #303133;
  }
}

.submit-btn {
  width: 100%;
  margin-top: 20px;
}

.form-footer {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  
  a {
    color: #409eff;
    text-decoration: none;
    font-size: 14px;
    
    &:hover {
      color: #66b1ff;
    }
  }
}
</style> 