<template>
  <div class="notification-bell" v-click-outside="closeDropdown">
    <button 
      class="bell-btn"
      :class="{ active: showDropdown }"
      @click="toggleDropdown"
      :title="unreadCount ? \`\${unreadCount} 条未读消息\` : '暂无未读消息'"
    >
      <i class="icon-bell"></i>
      <span v-if="unreadCount" class="badge">{{ unreadCount }}</span>
    </button>

    <div v-if="showDropdown" class="notification-dropdown">
      <div class="dropdown-header">
        <h3>通知</h3>
        <button 
          v-if="notifications.length"
          class="read-all-btn"
          @click="markAllAsRead"
        >
          全部已读
        </button>
      </div>

      <div class="notification-list" v-if="notifications.length">
        <div 
          v-for="notification in notifications"
          :key="notification.id"
          class="notification-item"
          :class="{ unread: !notification.read }"
          @click="handleNotificationClick(notification)"
        >
          <div class="notification-icon">
            <i :class="getNotificationIcon(notification.type)"></i>
          </div>
          <div class="notification-content">
            <div class="notification-title">{{ notification.title }}</div>
            <div class="notification-desc">{{ notification.description }}</div>
            <div class="notification-time">{{ formatTime(notification.createdAt) }}</div>
          </div>
          <button 
            v-if="!notification.read"
            class="mark-read-btn"
            @click.stop="markAsRead(notification.id)"
            title="标记为已读"
          >
            <i class="icon-check"></i>
          </button>
        </div>
      </div>

      <div v-else class="empty-state">
        <i class="icon-inbox"></i>
        <p>暂无通知</p>
      </div>

      <div v-if="notifications.length" class="dropdown-footer">
        <router-link to="/notifications">查看全部</router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

const notificationStore = useNotificationStore()
const showDropdown = ref(false)

// 获取通知列表
const notifications = computed(() => notificationStore.recentNotifications)
const unreadCount = computed(() => notificationStore.unreadCount)

// 切换下拉框
const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

// 关闭下拉框
const closeDropdown = () => {
  showDropdown.value = false
}

// 标记单个通知为已读
const markAsRead = async (id: string) => {
  await notificationStore.markAsRead(id)
}

// 标记所有通知为已读
const markAllAsRead = async () => {
  await notificationStore.markAllAsRead()
}

// 处理通知点击
const handleNotificationClick = (notification: any) => {
  if (!notification.read) {
    markAsRead(notification.id)
  }
  // 根据通知类型处理跳转
  if (notification.link) {
    router.push(notification.link)
  }
  closeDropdown()
}

// 获取通知图标
const getNotificationIcon = (type: string) => {
  const icons = {
    system: 'icon-info',
    message: 'icon-message',
    update: 'icon-update',
    warning: 'icon-warning'
  }
  return icons[type as keyof typeof icons] || 'icon-notification'
}

// 格式化时间
const formatTime = (time: string | Date) => {
  return formatDistanceToNow(new Date(time), {
    addSuffix: true,
    locale: zhCN
  })
}
</script>

<style lang="scss" scoped>
.notification-bell {
  position: relative;
}

.bell-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 20px;
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
    font-size: 24px;
  }
}

.badge {
  position: absolute;
  top: 0;
  right: 0;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background-color: var(--color-error);
  color: white;
  font-size: 12px;
  line-height: 18px;
  text-align: center;
}

.notification-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 360px;
  margin-top: 8px;
  background-color: var(--color-bg-popup);
  border-radius: 8px;
  box-shadow: var(--shadow-popup);
  z-index: 1000;
}

.dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--color-border);

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .read-all-btn {
    padding: 4px 8px;
    border: none;
    border-radius: 4px;
    background: none;
    color: var(--color-primary);
    font-size: 14px;
    cursor: pointer;

    &:hover {
      background-color: var(--color-primary-light);
    }
  }
}

.notification-list {
  max-height: 400px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: var(--color-bg-hover);
  }

  &.unread {
    background-color: var(--color-bg-unread);
  }
}

.notification-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  margin-right: 12px;
  border-radius: 16px;
  background-color: var(--color-bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;

  i {
    font-size: 18px;
    color: var(--color-text-secondary);
  }
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  margin-bottom: 4px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.notification-desc {
  margin-bottom: 4px;
  font-size: 13px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notification-time {
  font-size: 12px;
  color: var(--color-text-placeholder);
}

.mark-read-btn {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  margin-left: 12px;
  border: none;
  border-radius: 12px;
  background: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  opacity: 0;
  transition: all 0.3s ease;

  &:hover {
    color: var(--color-primary);
    background-color: var(--color-primary-light);
  }

  .notification-item:hover & {
    opacity: 1;
  }
}

.empty-state {
  padding: 32px;
  text-align: center;
  color: var(--color-text-placeholder);

  i {
    font-size: 48px;
    margin-bottom: 8px;
  }

  p {
    margin: 0;
    font-size: 14px;
  }
}

.dropdown-footer {
  padding: 12px;
  text-align: center;
  border-top: 1px solid var(--color-border);

  a {
    color: var(--color-primary);
    text-decoration: none;
    font-size: 14px;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style> 