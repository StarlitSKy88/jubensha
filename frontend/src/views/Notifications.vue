<template>
  <div class="notifications-page">
    <div class="notifications-header">
      <h1>通知</h1>
      <div class="header-actions">
        <button 
          class="btn-secondary"
          @click="markAllAsRead"
          :disabled="!hasUnread"
        >
          全部标记为已读
        </button>
        <button 
          class="btn-secondary"
          @click="showClearConfirm = true"
          :disabled="!notifications.length"
        >
          清空通知
        </button>
      </div>
    </div>

    <div class="notifications-content">
      <div class="notification-filters">
        <div class="filter-group">
          <button
            v-for="filter in filters"
            :key="filter.value"
            class="filter-btn"
            :class="{ active: currentFilter === filter.value }"
            @click="currentFilter = filter.value"
          >
            {{ filter.label }}
            <span 
              v-if="filter.value === 'unread' && unreadCount" 
              class="badge"
            >
              {{ unreadCount }}
            </span>
          </button>
        </div>

        <div class="filter-group">
          <button
            v-for="type in types"
            :key="type.value"
            class="type-btn"
            :class="{ active: currentType === type.value }"
            @click="currentType = type.value"
          >
            <i :class="type.icon"></i>
            {{ type.label }}
          </button>
        </div>
      </div>

      <div v-if="filteredNotifications.length" class="notification-list">
        <div 
          v-for="notification in filteredNotifications"
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
          <div class="notification-actions">
            <button 
              v-if="!notification.read"
              class="action-btn"
              @click.stop="markAsRead(notification.id)"
              title="标记为已读"
            >
              <i class="icon-check"></i>
            </button>
            <button 
              class="action-btn"
              @click.stop="removeNotification(notification.id)"
              title="删除通知"
            >
              <i class="icon-trash"></i>
            </button>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <i class="icon-inbox"></i>
        <p>{{ getEmptyStateMessage() }}</p>
      </div>
    </div>

    <!-- 清空确认对话框 -->
    <div v-if="showClearConfirm" class="modal-overlay">
      <div class="modal">
        <h2>清空通知</h2>
        <p>确定要清空所有通知吗？此操作无法撤销。</p>
        <div class="modal-actions">
          <button 
            class="btn-secondary"
            @click="showClearConfirm = false"
          >
            取消
          </button>
          <button 
            class="btn-primary"
            @click="clearAll"
          >
            确认清空
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notification'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

const router = useRouter()
const notificationStore = useNotificationStore()

const currentFilter = ref('all')
const currentType = ref('all')
const showClearConfirm = ref(false)

// 筛选选项
const filters = [
  { value: 'all', label: '全部' },
  { value: 'unread', label: '未读' },
  { value: 'read', label: '已读' }
]

const types = [
  { value: 'all', label: '全部类型', icon: 'icon-filter' },
  { value: 'system', label: '系统通知', icon: 'icon-info' },
  { value: 'message', label: '消息通知', icon: 'icon-message' },
  { value: 'update', label: '更新提醒', icon: 'icon-update' },
  { value: 'warning', label: '警告提醒', icon: 'icon-warning' }
]

// 获取通知列表
const notifications = computed(() => notificationStore.notifications)

// 未读数量
const unreadCount = computed(() => notificationStore.unreadCount)

// 是否有未读通知
const hasUnread = computed(() => unreadCount.value > 0)

// 筛选通知
const filteredNotifications = computed(() => {
  let filtered = [...notifications.value]

  // 按读取状态筛选
  if (currentFilter.value === 'unread') {
    filtered = filtered.filter(n => !n.read)
  } else if (currentFilter.value === 'read') {
    filtered = filtered.filter(n => n.read)
  }

  // 按类型筛选
  if (currentType.value !== 'all') {
    filtered = filtered.filter(n => n.type === currentType.value)
  }

  // 按时间排序
  return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
})

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
const formatTime = (time: Date) => {
  return formatDistanceToNow(new Date(time), {
    addSuffix: true,
    locale: zhCN
  })
}

// 获取空状态提示
const getEmptyStateMessage = () => {
  if (currentFilter.value === 'unread') {
    return '暂无未读通知'
  } else if (currentFilter.value === 'read') {
    return '暂无已读通知'
  } else if (currentType.value !== 'all') {
    return \`暂无\${types.find(t => t.value === currentType.value)?.label}\`
  }
  return '暂无通知'
}

// 处理通知点击
const handleNotificationClick = (notification: any) => {
  if (!notification.read) {
    markAsRead(notification.id)
  }
  if (notification.link) {
    router.push(notification.link)
  }
}

// 标记为已读
const markAsRead = (id: string) => {
  notificationStore.markAsRead(id)
}

// 全部标记为已读
const markAllAsRead = () => {
  notificationStore.markAllAsRead()
}

// 删除通知
const removeNotification = (id: string) => {
  notificationStore.removeNotification(id)
}

// 清空所有通知
const clearAll = () => {
  notificationStore.clearAll()
  showClearConfirm.value = false
}
</script>

<style lang="scss" scoped>
.notifications-page {
  padding: 32px;
  max-width: 800px;
  margin: 0 auto;
}

.notifications-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;

  h1 {
    font-size: 24px;
    font-weight: 600;
    color: var(--color-text-primary);
  }
}

.header-actions {
  display: flex;
  gap: 12px;
}

.notifications-content {
  background-color: var(--color-bg-secondary);
  border-radius: 12px;
  padding: 24px;
}

.notification-filters {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.filter-group {
  display: flex;
  gap: 12px;
}

.filter-btn,
.type-btn {
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

  &:hover {
    background-color: var(--color-bg-hover);
  }

  &.active {
    background-color: var(--color-primary);
    border-color: var(--color-primary);
    color: white;
  }
}

.type-btn {
  i {
    margin-right: 8px;
    font-size: 16px;
  }
}

.badge {
  margin-left: 8px;
  padding: 2px 6px;
  background-color: var(--color-primary);
  color: white;
  font-size: 12px;
  border-radius: 10px;
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  background-color: var(--color-bg-primary);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: var(--color-bg-hover);

    .notification-actions {
      opacity: 1;
    }
  }

  &.unread {
    background-color: var(--color-bg-unread);
  }
}

.notification-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  margin-right: 16px;
  border-radius: 20px;
  background-color: var(--color-bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;

  i {
    font-size: 20px;
    color: var(--color-text-secondary);
  }
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.notification-desc {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 8px;
}

.notification-time {
  font-size: 12px;
  color: var(--color-text-placeholder);
}

.notification-actions {
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.action-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  background-color: var(--color-bg-primary);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: var(--color-bg-hover);
    color: var(--color-text-primary);
  }
}

.empty-state {
  padding: 48px;
  text-align: center;
  color: var(--color-text-placeholder);

  i {
    font-size: 48px;
    margin-bottom: 16px;
  }

  p {
    font-size: 14px;
  }
}

.btn-primary,
.btn-secondary {
  height: 36px;
  padding: 0 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
  border: none;

  &:hover:not(:disabled) {
    background-color: var(--color-primary-dark);
  }
}

.btn-secondary {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);

  &:hover:not(:disabled) {
    background-color: var(--color-bg-hover);
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  width: 90%;
  max-width: 400px;
  padding: 24px;
  background-color: var(--color-bg-primary);
  border-radius: 12px;
  box-shadow: var(--shadow-popup);

  h2 {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 16px;
  }

  p {
    font-size: 14px;
    color: var(--color-text-secondary);
    margin-bottom: 24px;
  }
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}
</style> 