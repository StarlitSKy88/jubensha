import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface ChatMessage {
  id: string
  type: 'system' | 'user' | 'ai'
  content: string
  timestamp: Date
  metadata?: {
    documentId?: string
    selection?: {
      start: number
      end: number
      text: string
    }
  }
}

export const useChatStore = defineStore('chat', () => {
  // 状态
  const messages = ref<ChatMessage[]>([])
  const chatInput = ref('')
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 方法
  const sendMessage = async (content: string, metadata?: ChatMessage['metadata']) => {
    try {
      isLoading.value = true
      error.value = null

      // 添加用户消息
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'user',
        content,
        timestamp: new Date(),
        metadata
      }
      messages.value.push(userMessage)

      // 发送到后端
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: content,
          metadata
        })
      })

      if (!response.ok) throw new Error('发送消息失败')

      const data = await response.json()

      // 添加AI响应
      const aiMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'ai',
        content: data.response,
        timestamp: new Date(),
        metadata: data.metadata
      }
      messages.value.push(aiMessage)

      return aiMessage
    } catch (e) {
      error.value = e instanceof Error ? e.message : '未知错误'
      // 添加错误消息
      messages.value.push({
        id: Date.now().toString(),
        type: 'system',
        content: error.value,
        timestamp: new Date()
      })
      return null
    } finally {
      isLoading.value = false
    }
  }

  const clearMessages = () => {
    messages.value = []
    chatInput.value = ''
  }

  const loadChatHistory = async (documentId?: string) => {
    try {
      isLoading.value = true
      error.value = null

      const url = documentId 
        ? `/api/chat/history?documentId=${documentId}`
        : '/api/chat/history'
      
      const response = await fetch(url)
      if (!response.ok) throw new Error('获取聊天历史失败')

      const data = await response.json()
      messages.value = data.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
    } catch (e) {
      error.value = e instanceof Error ? e.message : '未知错误'
    } finally {
      isLoading.value = false
    }
  }

  return {
    messages,
    chatInput,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    loadChatHistory
  }
}) 