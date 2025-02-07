<template>
  <div class="theme-switch">
    <button
      class="theme-btn"
      :class="{ active: currentTheme === theme.value }"
      v-for="theme in themes"
      :key="theme.value"
      @click="switchTheme(theme.value)"
      :title="theme.label"
    >
      <i :class="theme.icon"></i>
    </button>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
const currentTheme = ref(themeStore.theme)

const themes = [
  { value: 'light', label: '浅色模式', icon: 'icon-sun' },
  { value: 'dark', label: '深色模式', icon: 'icon-moon' },
  { value: 'system', label: '跟随系统', icon: 'icon-computer' }
]

const switchTheme = (theme: string) => {
  currentTheme.value = theme
  themeStore.setTheme(theme)
}

// 监听系统主题变化
const watchSystemTheme = () => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handleChange = (e: MediaQueryListEvent) => {
    if (currentTheme.value === 'system') {
      document.documentElement.setAttribute(
        'data-theme',
        e.matches ? 'dark' : 'light'
      )
    }
  }
  mediaQuery.addEventListener('change', handleChange)
  return () => mediaQuery.removeEventListener('change', handleChange)
}

// 应用主题
const applyTheme = (theme: string) => {
  if (theme === 'system') {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
  } else {
    document.documentElement.setAttribute('data-theme', theme)
  }
}

// 监听主题变化
watch(currentTheme, (newTheme) => {
  applyTheme(newTheme)
})

onMounted(() => {
  // 初始化主题
  applyTheme(currentTheme.value)
  // 监听系统主题变化
  const cleanup = watchSystemTheme()
  // 组件卸载时清理监听器
  onUnmounted(cleanup)
})
</script>

<style lang="scss" scoped>
.theme-switch {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px;
  background-color: var(--color-bg-secondary);
  border-radius: 8px;
}

.theme-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    color: var(--color-primary);
    background-color: var(--color-bg-hover);
  }

  &.active {
    color: var(--color-primary);
    background-color: var(--color-primary-light);
  }

  i {
    font-size: 20px;
  }
}
</style> 