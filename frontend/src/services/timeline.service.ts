import { http } from '@/utils/http'

export interface TimelineEvent {
  id: string
  projectId: string
  title: string
  description: string
  type: 'major' | 'minor' | 'background'
  date: string
  time?: string
  duration?: number
  location?: string
  characters: string[]
  relatedEvents?: string[]
  relatedClues?: string[]
  importance: number
  status: 'draft' | 'published'
  order: number
  tags: string[]
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface TimelinePhase {
  name: string
  description: string
  type: string
  events: TimelineEvent[]
  startDate: string
  endDate: string
}

export interface TimelineAnalysis {
  totalEvents: number
  majorEvents: number
  minorEvents: number
  backgroundEvents: number
  phases: TimelinePhase[]
  characterArcs: {
    character: string
    events: TimelineEvent[]
    arc: string
  }[]
  plotPoints: {
    type: string
    event: TimelineEvent
    significance: string
  }[]
}

export interface ConsistencyIssue {
  id: string
  title: string
  description: string
  type: 'error' | 'warning'
  event: TimelineEvent
  relatedEvents?: TimelineEvent[]
  suggestion?: string
}

export interface ConsistencyResult {
  issues: ConsistencyIssue[]
  score: number
  suggestions: string[]
}

export interface OptimizationSuggestion {
  id: string
  title: string
  description: string
  type: string
  relatedEvent?: TimelineEvent
  impact: 'high' | 'medium' | 'low'
}

export interface OptimizationResult {
  suggestions: OptimizationSuggestion[]
  currentPacing: {
    score: number
    analysis: string
  }
  recommendedChanges: {
    event: TimelineEvent
    change: string
    reason: string
  }[]
}

// API 端点
const API_ENDPOINTS = {
  events: '/api/timeline/events',
  analysis: '/api/timeline/analysis',
  consistency: '/api/timeline/consistency',
  optimization: '/api/timeline/optimization',
  export: '/api/timeline/export',
  import: '/api/timeline/import'
}

// 获取时间线事件列表
export const getTimelineEvents = async (projectId?: string): Promise<TimelineEvent[]> => {
  const params = projectId ? { projectId } : {}
  const response = await http.get(API_ENDPOINTS.events, { params })
  return response.data
}

// 获取单个时间线事件
export const getTimelineEvent = async (id: string): Promise<TimelineEvent> => {
  const response = await http.get(`${API_ENDPOINTS.events}/${id}`)
  return response.data
}

// 创建时间线事件
export const createTimelineEvent = async (event: Partial<TimelineEvent>): Promise<TimelineEvent> => {
  const response = await http.post(API_ENDPOINTS.events, event)
  return response.data
}

// 更新时间线事件
export const updateTimelineEvent = async (id: string, event: Partial<TimelineEvent>): Promise<TimelineEvent> => {
  const response = await http.put(`${API_ENDPOINTS.events}/${id}`, event)
  return response.data
}

// 删除时间线事件
export const deleteTimelineEvent = async (id: string): Promise<void> => {
  await http.delete(`${API_ENDPOINTS.events}/${id}`)
}

// 分析时间线
export const analyzeTimeline = async (projectId?: string): Promise<TimelineAnalysis> => {
  const params = projectId ? { projectId } : {}
  const response = await http.get(API_ENDPOINTS.analysis, { params })
  return response.data
}

// 检查时间线一致性
export const checkTimelineConsistency = async (projectId?: string): Promise<ConsistencyResult> => {
  const params = projectId ? { projectId } : {}
  const response = await http.get(API_ENDPOINTS.consistency, { params })
  return response.data
}

// 优化时间线节奏
export const optimizeTimelinePacing = async (projectId?: string): Promise<OptimizationResult> => {
  const params = projectId ? { projectId } : {}
  const response = await http.get(API_ENDPOINTS.optimization, { params })
  return response.data
}

// 导出时间线
export const exportTimeline = async (projectId?: string): Promise<TimelineEvent[]> => {
  const params = projectId ? { projectId } : {}
  const response = await http.get(API_ENDPOINTS.export, { params })
  return response.data
}

// 导入时间线
export const importTimeline = async (data: TimelineEvent[]): Promise<void> => {
  await http.post(API_ENDPOINTS.import, { events: data })
}

// 批量更新事件顺序
export const updateEventsOrder = async (events: { id: string; order: number }[]): Promise<void> => {
  await http.put(`${API_ENDPOINTS.events}/order`, { events })
}

// 获取相关事件
export const getRelatedEvents = async (eventId: string): Promise<TimelineEvent[]> => {
  const response = await http.get(`${API_ENDPOINTS.events}/${eventId}/related`)
  return response.data
}

// 添加事件关联
export const addEventRelation = async (eventId: string, relatedEventId: string): Promise<void> => {
  await http.post(`${API_ENDPOINTS.events}/${eventId}/relations`, { relatedEventId })
}

// 移除事件关联
export const removeEventRelation = async (eventId: string, relatedEventId: string): Promise<void> => {
  await http.delete(`${API_ENDPOINTS.events}/${eventId}/relations/${relatedEventId}`)
} 