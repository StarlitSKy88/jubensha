import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Script, AIRequest, AISuggestion } from '@/types/script'
import request from '@/utils/request'

export const useScriptStore = defineStore('script', () => {
  const currentScript = ref<Script | null>(null)
  const loading = ref(false)
  const saving = ref(false)

  // 获取剧本
  async function getScript(id: string) {
    loading.value = true
    try {
      const response = await request.get(`/api/v1/scripts/${id}`)
      currentScript.value = response.data
      return response.data
    } catch (error) {
      console.error('Failed to get script:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 创建剧本
  async function createScript(data: Partial<Script>) {
    saving.value = true
    try {
      const response = await request.post('/api/v1/scripts', data)
      currentScript.value = response.data
      return response.data
    } catch (error) {
      console.error('Failed to create script:', error)
      throw error
    } finally {
      saving.value = false
    }
  }

  // 更新剧本
  async function updateScript(data: Partial<Script>) {
    if (!currentScript.value) return

    saving.value = true
    try {
      const response = await request.put(
        `/api/v1/scripts/${currentScript.value.id}`,
        data
      )
      currentScript.value = response.data
      return response.data
    } catch (error) {
      console.error('Failed to update script:', error)
      throw error
    } finally {
      saving.value = false
    }
  }

  // 删除剧本
  async function deleteScript(id: string) {
    try {
      await request.delete(`/api/v1/scripts/${id}`)
      if (currentScript.value?.id === id) {
        currentScript.value = null
      }
    } catch (error) {
      console.error('Failed to delete script:', error)
      throw error
    }
  }

  // 获取AI建议
  async function getAISuggestion(data: AIRequest): Promise<AISuggestion> {
    try {
      const response = await request.post('/api/v1/scripts/ai/suggest', data)
      return response.data
    } catch (error) {
      console.error('Failed to get AI suggestion:', error)
      throw error
    }
  }

  // 导出剧本
  async function exportScript(id: string, format: string) {
    try {
      const response = await request.get(
        `/api/v1/scripts/${id}/export?format=${format}`,
        {
          responseType: 'blob'
        }
      )
      
      // 创建下载链接
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `script_${id}.${format}`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export script:', error)
      throw error
    }
  }

  // 分享剧本
  async function shareScript(id: string, users: string[]) {
    try {
      const response = await request.post(`/api/v1/scripts/${id}/share`, {
        users
      })
      return response.data
    } catch (error) {
      console.error('Failed to share script:', error)
      throw error
    }
  }

  return {
    currentScript,
    loading,
    saving,
    getScript,
    createScript,
    updateScript,
    deleteScript,
    getAISuggestion,
    exportScript,
    shareScript
  }
}) 