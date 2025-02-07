import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Document {
  id: string
  title: string
  type: 'main' | 'side' | 'character'
  content: string
  outline?: {
    id: string
    title: string
    children?: Array<{
      id: string
      title: string
    }>
  }[]
  lastModified: Date
  createdBy: string
  projectId: string
}

export interface DocumentHistory {
  id: string
  documentId: string
  content: string
  type: 'auto' | 'manual' | 'ai'
  timestamp: Date
  description: string
}

export interface DocumentReference {
  id: string
  documentId: string
  referenceType: string
  content: string
  timestamp: Date
}

export const useDocumentStore = defineStore('document', () => {
  // 状态
  const documents = ref<Document[]>([])
  const currentDocument = ref<Document | null>(null)
  const documentHistory = ref<DocumentHistory[]>([])
  const documentReferences = ref<DocumentReference[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const documentTree = computed(() => {
    const tree = [
      {
        label: '剧本文档',
        children: documents.value.map(doc => ({
          id: doc.id,
          label: doc.title,
          type: doc.type
        }))
      }
    ]
    return tree
  })

  // 方法
  const fetchDocuments = async (projectId: string) => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await fetch(`/api/projects/${projectId}/documents`)
      if (!response.ok) throw new Error('获取文档失败')
      
      const data = await response.json()
      documents.value = data
    } catch (e) {
      error.value = e instanceof Error ? e.message : '未知错误'
    } finally {
      isLoading.value = false
    }
  }

  const fetchDocument = async (documentId: string) => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await fetch(`/api/documents/${documentId}`)
      if (!response.ok) throw new Error('获取文档详情失败')
      
      const data = await response.json()
      currentDocument.value = data
      return data
    } catch (e) {
      error.value = e instanceof Error ? e.message : '未知错误'
      return null
    } finally {
      isLoading.value = false
    }
  }

  const saveDocument = async (documentId: string, content: string) => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      })
      
      if (!response.ok) throw new Error('保存文档失败')
      
      const data = await response.json()
      // 更新本地状态
      const index = documents.value.findIndex(d => d.id === documentId)
      if (index > -1) {
        documents.value[index] = data
      }
      if (currentDocument.value?.id === documentId) {
        currentDocument.value = data
      }
      
      return data
    } catch (e) {
      error.value = e instanceof Error ? e.message : '未知错误'
      return null
    } finally {
      isLoading.value = false
    }
  }

  const fetchDocumentHistory = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/history`)
      if (!response.ok) throw new Error('获取历史记录失败')
      
      const data = await response.json()
      documentHistory.value = data
    } catch (e) {
      error.value = e instanceof Error ? e.message : '未知错误'
    }
  }

  const restoreDocumentVersion = async (documentId: string, historyId: string) => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await fetch(`/api/documents/${documentId}/restore/${historyId}`, {
        method: 'POST'
      })
      
      if (!response.ok) throw new Error('还原历史版本失败')
      
      const data = await response.json()
      // 更新本地状态
      const index = documents.value.findIndex(d => d.id === documentId)
      if (index > -1) {
        documents.value[index] = data
      }
      if (currentDocument.value?.id === documentId) {
        currentDocument.value = data
      }
      
      return data
    } catch (e) {
      error.value = e instanceof Error ? e.message : '未知错误'
      return null
    } finally {
      isLoading.value = false
    }
  }

  const fetchDocumentReferences = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/references`)
      if (!response.ok) throw new Error('获取引用历史失败')
      
      const data = await response.json()
      documentReferences.value = data
    } catch (e) {
      error.value = e instanceof Error ? e.message : '未知错误'
    }
  }

  // 自动保存
  let autoSaveTimer: number | null = null
  
  const startAutoSave = (documentId: string, content: string) => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
    }
    
    autoSaveTimer = window.setTimeout(() => {
      saveDocument(documentId, content)
    }, 3000) // 3秒后自动保存
  }

  const stopAutoSave = () => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
      autoSaveTimer = null
    }
  }

  return {
    // 状态
    documents,
    currentDocument,
    documentHistory,
    documentReferences,
    isLoading,
    error,
    
    // 计算属性
    documentTree,
    
    // 方法
    fetchDocuments,
    fetchDocument,
    saveDocument,
    fetchDocumentHistory,
    restoreDocumentVersion,
    fetchDocumentReferences,
    startAutoSave,
    stopAutoSave
  }
}) 