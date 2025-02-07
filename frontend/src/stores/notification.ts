import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Notification {
  id: string
  title: string
  description: string
  type: 'system' | 'message' | 'update' | 'warning'
  read: boolean
  createdAt: Date
  link?: string
}

export const useNotificationStore = defineStore('notification', () => {
  // 通知列表
  const notifications = ref<Notification[]>([])
  
  // 最近的通知(最多显示10条)
  const recentNotifications = computed(() => 
    notifications.value
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10)
  )
  
  // 未读数量
  const unreadCount = computed(() => 
    notifications.value.filter(n => !n.read).length
  )
  
  // 添加通知
  const addNotification = (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    notifications.value.push({
      ...notification,
      id,
      read: false,
      createdAt: new Date()
    })
  }
  
  // 标记通知为已读
  const markAsRead = (id: string) => {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.read = true
    }
  }
  
  // 标记所有通知为已读
  const markAllAsRead = () => {
    notifications.value.forEach(n => n.read = true)
  }
  
  // 删除通知
  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }
  
  // 清空所有通知
  const clearAll = () => {
    notifications.value = []
  }
  
  return {
    notifications,
    recentNotifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll
  }
}) 