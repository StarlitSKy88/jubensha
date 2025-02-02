import request from '@/utils/request'
import type { ICharacter } from '@/types/character'
import { Configuration, OpenAIApi } from 'openai'

const configuration = new Configuration({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY
})

const openai = new OpenAIApi(configuration)

export interface CharacterSuggestion {
  id: string
  name: string
  role: 'protagonist' | 'antagonist' | 'supporting'
  archetype: string
  personality: {
    traits: string[]
    mbti?: string
    strengths: string[]
    weaknesses: string[]
  }
  background: {
    age: number
    occupation: string
    education?: string
    family?: string
    history: string
  }
  appearance: {
    physical: string[]
    style: string[]
    distinctive: string[]
  }
  motivation: {
    goals: string[]
    fears: string[]
    desires: string[]
  }
  relationships: Array<{
    characterId: string
    type: string
    description: string
  }>
  arc: {
    startingPoint: string
    keyEvents: string[]
    endingPoint: string
  }
  confidence: number
  createdAt: string
}

export interface CharacterAnalysis {
  depth: {
    score: number
    suggestions: string[]
  }
  consistency: {
    score: number
    issues: string[]
  }
  development: {
    score: number
    analysis: string
    suggestions: string[]
  }
  relationships: {
    score: number
    dynamics: Array<{
      characters: string[]
      type: string
      strength: number
      suggestions: string[]
    }>
  }
}

/**
 * 获取角色建议
 */
export const getCharacterSuggestions = async (params: {
  content: string
  role?: CharacterSuggestion['role']
  context?: string
  existingCharacters?: string[]
}): Promise<CharacterSuggestion[]> => {
  return request.post('/api/ai/character/suggestions', params)
}

/**
 * 分析角色
 */
export const analyzeCharacter = async (params: {
  characterId: string
  content: string
}): Promise<CharacterAnalysis> => {
  return request.post('/api/ai/character/analyze', params)
}

/**
 * 生成角色背景
 */
export const generateCharacterBackground = async (params: {
  name: string
  role: CharacterSuggestion['role']
  traits?: string[]
  context?: string
}): Promise<{
  background: CharacterSuggestion['background']
  suggestions: string[]
}> => {
  return request.post('/api/ai/character/background', params)
}

/**
 * 生成角色对话
 */
export const generateCharacterDialogue = async (params: {
  characterId: string
  context: string
  emotion?: string
  targetCharacterId?: string
}): Promise<{
  dialogue: string
  tone: string
  subtext: string
}> => {
  return request.post('/api/ai/character/dialogue', params)
}

/**
 * 检查角色冲突
 */
export const checkCharacterConflicts = async (characters: string[]): Promise<{
  conflicts: Array<{
    characters: string[]
    type: string
    severity: number
    suggestion: string
  }>
  suggestions: string[]
}> => {
  return request.post('/api/ai/character/check-conflicts', { characters })
}

/**
 * 优化角色关系
 */
export const optimizeCharacterRelationships = async (params: {
  characters: string[]
  focus: 'conflict' | 'romance' | 'friendship' | 'family'
}): Promise<{
  relationships: Array<{
    characters: string[]
    type: string
    dynamics: string
    development: string[]
  }>
  suggestions: string[]
}> => {
  return request.post('/api/ai/character/optimize-relationships', params)
}

// 分析角色深度
export async function analyzeCharacterDepth(character: ICharacter) {
  const prompt = `分析以下角色的深度：
角色名称：${character.name}
角色类型：${character.role}
原型：${character.archetype}
性格特征：${character.personality.traits.join('、')}
背景：${character.background.history || '无'}
动机：
- 目标：${character.motivation.goals.join('、')}
- 恐惧：${character.motivation.fears.join('、')}
- 欲望：${character.motivation.desires.join('、')}

请从以下几个方面进行分析：
1. 角色的复杂性和多维度性
2. 内在冲突和矛盾
3. 心理深度和情感层次
4. 成长潜力和发展空间

请给出0-100的评分，并详细说明理由。`

  const response = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: '你是一个专业的角色分析师，擅长分析故事中角色的深度。' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 1000
  })

  const content = response.data.choices[0].message?.content || ''
  const scoreMatch = content.match(/(\d+)/)
  const score = scoreMatch ? parseInt(scoreMatch[1]) : 0

  return {
    score,
    details: content
  }
}

// 分析角色一致性
export async function analyzeCharacterConsistency(character: ICharacter) {
  const prompt = `分析以下角色的一致性：
角色名称：${character.name}
角色类型：${character.role}
原型：${character.archetype}
性格特征：${character.personality.traits.join('、')}
优点：${character.personality.strengths.join('、')}
缺点：${character.personality.weaknesses.join('、')}
背景：${character.background.history || '无'}
动机：
- 目标：${character.motivation.goals.join('、')}
- 恐惧：${character.motivation.fears.join('、')}
- 欲望：${character.motivation.desires.join('、')}
角色弧光：
- 起点：${character.arc.startingPoint || '无'}
- 关键事件：${character.arc.keyEvents.join('、')}
- 终点：${character.arc.endingPoint || '无'}

请从以下几个方面进行分析：
1. 性格特征的内在逻辑
2. 动机与行为的一致性
3. 背景与性格的关联性
4. 发展轨迹的合理性

请给出0-100的评分，并详细说明理由。`

  const response = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: '你是一个专业的角色分析师，擅长分析故事中角色的一致性。' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 1000
  })

  const content = response.data.choices[0].message?.content || ''
  const scoreMatch = content.match(/(\d+)/)
  const score = scoreMatch ? parseInt(scoreMatch[1]) : 0

  return {
    score,
    details: content
  }
}

// 分析角色发展
export async function analyzeCharacterDevelopment(character: ICharacter) {
  const prompt = `分析以下角色的发展：
角色名称：${character.name}
角色类型：${character.role}
原型：${character.archetype}
角色弧光：
- 起点：${character.arc.startingPoint || '无'}
- 关键事件：${character.arc.keyEvents.join('、')}
- 终点：${character.arc.endingPoint || '无'}
性格特征：${character.personality.traits.join('、')}
动机：
- 目标：${character.motivation.goals.join('、')}
- 恐惧：${character.motivation.fears.join('、')}
- 欲望：${character.motivation.desires.join('、')}

请从以下几个方面进行分析：
1. 角色成长的幅度
2. 转变的触发点和必然性
3. 内在和外在的变化
4. 发展的完整性和说服力

请给出0-100的评分，并详细说明理由。`

  const response = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: '你是一个专业的角色分析师，擅长分析故事中角色的发展。' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 1000
  })

  const content = response.data.choices[0].message?.content || ''
  const scoreMatch = content.match(/(\d+)/)
  const score = scoreMatch ? parseInt(scoreMatch[1]) : 0

  return {
    score,
    details: content
  }
}

// 获取角色建议
export async function getCharacterSuggestions(params: {
  role: string
  traits: string[]
  context: string
}): Promise<ICharacter[]> {
  const prompt = `根据以下条件生成角色建议：
角色类型：${params.role}
期望特征：${params.traits.join('、')}
背景描述：${params.context}

请生成3个符合条件的角色建议，每个角色包含以下信息：
1. 基本信息（姓名、原型）
2. 性格特征（性格、优点、缺点）
3. 背景设定（年龄、职业、教育、家庭、历史）
4. 动机（目标、恐惧、欲望）
5. 发展轨迹（起点、关键事件、终点）

要求：
1. 角色形象鲜明，具有独特性
2. 性格特征符合设定，富有层次感
3. 背景合理，与性格相互印证
4. 动机明确，具有推动力
5. 发展轨迹完整，富有戏剧性`

  const response = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: '你是一个专业的角色设计师，擅长创造富有深度和魅力的角色。' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.8,
    max_tokens: 2000
  })

  const content = response.data.choices[0].message?.content || ''
  
  // TODO: 解析返回的内容，转换为角色对象
  // 这里需要实现一个解析器，将 AI 生成的文本转换为结构化的角色数据
  
  return []
}

// 解析角色建议
function parseCharacterSuggestion(text: string): ICharacter | null {
  try {
    // 基本信息匹配
    const nameMatch = text.match(/姓名：(.+)/)
    const archetypeMatch = text.match(/原型：(.+)/)
    
    // 性格特征匹配
    const traitsMatch = text.match(/性格特征：(.+)/)
    const strengthsMatch = text.match(/优点：(.+)/)
    const weaknessesMatch = text.match(/缺点：(.+)/)
    
    // 背景匹配
    const ageMatch = text.match(/年龄：(\d+)/)
    const occupationMatch = text.match(/职业：(.+)/)
    const educationMatch = text.match(/教育：(.+)/)
    const familyMatch = text.match(/家庭：(.+)/)
    const historyMatch = text.match(/历史：(.+)/)
    
    // 动机匹配
    const goalsMatch = text.match(/目标：(.+)/)
    const fearsMatch = text.match(/恐惧：(.+)/)
    const desiresMatch = text.match(/欲望：(.+)/)
    
    // 发展轨迹匹配
    const startingPointMatch = text.match(/起点：(.+)/)
    const keyEventsMatch = text.match(/关键事件：(.+)/)
    const endingPointMatch = text.match(/终点：(.+)/)
    
    if (!nameMatch || !archetypeMatch) return null
    
    return {
      name: nameMatch[1].trim(),
      archetype: archetypeMatch[1].trim(),
      personality: {
        traits: traitsMatch ? traitsMatch[1].split('、').map(s => s.trim()) : [],
        strengths: strengthsMatch ? strengthsMatch[1].split('、').map(s => s.trim()) : [],
        weaknesses: weaknessMatch ? weaknessMatch[1].split('、').map(s => s.trim()) : []
      },
      background: {
        age: ageMatch ? parseInt(ageMatch[1]) : undefined,
        occupation: occupationMatch ? occupationMatch[1].trim() : undefined,
        education: educationMatch ? educationMatch[1].trim() : undefined,
        family: familyMatch ? familyMatch[1].trim() : undefined,
        history: historyMatch ? historyMatch[1].trim() : undefined
      },
      motivation: {
        goals: goalsMatch ? goalsMatch[1].split('、').map(s => s.trim()) : [],
        fears: fearsMatch ? fearsMatch[1].split('、').map(s => s.trim()) : [],
        desires: desiresMatch ? desiresMatch[1].split('、').map(s => s.trim()) : []
      },
      arc: {
        startingPoint: startingPointMatch ? startingPointMatch[1].trim() : undefined,
        keyEvents: keyEventsMatch ? keyEventsMatch[1].split('、').map(s => s.trim()) : [],
        endingPoint: endingPointMatch ? endingPointMatch[1].trim() : undefined
      }
    } as ICharacter
  } catch (error) {
    console.error('解析角色建议失败:', error)
    return null
  }
} 