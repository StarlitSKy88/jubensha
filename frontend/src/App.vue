<template>
  <div id="app">
    <nav v-if="isAuthenticated" class="main-nav">
      <router-link to="/dashboard">仪表盘</router-link>
      <router-link to="/scripts">剧本</router-link>
      <router-link to="/profile">个人中心</router-link>
      <router-link to="/settings">设置</router-link>
      <button @click="handleLogout">登出</button>
    </nav>
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

const router = useRouter()
const authStore = useAuthStore()
const { isAuthenticated } = storeToRefs(authStore)

// 初始化认证状态
onMounted(async () => {
  await authStore.init()
})

// 处理登出
const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('登出失败：', error)
  }
}
</script>

<style>
:root {
  --color-primary: #4a90e2;
  --color-primary-dark: #357abd;
  --color-text: #2c3e50;
  --color-text-light: #666666;
  --color-heading: #1a1a1a;
  --color-border: #e0e0e0;
  --color-background: #ffffff;
  --color-disabled: #cccccc;
}

#app {
  font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--color-text);
  background-color: var(--color-background);
  min-height: 100vh;
}

.main-nav {
  padding: 1rem;
  background-color: var(--color-background);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.main-nav a {
  color: var(--color-text);
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.2s;
}

.main-nav a:hover,
.main-nav a.router-link-active {
  color: var(--color-primary);
  background-color: rgba(74, 144, 226, 0.1);
}

.main-nav button {
  background: none;
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.main-nav button:hover {
  background-color: var(--color-primary);
  color: white;
}
</style> 