import request from '@/utils/request'

export interface DialogueAnalysis {
  structure: {
    flow: number
    coherence: number
    pacing: number
    issues: string[]
  }
  characterization: {
    distinctiveness: number
    consistency: number
    voice: number
    issues: string[]
  }
  emotion: {
    intensity: number
    variation: number
    appropriateness: number
    issues: string[]
  }
  subtext: {
    depth: number
    clarity: number
    effectiveness: number
    suggestions: string[]
  }
  context: {
    relevance: number
    worldBuilding: number
    atmosphere: number
    issues: string[]
  }
}

export interface DialogueGeneration {
  content: string
  tone: string
  emotion: string
  subtext: string
  variations: string[]
}

export interface DialogueOptimization {
  original: string
  optimized: string
  changes: Array<{
    type: 'flow' | 'character' | 'emotion' | 'subtext' | 'context'
    description: string
    reason: string
  }>
  suggestions: string[]
}

/**
 * 分析对话
 */
export const analyzeDialogue = async (content: string): Promise<DialogueAnalysis> => {
  return request.post('/api/ai/dialogue/analyze', { content })
}

/**
 * 生成对话
 */
export const generateDialogue = async (params: {
  context: string
  characters: Array<{
    name: string
    traits: string[]
    emotion?: string
  }>
  tone?: string
  length?: 'short' | 'medium' | 'long'
  style?: string
}): Promise<DialogueGeneration> => {
  return request.post('/api/ai/dialogue/generate', params)
}

/**
 * 优化对话
 */
export const optimizeDialogue = async (params: {
  content: string
  focus?: Array<'flow' | 'character' | 'emotion' | 'subtext' | 'context'>
  style?: string
  constraints?: string[]
}): Promise<DialogueOptimization> => {
  return request.post('/api/ai/dialogue/optimize', params)
}

/**
 * 生成对话变体
 */
export const generateDialogueVariations = async (params: {
  content: string
  tone?: string
  emotion?: string
  count?: number
}): Promise<string[]> => {
  return request.post('/api/ai/dialogue/variations', params)
}

/**
 * 检查对话一致性
 */
export const checkDialogueConsistency = async (params: {
  dialogues: Array<{
    content: string
    characters: string[]
    context?: string
  }>
}): Promise<{
  issues: Array<{
    type: string
    description: string
    location: string
    suggestion: string
  }>
  score: number
}> => {
  return request.post('/api/ai/dialogue/check-consistency', params)
}

/**
 * 分析对话风格
 */
export const analyzeDialogueStyle = async (content: string): Promise<{
  tone: {
    overall: string
    variations: Array<{
      segment: string
      tone: string
    }>
  }
  formality: number
  complexity: number
  distinctiveness: number
  patterns: Array<{
    type: string
    examples: string[]
    frequency: number
  }>
  suggestions: string[]
}> => {
  return request.post('/api/ai/dialogue/analyze-style', { content })
}

/**
 * 生成对话摘要
 */
export const summarizeDialogue = async (content: string): Promise<{
  summary: string
  keyPoints: string[]
  emotions: Array<{
    character: string
    emotion: string
    reason: string
  }>
  subtext: string[]
}> => {
  return request.post('/api/ai/dialogue/summarize', { content })
}

/**
 * 改进对话节奏
 */
export const improveDialoguePacing = async (content: string): Promise<{
  improved: string
  changes: Array<{
    type: 'pause' | 'acceleration' | 'emphasis'
    location: string
    reason: string
  }>
  suggestions: string[]
}> => {
  return request.post('/api/ai/dialogue/improve-pacing', { content })
}

/**
 * 增强对话张力
 */
export const enhanceDialogueTension = async (params: {
  content: string
  currentTension: number
  targetTension: number
}): Promise<{
  enhanced: string
  techniques: Array<{
    type: string
    description: string
    effect: string
  }>
  suggestions: string[]
}> => {
  return request.post('/api/ai/dialogue/enhance-tension', params)
}

/**
 * 生成对话冲突
 */
export const generateDialogueConflict = async (params: {
  characters: Array<{
    name: string
    position: string
    motivation: string
  }>
  context: string
  intensity: number
}): Promise<{
  dialogue: string
  analysis: {
    conflictType: string
    progression: string[]
    resolution: string
  }
  variations: string[]
}> => {
  return request.post('/api/ai/dialogue/generate-conflict', params)
} 