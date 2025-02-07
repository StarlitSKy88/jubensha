<template>
  <div class="app-layout">
    <!-- 侧边栏 -->
    <aside class="sidebar" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
      <div class="sidebar-header">
        <img src="@/assets/logo.svg" alt="Logo" class="logo" />
        <h1 v-if="!isSidebarCollapsed">剧本杀创作助手</h1>
      </div>
      <nav class="sidebar-nav">
        <router-link 
          v-for="item in menuItems" 
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: currentPath === item.path }"
        >
          <i :class="item.icon"></i>
          <span v-if="!isSidebarCollapsed">{{ item.title }}</span>
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <button @click="toggleSidebar" class="collapse-btn">
          <i :class="isSidebarCollapsed ? 'icon-expand' : 'icon-collapse'"></i>
        </button>
      </div>
    </aside>

    <!-- 主内容区 -->
    <div class="main-container">
      <!-- 顶部导航 -->
      <header class="header">
        <div class="header-left">
          <breadcrumb :items="breadcrumbItems" />
        </div>
        <div class="header-right">
          <theme-switch />
          <notification-bell />
          <user-dropdown />
        </div>
      </header>

      <!-- 内容区 -->
      <main class="content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import Breadcrumb from './Breadcrumb.vue'
import ThemeSwitch from './ThemeSwitch.vue'
import NotificationBell from './NotificationBell.vue'
import UserDropdown from './UserDropdown.vue'

// 侧边栏状态
const isSidebarCollapsed = ref(false)
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

// 路由相关
const route = useRoute()
const currentPath = computed(() => route.path)

// 菜单项配置
const menuItems = [
  { path: '/dashboard', title: '仪表盘', icon: 'icon-dashboard' },
  { path: '/projects', title: '项目管理', icon: 'icon-projects' },
  { path: '/scripts', title: '剧本编辑', icon: 'icon-scripts' },
  { path: '/characters', title: '角色管理', icon: 'icon-characters' },
  { path: '/timeline', title: '时间线', icon: 'icon-timeline' },
  { path: '/clues', title: '线索管理', icon: 'icon-clues' },
  { path: '/ai-chat', title: 'AI助手', icon: 'icon-ai' },
  { path: '/settings', title: '设置', icon: 'icon-settings' }
]

// 面包屑导航
const breadcrumbItems = computed(() => {
  return route.matched.map(item => ({
    title: item.meta.title || '',
    path: item.path
  }))
})
</script>

<style lang="scss" scoped>
.app-layout {
  display: flex;
  height: 100vh;
  background-color: var(--color-bg-base);
}

.sidebar {
  width: 240px;
  height: 100%;
  background-color: var(--color-bg-sidebar);
  transition: width 0.3s ease;
  display: flex;
  flex-direction: column;

  &.sidebar-collapsed {
    width: 64px;
  }
}

.sidebar-header {
  height: 64px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid var(--color-border);

  .logo {
    width: 32px;
    height: 32px;
  }

  h1 {
    font-size: 18px;
    color: var(--color-text-primary);
    margin: 0;
    white-space: nowrap;
  }
}

.sidebar-nav {
  flex: 1;
  padding: 16px 0;
  overflow-y: auto;

  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    color: var(--color-text-secondary);
    text-decoration: none;
    transition: all 0.3s ease;

    &:hover {
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
}

.sidebar-footer {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid var(--color-border);

  .collapse-btn {
    width: 32px;
    height: 32px;
    border: none;
    background: none;
    cursor: pointer;
    color: var(--color-text-secondary);

    &:hover {
      color: var(--color-primary);
    }
  }
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  height: 64px;
  padding: 0 24px;
  background-color: var(--color-bg-header);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

// 路由过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 