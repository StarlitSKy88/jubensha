import request from '@/utils/request'
import type { TreeNode, ChapterData, ChapterOrderData } from '@/types/outline'

/**
 * 获取大纲
 */
export const getOutline = (): Promise<TreeNode[]> => {
  return request.get('/api/outline')
}

/**
 * 创建章节
 */
export const createChapter = (data: ChapterData): Promise<TreeNode> => {
  return request.post('/api/outline/chapter', data)
}

/**
 * 更新章节
 */
export const updateChapter = (data: ChapterData & { id: string }): Promise<void> => {
  return request.put(`/api/outline/chapter/${data.id}`, data)
}

/**
 * 删除章节
 */
export const deleteChapter = (id: string): Promise<void> => {
  return request.delete(`/api/outline/chapter/${id}`)
}

/**
 * 更新章节顺序
 */
export const updateChapterOrder = (data: ChapterOrderData): Promise<void> => {
  return request.put('/api/outline/chapter/order', data)
}

/**
 * 导出大纲
 */
export const exportOutline = (format: 'txt' | 'md' | 'docx' = 'md'): Promise<Blob> => {
  return request.get('/api/outline/export', {
    params: { format },
    responseType: 'blob'
  })
}

/**
 * 导入大纲
 */
export const importOutline = (file: File): Promise<void> => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/api/outline/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 获取大纲统计
 */
export const getOutlineStats = (): Promise<{
  totalChapters: number
  totalSections: number
  totalScenes: number
  totalWords: number
}> => {
  return request.get('/api/outline/stats')
}

/**
 * 批量更新章节
 */
export const batchUpdateChapters = (data: Array<ChapterData & { id: string }>): Promise<void> => {
  return request.put('/api/outline/chapter/batch', data)
}

/**
 * 复制章节
 */
export const copyChapter = (id: string, targetId?: string): Promise<TreeNode> => {
  return request.post(`/api/outline/chapter/${id}/copy`, { targetId })
}

/**
 * 移动章节
 */
export const moveChapter = (id: string, targetId: string, position: 'prev' | 'next' | 'inner'): Promise<void> => {
  return request.put(`/api/outline/chapter/${id}/move`, { targetId, position })
} 