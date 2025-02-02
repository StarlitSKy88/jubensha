import request from '@/utils/request'

export interface Clue {
  id: string
  projectId: string
  title: string
  type: 'object' | 'information' | 'event' | 'location' | 'relationship'
  description: string
  importance: 1 | 2 | 3 | 4 | 5
  status: 'active' | 'resolved' | 'abandoned'
  revealedAt?: string
  resolvedAt?: string
  relatedCharacters: string[]
  relatedScenes: string[]
  relatedClues: string[]
  tags: string[]
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface ClueTimeline {
  id: string
  clueId: string
  sceneId: string
  type: 'introduction' | 'development' | 'revelation'
  description: string
  impact: 1 | 2 | 3 | 4 | 5
  order: number
}

export interface ClueConnection {
  id: string
  sourceId: string
  targetId: string
  type: 'leads_to' | 'contradicts' | 'supports' | 'related'
  description: string
  strength: 1 | 2 | 3 | 4 | 5
}

/**
 * 获取线索列表
 */
export const getClues = (projectId: string): Promise<Clue[]> => {
  return request.get('/api/clues', { params: { projectId } })
}

/**
 * 获取线索详情
 */
export const getClue = (id: string): Promise<Clue> => {
  return request.get(`/api/clues/${id}`)
}

/**
 * 创建线索
 */
export const createClue = (data: Omit<Clue, 'id' | 'createdAt' | 'updatedAt'>): Promise<Clue> => {
  return request.post('/api/clues', data)
}

/**
 * 更新线索
 */
export const updateClue = (id: string, data: Partial<Clue>): Promise<void> => {
  return request.put(`/api/clues/${id}`, data)
}

/**
 * 删除线索
 */
export const deleteClue = (id: string): Promise<void> => {
  return request.delete(`/api/clues/${id}`)
}

/**
 * 获取线索时间线
 */
export const getClueTimeline = (clueId: string): Promise<ClueTimeline[]> => {
  return request.get(`/api/clues/${clueId}/timeline`)
}

/**
 * 创建线索时间线项
 */
export const createClueTimelineItem = (data: Omit<ClueTimeline, 'id'>): Promise<ClueTimeline> => {
  return request.post('/api/clue-timeline', data)
}

/**
 * 更新线索时间线项
 */
export const updateClueTimelineItem = (id: string, data: Partial<ClueTimeline>): Promise<void> => {
  return request.put(`/api/clue-timeline/${id}`, data)
}

/**
 * 删除线索时间线项
 */
export const deleteClueTimelineItem = (id: string): Promise<void> => {
  return request.delete(`/api/clue-timeline/${id}`)
}

/**
 * 获取线索关联
 */
export const getClueConnections = (clueId: string): Promise<ClueConnection[]> => {
  return request.get(`/api/clues/${clueId}/connections`)
}

/**
 * 创建线索关联
 */
export const createClueConnection = (data: Omit<ClueConnection, 'id'>): Promise<ClueConnection> => {
  return request.post('/api/clue-connections', data)
}

/**
 * 更新线索关联
 */
export const updateClueConnection = (id: string, data: Partial<ClueConnection>): Promise<void> => {
  return request.put(`/api/clue-connections/${id}`, data)
}

/**
 * 删除线索关联
 */
export const deleteClueConnection = (id: string): Promise<void> => {
  return request.delete(`/api/clue-connections/${id}`)
}

/**
 * 分析线索网络
 */
export const analyzeClueNetwork = (projectId: string): Promise<{
  centrality: Record<string, number>
  clusters: Array<{
    clues: string[]
    theme: string
    strength: number
  }>
  suggestions: string[]
}> => {
  return request.post(`/api/clues/analyze-network`, { projectId })
}

/**
 * 检查线索一致性
 */
export const checkClueConsistency = (projectId: string): Promise<{
  issues: Array<{
    type: 'contradiction' | 'gap' | 'redundancy'
    description: string
    clues: string[]
    suggestion: string
  }>
  score: number
}> => {
  return request.post(`/api/clues/check-consistency`, { projectId })
}

/**
 * 优化线索分布
 */
export const optimizeClueDistribution = (projectId: string): Promise<{
  distribution: Array<{
    sceneId: string
    clues: Array<{
      id: string
      type: ClueTimeline['type']
      reason: string
    }>
  }>
  suggestions: string[]
}> => {
  return request.post(`/api/clues/optimize-distribution`, { projectId })
}

/**
 * 导出线索图谱
 */
export const exportClueNetwork = (projectId: string, format: 'json' | 'graphml' = 'json'): Promise<Blob> => {
  return request.get(`/api/clues/export-network`, {
    params: { projectId, format },
    responseType: 'blob'
  })
}

/**
 * 导入线索图谱
 */
export const importClueNetwork = (projectId: string, file: File): Promise<void> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('projectId', projectId)
  return request.post('/api/clues/import-network', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
} 