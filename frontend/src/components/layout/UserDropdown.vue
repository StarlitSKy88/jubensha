<template>
  <div class="user-dropdown" v-click-outside="closeDropdown">
    <button class="user-btn" @click="toggleDropdown">
      <img 
        v-if="user?.avatar" 
        :src="user.avatar" 
        :alt="user?.name" 
        class="avatar"
      >
      <div v-else class="avatar-placeholder">
        {{ user?.name?.[0]?.toUpperCase() }}
      </div>
      <span class="username">{{ user?.name }}</span>
      <i class="icon-chevron-down" :class="{ 'is-active': showDropdown }"></i>
    </button>

    <div v-if="showDropdown" class="dropdown-menu">
      <div class="user-info">
        <img 
          v-if="user?.avatar" 
          :src="user.avatar" 
          :alt="user?.name" 
          class="avatar"
        >
        <div v-else class="avatar-placeholder large">
          {{ user?.name?.[0]?.toUpperCase() }}
        </div>
        <div class="info">
          <div class="name">{{ user?.name }}</div>
          <div class="email">{{ user?.email }}</div>
        </div>
      </div>

      <div class="menu-items">
        <router-link to="/profile" class="menu-item" @click="closeDropdown">
          <i class="icon-user"></i>
          个人信息
        </router-link>
        <router-link to="/settings" class="menu-item" @click="closeDropdown">
          <i class="icon-settings"></i>
          设置
        </router-link>
        <button class="menu-item" @click="handleLogout">
          <i class="icon-logout"></i>
          退出登录
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { vClickOutside } from '@/directives/click-outside'

const router = useRouter()
const userStore = useUserStore()
const showDropdown = ref(false)

const user = computed(() => userStore.currentUser)

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const closeDropdown = () => {
  showDropdown.value = false
}

const handleLogout = async () => {
  try {
    await userStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
  }
  closeDropdown()
}
</script>

<style lang="scss" scoped>
.user-dropdown {
  position: relative;
}

.user-btn {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  border: none;
  border-radius: 6px;
  background: none;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: var(--color-bg-hover);
  }
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 16px;
  object-fit: cover;

  &.large {
    width: 48px;
    height: 48px;
    border-radius: 24px;
  }
}

.avatar-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background-color: var(--color-primary);
  color: white;
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;

  &.large {
    width: 48px;
    height: 48px;
    border-radius: 24px;
    font-size: 24px;
  }
}

.username {
  margin: 0 8px;
  font-size: 14px;
  font-weight: 500;
}

.icon-chevron-down {
  font-size: 16px;
  color: var(--color-text-secondary);
  transition: transform 0.3s ease;

  &.is-active {
    transform: rotate(180deg);
  }
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  width: 240px;
  margin-top: 8px;
  background-color: var(--color-bg-popup);
  border-radius: 8px;
  box-shadow: var(--shadow-popup);
  z-index: 1000;
}

.user-info {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--color-border);
}

.info {
  margin-left: 12px;
  min-width: 0;
}

.name {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.email {
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-items {
  padding: 8px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px 16px;
  border: none;
  background: none;
  color: var(--color-text-primary);
  font-size: 14px;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: var(--color-bg-hover);
  }

  i {
    margin-right: 12px;
    font-size: 16px;
    color: var(--color-text-secondary);
  }
}
</style> 