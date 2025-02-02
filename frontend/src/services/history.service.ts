import request from '@/utils/request'
import type { 
  HistoryRecord, 
  HistoryDetail, 
  HistoryQuery, 
  HistoryResponse 
} from '@/types/history'

/**
 * 获取历史记录列表
 */
export const getHistoryList = (params: HistoryQuery): Promise<HistoryResponse> => {
  return request.get('/api/history', { params })
}

/**
 * 获取历史记录详情
 */
export const getHistoryDetail = (id: string): Promise<HistoryDetail> => {
  return request.get(`/api/history/${id}`)
}

/**
 * 恢复历史记录
 */
export const restoreHistory = (id: string): Promise<void> => {
  return request.post(`/api/history/${id}/restore`)
}

/**
 * 删除历史记录
 */
export const deleteHistory = (id: string): Promise<void> => {
  return request.delete(`/api/history/${id}`)
}

/**
 * 清空历史记录
 */
export const clearHistory = (): Promise<void> => {
  return request.delete('/api/history')
}

/**
 * 创建历史记录
 */
export const createHistory = (data: {
  type: HistoryRecord['type']
  title: string
  description: string
  projectId: string
  fileName: string
  oldContent?: string
  newContent: string
}): Promise<HistoryRecord> => {
  return request.post('/api/history', data)
}

/**
 * 批量删除历史记录
 */
export const batchDeleteHistory = (ids: string[]): Promise<void> => {
  return request.delete('/api/history/batch', { data: { ids } })
}

/**
 * 获取历史记录统计
 */
export const getHistoryStats = (): Promise<{
  total: number
  today: number
  week: number
  month: number
}> => {
  return request.get('/api/history/stats')
} 