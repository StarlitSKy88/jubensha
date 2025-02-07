<template>
  <div class="settings-page">
    <div class="settings-header">
      <h1>设置</h1>
      <p>自定义您的使用偏好</p>
    </div>

    <div class="settings-content">
      <!-- 主题设置 -->
      <section class="settings-section">
        <h2>主题设置</h2>
        <div class="setting-item">
          <div class="setting-info">
            <h3>主题模式</h3>
            <p>选择您偏好的主题模式</p>
          </div>
          <div class="theme-options">
            <button
              v-for="theme in themes"
              :key="theme.value"
              class="theme-btn"
              :class="{ active: currentTheme === theme.value }"
              @click="setTheme(theme.value)"
            >
              <i :class="theme.icon"></i>
              {{ theme.label }}
            </button>
          </div>
        </div>
      </section>

      <!-- 通知设置 -->
      <section class="settings-section">
        <h2>通知设置</h2>
        <div class="setting-item">
          <div class="setting-info">
            <h3>桌面通知</h3>
            <p>接收重要更新的桌面通知</p>
          </div>
          <div class="toggle-switch">
            <input
              type="checkbox"
              id="desktop-notifications"
              v-model="settings.desktopNotifications"
              @change="updateSettings"
            >
            <label for="desktop-notifications"></label>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <h3>邮件通知</h3>
            <p>接收重要更新的邮件通知</p>
          </div>
          <div class="toggle-switch">
            <input
              type="checkbox"
              id="email-notifications"
              v-model="settings.emailNotifications"
              @change="updateSettings"
            >
            <label for="email-notifications"></label>
          </div>
        </div>
      </section>

      <!-- 编辑器设置 -->
      <section class="settings-section">
        <h2>编辑器设置</h2>
        <div class="setting-item">
          <div class="setting-info">
            <h3>自动保存</h3>
            <p>自动保存编辑内容的时间间隔</p>
          </div>
          <div class="select-wrapper">
            <select 
              v-model="settings.autoSaveInterval"
              @change="updateSettings"
            >
              <option value="0">关闭</option>
              <option value="30">30秒</option>
              <option value="60">1分钟</option>
              <option value="300">5分钟</option>
            </select>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <h3>字体大小</h3>
            <p>调整编辑器字体大小</p>
          </div>
          <div class="font-size-control">
            <button 
              class="size-btn"
              @click="decreaseFontSize"
              :disabled="settings.fontSize <= 12"
            >
              <i class="icon-minus"></i>
            </button>
            <span class="font-size-value">{{ settings.fontSize }}px</span>
            <button 
              class="size-btn"
              @click="increaseFontSize"
              :disabled="settings.fontSize >= 24"
            >
              <i class="icon-plus"></i>
            </button>
          </div>
        </div>
      </section>

      <!-- 隐私设置 -->
      <section class="settings-section">
        <h2>隐私设置</h2>
        <div class="setting-item">
          <div class="setting-info">
            <h3>公开个人资料</h3>
            <p>允许其他用户查看您的个人资料</p>
          </div>
          <div class="toggle-switch">
            <input
              type="checkbox"
              id="public-profile"
              v-model="settings.publicProfile"
              @change="updateSettings"
            >
            <label for="public-profile"></label>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <h3>活动状态</h3>
            <p>显示您的在线状态</p>
          </div>
          <div class="toggle-switch">
            <input
              type="checkbox"
              id="show-status"
              v-model="settings.showStatus"
              @change="updateSettings"
            >
            <label for="show-status"></label>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notification'

interface Settings {
  theme: string
  desktopNotifications: boolean
  emailNotifications: boolean
  autoSaveInterval: number
  fontSize: number
  publicProfile: boolean
  showStatus: boolean
}

const notificationStore = useNotificationStore()

const themes = [
  { value: 'light', label: '浅色', icon: 'icon-sun' },
  { value: 'dark', label: '深色', icon: 'icon-moon' },
  { value: 'system', label: '跟随系统', icon: 'icon-monitor' }
]

const currentTheme = ref('system')
const settings = ref<Settings>({
  theme: 'system',
  desktopNotifications: true,
  emailNotifications: true,
  autoSaveInterval: 60,
  fontSize: 16,
  publicProfile: true,
  showStatus: true
})

// 初始化设置
onMounted(async () => {
  try {
    const response = await fetch('/api/users/me/settings')
    if (response.ok) {
      const data = await response.json()
      settings.value = { ...settings.value, ...data }
      currentTheme.value = data.theme || 'system'
    }
  } catch (error) {
    console.error('Failed to load settings:', error)
  }
})

// 设置主题
const setTheme = async (theme: string) => {
  try {
    currentTheme.value = theme
    settings.value.theme = theme
    
    // 应用主题
    document.documentElement.setAttribute('data-theme', theme)
    
    // 保存设置
    await updateSettings()
    
    notificationStore.addNotification({
      title: '主题已更新',
      description: '主题设置已保存',
      type: 'success'
    })
  } catch (error) {
    notificationStore.addNotification({
      title: '更新失败',
      description: '主题设置保存失败',
      type: 'error'
    })
  }
}

// 更新设置
const updateSettings = async () => {
  try {
    const response = await fetch('/api/users/me/settings', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(settings.value)
    })

    if (!response.ok) {
      throw new Error('Failed to update settings')
    }

    notificationStore.addNotification({
      title: '设置已更新',
      description: '您的设置已成功保存',
      type: 'success'
    })
  } catch (error) {
    notificationStore.addNotification({
      title: '更新失败',
      description: '设置保存失败，请稍后重试',
      type: 'error'
    })
  }
}

// 调整字体大小
const increaseFontSize = () => {
  if (settings.value.fontSize < 24) {
    settings.value.fontSize += 2
    updateSettings()
  }
}

const decreaseFontSize = () => {
  if (settings.value.fontSize > 12) {
    settings.value.fontSize -= 2
    updateSettings()
  }
}
</script>

<style lang="scss" scoped>
.settings-page {
  padding: 32px;
  max-width: 800px;
  margin: 0 auto;
}

.settings-header {
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

.settings-content {
  background-color: var(--color-bg-secondary);
  border-radius: 12px;
  padding: 32px;
}

.settings-section {
  &:not(:last-child) {
    margin-bottom: 32px;
    padding-bottom: 32px;
    border-bottom: 1px solid var(--color-border);
  }

  h2 {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 24px;
  }
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
}

.setting-info {
  flex: 1;
  margin-right: 24px;

  h3 {
    font-size: 16px;
    font-weight: 500;
    color: var(--color-text-primary);
    margin-bottom: 4px;
  }

  p {
    font-size: 14px;
    color: var(--color-text-secondary);
  }
}

.theme-options {
  display: flex;
  gap: 12px;
}

.theme-btn {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;

  i {
    margin-right: 8px;
    font-size: 16px;
  }

  &:hover {
    background-color: var(--color-bg-hover);
  }

  &.active {
    background-color: var(--color-primary);
    border-color: var(--color-primary);
    color: white;
  }
}

.toggle-switch {
  position: relative;
  width: 44px;
  height: 24px;

  input {
    opacity: 0;
    width: 0;
    height: 0;

    &:checked + label {
      background-color: var(--color-primary);

      &::after {
        transform: translateX(20px);
      }
    }

    &:disabled + label {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  label {
    position: absolute;
    top: 0;
    left: 0;
    width: 44px;
    height: 24px;
    background-color: var(--color-border);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;

    &::after {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      width: 20px;
      height: 20px;
      background-color: white;
      border-radius: 50%;
      transition: transform 0.3s ease;
    }
  }
}

.select-wrapper {
  position: relative;
  width: 120px;

  select {
    width: 100%;
    height: 40px;
    padding: 0 12px;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    background-color: var(--color-bg-primary);
    color: var(--color-text-primary);
    font-size: 14px;
    cursor: pointer;
    appearance: none;

    &:focus {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 2px var(--color-primary-light);
    }
  }

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    right: 12px;
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid var(--color-text-secondary);
    transform: translateY(-50%);
    pointer-events: none;
  }
}

.font-size-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.size-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background-color: var(--color-bg-hover);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  i {
    font-size: 16px;
  }
}

.font-size-value {
  min-width: 48px;
  text-align: center;
  font-size: 14px;
  color: var(--color-text-primary);
}
</style> 