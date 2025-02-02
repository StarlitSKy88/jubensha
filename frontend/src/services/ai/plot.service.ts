import request from '@/utils/request'

export interface PlotSuggestion {
  id: string
  title: string
  description: string
  type: 'conflict' | 'twist' | 'resolution'
  confidence: number
  details: {
    setup: string
    development: string
    climax: string
    resolution: string
  }
  relatedCharacters: string[]
  possibleOutcomes: string[]
  createdAt: string
}

export interface PlotAnalysis {
  structure: {
    exposition: string[]
    risingAction: string[]
    climax: string[]
    fallingAction: string[]
    resolution: string[]
  }
  pacing: {
    score: number
    suggestions: string[]
  }
  conflicts: {
    main: string
    secondary: string[]
  }
  themes: string[]
  suggestions: string[]
}

/**
 * 获取情节建议
 */
export const getPlotSuggestions = async (params: {
  content: string
  type?: 'conflict' | 'twist' | 'resolution'
  context?: string
}): Promise<PlotSuggestion[]> => {
  return request.post('/api/ai/plot/suggestions', params)
}

/**
 * 分析情节结构
 */
export const analyzePlot = async (content: string): Promise<PlotAnalysis> => {
  return request.post('/api/ai/plot/analyze', { content })
}

/**
 * 优化情节
 */
export const optimizePlot = async (params: {
  content: string
  focus: 'pacing' | 'conflict' | 'character' | 'theme'
}): Promise<{
  optimizedContent: string
  changes: string[]
  reasoning: string
}> => {
  return request.post('/api/ai/plot/optimize', params)
}

/**
 * 生成情节大纲
 */
export const generatePlotOutline = async (params: {
  premise: string
  style?: string
  length?: 'short' | 'medium' | 'long'
}): Promise<{
  outline: string[]
  suggestions: string[]
}> => {
  return request.post('/api/ai/plot/outline', params)
}

/**
 * 检查情节连贯性
 */
export const checkPlotConsistency = async (content: string): Promise<{
  issues: Array<{
    type: 'continuity' | 'logic' | 'character' | 'timeline'
    description: string
    location: string
    suggestion: string
  }>
  score: number
}> => {
  return request.post('/api/ai/plot/check-consistency', { content })
} 