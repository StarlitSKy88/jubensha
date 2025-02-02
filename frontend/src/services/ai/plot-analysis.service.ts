import request from '@/utils/request'

export interface PlotAnalysisResult {
  structure: {
    exposition: Array<{
      content: string
      score: number
      suggestions: string[]
    }>
    risingAction: Array<{
      content: string
      score: number
      suggestions: string[]
    }>
    climax: Array<{
      content: string
      score: number
      suggestions: string[]
    }>
    fallingAction: Array<{
      content: string
      score: number
      suggestions: string[]
    }>
    resolution: Array<{
      content: string
      score: number
      suggestions: string[]
    }>
  }
  pacing: {
    overall: number
    byChapter: Array<{
      chapter: string
      score: number
      issues: string[]
    }>
    suggestions: string[]
  }
  tension: {
    overall: number
    graph: Array<{
      position: number
      value: number
      event: string
    }>
    peaks: Array<{
      position: number
      value: number
      event: string
      effectiveness: number
    }>
    suggestions: string[]
  }
  themes: Array<{
    name: string
    strength: number
    development: Array<{
      position: number
      content: string
      effectiveness: number
    }>
    suggestions: string[]
  }>
  characters: Array<{
    id: string
    name: string
    arc: {
      development: number
      consistency: number
      impact: number
    }
    scenes: Array<{
      position: number
      content: string
      impact: number
    }>
    suggestions: string[]
  }>
  conflicts: Array<{
    type: 'internal' | 'external' | 'philosophical'
    description: string
    intensity: number
    resolution: {
      content: string
      effectiveness: number
    }
    characters: string[]
    suggestions: string[]
  }>
  symbolism: Array<{
    symbol: string
    occurrences: Array<{
      position: number
      content: string
      effectiveness: number
    }>
    meaning: string
    suggestions: string[]
  }>
  style: {
    tone: {
      overall: string
      consistency: number
      variations: Array<{
        position: number
        tone: string
        content: string
      }>
    }
    pov: {
      type: string
      consistency: number
      effectiveness: number
      issues: string[]
    }
    dialogue: {
      naturalness: number
      characterization: number
      pacing: number
      issues: string[]
    }
    description: {
      vividness: number
      balance: number
      effectiveness: number
      issues: string[]
    }
  }
}

/**
 * 分析剧情结构
 */
export const analyzePlotStructure = async (content: string): Promise<PlotAnalysisResult['structure']> => {
  return request.post('/api/ai/plot/analyze-structure', { content })
}

/**
 * 分析节奏和张力
 */
export const analyzePacingAndTension = async (content: string): Promise<{
  pacing: PlotAnalysisResult['pacing']
  tension: PlotAnalysisResult['tension']
}> => {
  return request.post('/api/ai/plot/analyze-pacing-tension', { content })
}

/**
 * 分析主题
 */
export const analyzeThemes = async (content: string): Promise<PlotAnalysisResult['themes']> => {
  return request.post('/api/ai/plot/analyze-themes', { content })
}

/**
 * 分析角色弧光
 */
export const analyzeCharacterArcs = async (content: string): Promise<PlotAnalysisResult['characters']> => {
  return request.post('/api/ai/plot/analyze-character-arcs', { content })
}

/**
 * 分析冲突
 */
export const analyzeConflicts = async (content: string): Promise<PlotAnalysisResult['conflicts']> => {
  return request.post('/api/ai/plot/analyze-conflicts', { content })
}

/**
 * 分析象征和意象
 */
export const analyzeSymbolism = async (content: string): Promise<PlotAnalysisResult['symbolism']> => {
  return request.post('/api/ai/plot/analyze-symbolism', { content })
}

/**
 * 分析写作风格
 */
export const analyzeStyle = async (content: string): Promise<PlotAnalysisResult['style']> => {
  return request.post('/api/ai/plot/analyze-style', { content })
}

/**
 * 完整分析
 */
export const analyzeComplete = async (content: string): Promise<PlotAnalysisResult> => {
  return request.post('/api/ai/plot/analyze-complete', { content })
}

/**
 * 生成分析报告
 */
export const generateAnalysisReport = async (analysis: PlotAnalysisResult): Promise<{
  summary: string
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
  report: string
}> => {
  return request.post('/api/ai/plot/generate-report', { analysis })
}

/**
 * 获取改进建议
 */
export const getImprovementSuggestions = async (params: {
  content: string
  focus: Array<'structure' | 'pacing' | 'character' | 'conflict' | 'theme' | 'style'>
}): Promise<Array<{
  aspect: string
  issues: string[]
  suggestions: string[]
  examples?: string[]
}>> => {
  return request.post('/api/ai/plot/get-suggestions', params)
}

/**
 * 检查情节漏洞
 */
export const checkPlotHoles = async (content: string): Promise<Array<{
  type: 'continuity' | 'logic' | 'character' | 'worldbuilding'
  description: string
  location: string
  severity: number
  suggestion: string
}>> => {
  return request.post('/api/ai/plot/check-holes', { content })
}

/**
 * 分析情节连贯性
 */
export const analyzeCoherence = async (content: string): Promise<{
  score: number
  issues: Array<{
    type: string
    description: string
    location: string
    suggestion: string
  }>
  suggestions: string[]
}> => {
  return request.post('/api/ai/plot/analyze-coherence', { content })
} 