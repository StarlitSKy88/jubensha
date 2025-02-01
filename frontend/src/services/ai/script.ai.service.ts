import type { Character, Scene, Clue, Script } from '../business/script.service'

// AI 生成配置
interface GenerationConfig {
  temperature: number
  maxTokens: number
  topP: number
  frequencyPenalty: number
  presencePenalty: number
}

// 角色生成参数
interface CharacterGenerationParams {
  scriptType: Script['type']
  existingCharacters?: Character[]
  backgroundInfo?: string
  constraints?: string[]
}

// 场景生成参数
interface SceneGenerationParams {
  characters: Character[]
  previousScenes?: Scene[]
  clues?: Clue[]
  requirements?: string[]
}

// 线索生成参数
interface ClueGenerationParams {
  characters: Character[]
  scenes: Scene[]
  existingClues?: Clue[]
  keyPlotPoints?: string[]
}

// 对话生成参数
interface DialogueGenerationParams {
  characters: Character[]
  scene: Scene
  context: string
  emotionalState?: Record<string, string>
}

// AI 服务
export class ScriptAIService {
  private defaultConfig: GenerationConfig = {
    temperature: 0.8,
    maxTokens: 2000,
    topP: 0.9,
    frequencyPenalty: 0.3,
    presencePenalty: 0.3
  }

  constructor(private apiKey: string) {}

  // 生成角色
  async generateCharacter(params: CharacterGenerationParams): Promise<Omit<Character, 'id'>> {
    const prompt = this.buildCharacterPrompt(params)
    const response = await this.callAI(prompt, {
      ...this.defaultConfig,
      temperature: 0.9
    })

    return this.parseCharacterResponse(response)
  }

  // 生成场景
  async generateScene(params: SceneGenerationParams): Promise<Omit<Scene, 'id'>> {
    const prompt = this.buildScenePrompt(params)
    const response = await this.callAI(prompt, {
      ...this.defaultConfig,
      temperature: 0.85
    })

    return this.parseSceneResponse(response)
  }

  // 生成线索
  async generateClue(params: ClueGenerationParams): Promise<Omit<Clue, 'id'>> {
    const prompt = this.buildCluePrompt(params)
    const response = await this.callAI(prompt, {
      ...this.defaultConfig,
      temperature: 0.75
    })

    return this.parseClueResponse(response)
  }

  // 生成对话
  async generateDialogue(params: DialogueGenerationParams): Promise<string> {
    const prompt = this.buildDialoguePrompt(params)
    const response = await this.callAI(prompt, {
      ...this.defaultConfig,
      temperature: 0.9,
      maxTokens: 1000
    })

    return this.parseDialogueResponse(response)
  }

  // 检查剧情合理性
  async checkPlotConsistency(script: Script): Promise<{
    isConsistent: boolean
    issues: string[]
    suggestions: string[]
  }> {
    const prompt = this.buildConsistencyCheckPrompt(script)
    const response = await this.callAI(prompt, {
      ...this.defaultConfig,
      temperature: 0.3
    })

    return this.parseConsistencyResponse(response)
  }

  // 优化线索分布
  async optimizeClueDistribution(script: Script): Promise<{
    optimizedClues: Map<string, Clue>
    changes: string[]
    reasoning: string
  }> {
    const prompt = this.buildClueOptimizationPrompt(script)
    const response = await this.callAI(prompt, {
      ...this.defaultConfig,
      temperature: 0.4
    })

    return this.parseClueOptimizationResponse(response)
  }

  // 生成剧本摘要
  async generateSummary(script: Script): Promise<string> {
    const prompt = this.buildSummaryPrompt(script)
    const response = await this.callAI(prompt, {
      ...this.defaultConfig,
      temperature: 0.6,
      maxTokens: 500
    })

    return response.trim()
  }

  // 构建角色生成提示词
  private buildCharacterPrompt(params: CharacterGenerationParams): string {
    return `请为一个${params.scriptType}类型的剧本杀创作一个角色。

背景信息：
${params.backgroundInfo || '无特定背景要求'}

已有角色：
${params.existingCharacters?.map(char => `- ${char.name}：${char.background}`).join('\n') || '暂无其他角色'}

特殊要求：
${params.constraints?.join('\n') || '无特殊要求'}

请创建一个符合以下要求的角色：
1. 性格鲜明，具有独特性
2. 与剧情和其他角色有紧密联系
3. 具有合理的动机和目标
4. 包含一些有趣的秘密或隐藏特质
5. 职业和背景要符合剧本类型

请以JSON格式返回角色信息，包含以下字段：
- name: 角色名称
- age: 年龄
- gender: 性别（男/女/其他）
- occupation: 职业
- background: 背景故事
- personality: 性格特征（数组）
- relationships: 与其他角色的关系（Map）
- secrets: 隐藏的秘密（数组）
- goals: 个人目标（数组）
- items: 随身物品（数组）`
  }

  // 构建场景生成提示词
  private buildScenePrompt(params: SceneGenerationParams): string {
    return `请为剧本杀创作一个场景。

参与角色：
${params.characters.map(char => `- ${char.name}（${char.occupation}）`).join('\n')}

已有场景：
${params.previousScenes?.map(scene => `- ${scene.name}：${scene.description}`).join('\n') || '暂无其他场景'}

现有线索：
${params.clues?.map(clue => `- ${clue.name}：${clue.description}`).join('\n') || '暂无相关线索'}

特殊要求：
${params.requirements?.join('\n') || '无特殊要求'}

请创建一个符合以下要求的场景：
1. 场景描述要具体且富有氛围感
2. 合理安排参与角色的互动
3. 设置合适的线索分布
4. 创造紧张或戏剧性的情节
5. 为后续剧情发展埋下伏笔

请以JSON格式返回场景信息，包含以下字段：
- name: 场景名称
- description: 场景描述
- location: 具体地点
- time: 发生时间
- participants: 参与角色ID数组
- clues: 可发现的线索ID数组
- events: 场景中的事件数组
- requirements: 触发条件数组
- nextScenes: 可能的后续场景ID数组`
  }

  // 构建线索生成提示词
  private buildCluePrompt(params: ClueGenerationParams): string {
    return `请为剧本杀创作一个线索。

相关角色：
${params.characters.map(char => `- ${char.name}：${char.background}`).join('\n')}

现有场景：
${params.scenes.map(scene => `- ${scene.name}：${scene.description}`).join('\n')}

已有线索：
${params.existingClues?.map(clue => `- ${clue.name}：${clue.description}`).join('\n') || '暂无其他线索'}

关键剧情点：
${params.keyPlotPoints?.join('\n') || '暂无特定剧情要求'}

请创建一个符合以下要求的线索：
1. 线索要具有明确的指向性
2. 与角色和场景紧密相关
3. 难度要适中，既不能过于明显也不能过于隐蔽
4. 可以包含误导性信息，但必须合理
5. 要能推动剧情发展

请以JSON格式返回线索信息，包含以下字段：
- name: 线索名称
- description: 线索描述
- type: 线索类型（物品/对话/场景/文档）
- relatedCharacters: 相关角色ID数组
- discoveryConditions: 发现条件数组
- importance: 重要程度（1-5）
- isKey: 是否为关键线索`
  }

  // 构建对话生成提示词
  private buildDialoguePrompt(params: DialogueGenerationParams): string {
    return `请为剧本杀创作一段对话。

场景信息：
${params.scene.name}
${params.scene.description}

参与角色：
${params.characters.map(char => `- ${char.name}（${char.occupation}）：${char.personality.join('，')}`).join('\n')}

情感状态：
${Object.entries(params.emotionalState || {}).map(([name, state]) => `- ${name}：${state}`).join('\n')}

上下文：
${params.context}

请创建一段符合以下要求的对话：
1. 对话要自然流畅，符合角色性格
2. 体现角色之间的关系和冲突
3. 包含适当的情感表达
4. 可以埋藏线索或误导信息
5. 推动剧情发展

请以剧本对话的格式返回，包含人物名称、对话内容和简单的动作描述。`
  }

  // 构建剧情合理性检查提示词
  private buildConsistencyCheckPrompt(script: Script): string {
    return `请检查这个剧本杀的剧情合理性。

剧本信息：
标题：${script.title}
类型：${script.type}
难度：${script.difficulty}
玩家人数：${script.playerCount.min}-${script.playerCount.max}人
时长：${script.duration}分钟

角色列表：
${Array.from(script.characters.values()).map(char => `- ${char.name}（${char.occupation}）：${char.background}`).join('\n')}

场景顺序：
${Array.from(script.scenes.values()).map(scene => `- ${scene.name}：${scene.description}`).join('\n')}

线索分布：
${Array.from(script.clues.values()).map(clue => `- ${clue.name}：${clue.description}`).join('\n')}

请检查以下方面：
1. 角色动机的合理性
2. 剧情发展的逻辑性
3. 线索分布的平衡性
4. 时间线的连贯性
5. 结局的可达性

请以JSON格式返回检查结果，包含以下字段：
- isConsistent: 是否合理（布尔值）
- issues: 发现的问题（数组）
- suggestions: 改进建议（数组）`
  }

  // 构建线索优化提示词
  private buildClueOptimizationPrompt(script: Script): string {
    return `请优化这个剧本杀的线索分布。

剧本信息：
标题：${script.title}
类型：${script.type}
难度：${script.difficulty}

当前线索分布：
${Array.from(script.clues.values()).map(clue => `- ${clue.name}（重要度：${clue.importance}）：${clue.description}`).join('\n')}

场景信息：
${Array.from(script.scenes.values()).map(scene => `- ${scene.name}：${scene.clues.join('，')}`).join('\n')}

请优化以下方面：
1. 线索的重要程度分配
2. 线索的场景分布
3. 线索间的关联性
4. 发现难度的梯度
5. 误导信息的比例

请以JSON格式返回优化结果，包含以下字段：
- optimizedClues: 优化后的线索Map
- changes: 变更说明数组
- reasoning: 优化理由`
  }

  // 构建摘要生成提示词
  private buildSummaryPrompt(script: Script): string {
    return `请为这个剧本杀生成一个简洁的摘要。

剧本信息：
标题：${script.title}
类型：${script.type}
难度：${script.difficulty}
玩家人数：${script.playerCount.min}-${script.playerCount.max}人
时长：${script.duration}分钟

背景故事：
${script.background}

主要角色：
${Array.from(script.characters.values()).map(char => `- ${char.name}（${char.occupation}）`).join('\n')}

关键剧情：
${script.timeline.join('\n')}

请生成一个200字左右的摘要，包含以下要素：
1. 故事背景
2. 主要角色
3. 核心冲突
4. 特色亮点
5. 游戏难度`
  }

  // 调用 AI API
  private async callAI(prompt: string, config: GenerationConfig): Promise<string> {
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
          ...config
        })
      })

      if (!response.ok) {
        throw new Error('AI API 调用失败')
      }

      const data = await response.json()
      return data.choices[0].text
    } catch (error) {
      console.error('AI 服务错误：', error)
      throw new Error('AI 服务暂时不可用')
    }
  }

  // 解析角色响应
  private parseCharacterResponse(response: string): Omit<Character, 'id'> {
    try {
      const data = JSON.parse(response)
      return {
        name: data.name,
        age: data.age,
        gender: data.gender,
        occupation: data.occupation,
        background: data.background,
        personality: data.personality,
        relationships: new Map(Object.entries(data.relationships)),
        secrets: data.secrets,
        goals: data.goals,
        items: data.items
      }
    } catch (error) {
      throw new Error('角色数据解析失败')
    }
  }

  // 解析场景响应
  private parseSceneResponse(response: string): Omit<Scene, 'id'> {
    try {
      const data = JSON.parse(response)
      return {
        name: data.name,
        description: data.description,
        location: data.location,
        time: data.time,
        participants: data.participants,
        clues: data.clues,
        events: data.events,
        requirements: data.requirements,
        nextScenes: data.nextScenes
      }
    } catch (error) {
      throw new Error('场景数据解析失败')
    }
  }

  // 解析线索响应
  private parseClueResponse(response: string): Omit<Clue, 'id'> {
    try {
      const data = JSON.parse(response)
      return {
        name: data.name,
        description: data.description,
        type: data.type,
        relatedCharacters: data.relatedCharacters,
        discoveryConditions: data.discoveryConditions,
        importance: data.importance,
        isKey: data.isKey
      }
    } catch (error) {
      throw new Error('线索数据解析失败')
    }
  }

  // 解析对话响应
  private parseDialogueResponse(response: string): string {
    return response.trim()
  }

  // 解析一致性检查响应
  private parseConsistencyResponse(response: string): {
    isConsistent: boolean
    issues: string[]
    suggestions: string[]
  } {
    try {
      return JSON.parse(response)
    } catch (error) {
      throw new Error('一致性检查结果解析失败')
    }
  }

  // 解析线索优化响应
  private parseClueOptimizationResponse(response: string): {
    optimizedClues: Map<string, Clue>
    changes: string[]
    reasoning: string
  } {
    try {
      const data = JSON.parse(response)
      return {
        optimizedClues: new Map(Object.entries(data.optimizedClues)),
        changes: data.changes,
        reasoning: data.reasoning
      }
    } catch (error) {
      throw new Error('线索优化结果解析失败')
    }
  }
}