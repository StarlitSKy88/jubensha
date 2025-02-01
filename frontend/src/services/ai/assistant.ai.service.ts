import type { Script, Scene, Character, Clue } from '../business/script.service'

// 写作建议类型
export interface WritingAdvice {
  type: '情节' | '角色' | '线索' | '节奏' | '对话' | '氛围'
  content: string
  importance: 1 | 2 | 3
  examples?: string[]
  relatedElements?: string[]
}

// 剧本分析结果
export interface ScriptAnalysis {
  overview: {
    strengths: string[]
    weaknesses: string[]
    suggestions: string[]
  }
  plotAnalysis: {
    structure: string
    pacing: string
    conflicts: string[]
    twists: string[]
    resolution: string
  }
  characterAnalysis: {
    development: Record<string, string>
    relationships: string[]
    motivations: Record<string, string>
    conflicts: string[]
  }
  clueAnalysis: {
    distribution: string
    difficulty: string
    relevance: Record<string, string>
    redHerrings: string[]
  }
}

// 优化建议
export interface OptimizationSuggestion {
  target: string
  currentState: string
  suggestedChanges: string[]
  reasoning: string
  priority: 1 | 2 | 3
}

// AI 助手服务
export class AssistantAIService {
  constructor(private apiKey: string) {}

  // 获取写作建议
  async getWritingAdvice(script: Script): Promise<WritingAdvice[]> {
    const prompt = this.buildWritingAdvicePrompt(script)
    const response = await this.callAI(prompt, {
      temperature: 0.7,
      maxTokens: 1000
    })

    return this.parseWritingAdviceResponse(response)
  }

  // 分析剧本
  async analyzeScript(script: Script): Promise<ScriptAnalysis> {
    const prompt = this.buildScriptAnalysisPrompt(script)
    const response = await this.callAI(prompt, {
      temperature: 0.4,
      maxTokens: 2000
    })

    return this.parseScriptAnalysisResponse(response)
  }

  // 获取优化建议
  async getOptimizationSuggestions(script: Script): Promise<OptimizationSuggestion[]> {
    const prompt = this.buildOptimizationPrompt(script)
    const response = await this.callAI(prompt, {
      temperature: 0.6,
      maxTokens: 1500
    })

    return this.parseOptimizationResponse(response)
  }

  // 改进对话
  async improveDialogue(scene: Scene, characters: Character[]): Promise<string> {
    const prompt = this.buildDialogueImprovementPrompt(scene, characters)
    const response = await this.callAI(prompt, {
      temperature: 0.8,
      maxTokens: 1000
    })

    return response.trim()
  }

  // 优化线索分布
  async optimizeClueDistribution(script: Script): Promise<Map<string, Clue>> {
    const prompt = this.buildClueOptimizationPrompt(script)
    const response = await this.callAI(prompt, {
      temperature: 0.5,
      maxTokens: 1500
    })

    return this.parseClueOptimizationResponse(response)
  }

  // 生成写作提示词
  async generateWritingPrompts(context: string): Promise<string[]> {
    const prompt = this.buildWritingPromptsPrompt(context)
    const response = await this.callAI(prompt, {
      temperature: 0.9,
      maxTokens: 500
    })

    return response.split('\n').filter(Boolean)
  }

  // 构建写作建议提示词
  private buildWritingAdvicePrompt(script: Script): string {
    return `请为这个剧本杀提供写作建议。

剧本信息：
标题：${script.title}
类型：${script.type}
难度：${script.difficulty}
玩家人数：${script.playerCount.min}-${script.playerCount.max}人
时长：${script.duration}分钟

剧情概要：
${script.summary}

角色列表：
${Array.from(script.characters.values()).map(char => `- ${char.name}（${char.occupation}）：${char.background}`).join('\n')}

主要场景：
${Array.from(script.scenes.values()).map(scene => `- ${scene.name}：${scene.description}`).join('\n')}

请从以下方面提供具体的写作建议：
1. 情节发展和结构
2. 角色塑造和互动
3. 线索设计和分布
4. 节奏控制和氛围营造
5. 对话设计和表现力

请以JSON格式返回建议，每条建议包含：
- type: 建议类型（情节/角色/线索/节奏/对话/氛围）
- content: 具体建议内容
- importance: 重要程度（1-3）
- examples: 示例或参考（可选）
- relatedElements: 相关元素（可选）`
  }

  // 构建剧本分析提示词
  private buildScriptAnalysisPrompt(script: Script): string {
    return `请对这个剧本杀进行全面分析。

剧本信息：
标题：${script.title}
类型：${script.type}
难度：${script.difficulty}
玩家人数：${script.playerCount.min}-${script.playerCount.max}人
时长：${script.duration}分钟

背景故事：
${script.background}

角色列表：
${Array.from(script.characters.values()).map(char => `- ${char.name}（${char.occupation}）：${char.background}`).join('\n')}

场景顺序：
${Array.from(script.scenes.values()).map(scene => `- ${scene.name}：${scene.description}`).join('\n')}

线索分布：
${Array.from(script.clues.values()).map(clue => `- ${clue.name}：${clue.description}`).join('\n')}

请从以下方面进行分析：
1. 整体评价（优点、缺点、建议）
2. 剧情分析（结构、节奏、冲突、转折、结局）
3. 角色分析（发展、关系、动机、冲突）
4. 线索分析（分布、难度、相关性、误导）

请以JSON格式返回分析结果，包含：
- overview: 整体评价
- plotAnalysis: 剧情分析
- characterAnalysis: 角色分析
- clueAnalysis: 线索分析`
  }

  // 构建优化建议提示词
  private buildOptimizationPrompt(script: Script): string {
    return `请为这个剧本杀提供优化建议。

剧本信息：
标题：${script.title}
类型：${script.type}
难度：${script.difficulty}

当前状态：
1. 角色设定：
${Array.from(script.characters.values()).map(char => `- ${char.name}：${char.background}`).join('\n')}

2. 场景安排：
${Array.from(script.scenes.values()).map(scene => `- ${scene.name}：${scene.description}`).join('\n')}

3. 线索分布：
${Array.from(script.clues.values()).map(clue => `- ${clue.name}：${clue.description}`).join('\n')}

请提供具体的优化建议，包括：
1. 需要改进的目标
2. 当前状态描述
3. 建议的改变
4. 改进理由
5. 优先级（1-3）

请以JSON格式返回建议，每条建议包含：
- target: 优化目标
- currentState: 当前状态
- suggestedChanges: 建议改变
- reasoning: 改进理由
- priority: 优先级`
  }

  // 构建对话改进提示词
  private buildDialogueImprovementPrompt(scene: Scene, characters: Character[]): string {
    return `请改进这个场景中的对话。

场景信息：
${scene.name}
${scene.description}

参与角色：
${characters.map(char => `- ${char.name}（${char.personality.join('，')}）`).join('\n')}

要求：
1. 对话要符合角色性格
2. 增加情感层次和张力
3. 自然地植入线索
4. 推动剧情发展
5. 营造合适的氛围

请提供改进后的对话内容，包含：
- 人物名称
- 对话内容
- 情感/动作描述`
  }

  // 构建线索优化提示词
  private buildClueOptimizationPrompt(script: Script): string {
    return `请优化这个剧本杀的线索分布。

当前线索：
${Array.from(script.clues.values()).map(clue => `- ${clue.name}（${clue.type}）：${clue.description}`).join('\n')}

场景分布：
${Array.from(script.scenes.values()).map(scene => `- ${scene.name}：${scene.clues.join('，')}`).join('\n')}

请考虑以下因素：
1. 线索的重要性和关联性
2. 发现难度的梯度
3. 分布的均衡性
4. 误导信息的比例
5. 解谜的流畅性

请以JSON格式返回优化后的线索列表，每个线索包含：
- id: 线索ID
- name: 线索名称
- description: 描述
- type: 类型
- relatedCharacters: 相关角色
- discoveryConditions: 发现条件
- importance: 重要程度
- isKey: 是否关键`
  }

  // 构建写作提示词生成提示词
  private buildWritingPromptsPrompt(context: string): string {
    return `请根据以下背景生成写作提示。

背景：
${context}

要求：
1. 提示要具体且有启发性
2. 包含不同方面的考虑
3. 有助于拓展思路
4. 符合剧本杀的特点
5. 便于实际操作

请生成5-10个写作提示，每个提示一行。`
  }

  // 调用 AI API
  private async callAI(prompt: string, config: { temperature: number; maxTokens: number }): Promise<string> {
    try {
      const response = await fetch('https://api.openai.com/v1/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          prompt,
          temperature: config.temperature,
          max_tokens: config.maxTokens
        })
      })

      if (!response.ok) {
        throw new Error('AI API 调用失败')
      }

      const data = await response.json()
      return data.choices[0].text
    } catch (error) {
      console.error('AI 助手服务错误：', error)
      throw new Error('AI 助手服务暂时不可用')
    }
  }

  // 解析写作建议响应
  private parseWritingAdviceResponse(response: string): WritingAdvice[] {
    try {
      return JSON.parse(response)
    } catch (error) {
      throw new Error('写作建议解析失败')
    }
  }

  // 解析剧本分析响应
  private parseScriptAnalysisResponse(response: string): ScriptAnalysis {
    try {
      return JSON.parse(response)
    } catch (error) {
      throw new Error('剧本分析结果解析失败')
    }
  }

  // 解析优化建议响应
  private parseOptimizationResponse(response: string): OptimizationSuggestion[] {
    try {
      return JSON.parse(response)
    } catch (error) {
      throw new Error('优化建议解析失败')
    }
  }

  // 解析线索优化响应
  private parseClueOptimizationResponse(response: string): Map<string, Clue> {
    try {
      const data = JSON.parse(response)
      return new Map(Object.entries(data))
    } catch (error) {
      throw new Error('线索优化结果解析失败')
    }
  }
}