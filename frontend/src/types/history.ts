export interface HistoryRecord {
  id: string
  type: 'create' | 'update' | 'delete' | 'restore'
  title: string
  description: string
  projectName: string
  fileName: string
  createdAt: string
  userId: string
}

export interface HistoryDetail {
  oldContent: string
  newContent: string
  createdAt: string
}

export interface HistoryQuery {
  page: number
  pageSize: number
  timeRange: 'today' | 'week' | 'month' | 'all'
  projectId?: string
  userId?: string
}

export interface HistoryResponse {
  items: HistoryRecord[]
  total: number
} 