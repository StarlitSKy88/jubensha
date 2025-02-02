import { Model } from 'mongoose'
import { Character, ICharacter } from '../models/character.model'
import { nanoid } from 'nanoid'

export class CharacterService {
  private characterModel: Model<ICharacter>

  constructor() {
    this.characterModel = Character
  }

  // 获取角色列表
  async getCharacters(projectId: string): Promise<ICharacter[]> {
    return this.characterModel.find({ projectId }).exec()
  }

  // 获取单个角色
  async getCharacter(id: string): Promise<ICharacter | null> {
    return this.characterModel.findOne({ id }).exec()
  }

  // 创建角色
  async createCharacter(data: Omit<ICharacter, 'id' | 'createdAt' | 'updatedAt'>): Promise<ICharacter> {
    const character = new this.characterModel({
      ...data,
      id: nanoid()
    })
    return character.save()
  }

  // 更新角色
  async updateCharacter(id: string, data: Partial<ICharacter>): Promise<ICharacter | null> {
    return this.characterModel.findOneAndUpdate(
      { id },
      { $set: data },
      { new: true }
    ).exec()
  }

  // 删除角色
  async deleteCharacter(id: string): Promise<boolean> {
    const result = await this.characterModel.deleteOne({ id })
    return result.deletedCount > 0
  }

  // 获取角色关系
  async getCharacterRelationships(characterId: string): Promise<Array<{
    id: string
    sourceId: string
    targetId: string
    type: string
    description: string
  }>> {
    const character = await this.characterModel.findOne({ id: characterId }).exec()
    if (!character) return []

    const relationships = character.relationships.map(rel => ({
      id: nanoid(),
      sourceId: characterId,
      targetId: rel.characterId,
      type: rel.type,
      description: rel.description
    }))

    return relationships
  }

  // 添加角色关系
  async addCharacterRelationship(data: {
    sourceId: string
    targetId: string
    type: string
    description: string
  }): Promise<void> {
    await this.characterModel.updateOne(
      { id: data.sourceId },
      {
        $push: {
          relationships: {
            characterId: data.targetId,
            type: data.type,
            description: data.description
          }
        }
      }
    )
  }

  // 更新角色关系
  async updateCharacterRelationship(sourceId: string, targetId: string, data: {
    type: string
    description: string
  }): Promise<void> {
    await this.characterModel.updateOne(
      { 
        id: sourceId,
        'relationships.characterId': targetId
      },
      {
        $set: {
          'relationships.$.type': data.type,
          'relationships.$.description': data.description
        }
      }
    )
  }

  // 删除角色关系
  async deleteCharacterRelationship(sourceId: string, targetId: string): Promise<void> {
    await this.characterModel.updateOne(
      { id: sourceId },
      {
        $pull: {
          relationships: { characterId: targetId }
        }
      }
    )
  }

  // 分析角色
  async analyzeCharacter(id: string): Promise<ICharacter['analysis']> {
    const character = await this.characterModel.findOne({ id }).exec()
    if (!character) throw new Error('角色不存在')

    // TODO: 调用 AI 服务进行分析
    const analysis = {
      depth: {
        score: 75,
        suggestions: ['完善角色背景故事', '增加性格特征的细节']
      },
      consistency: {
        score: 85,
        issues: ['动机与行为存在轻微不一致']
      },
      development: {
        score: 80,
        analysis: '角色arc发展合理，但可以加强转折点的戏剧性',
        suggestions: ['增加内心冲突', '强化关键决策时刻']
      }
    }

    await this.updateCharacter(id, { analysis })
    return analysis
  }

  // 批量分析角色
  async batchAnalyzeCharacters(projectId: string): Promise<Record<string, ICharacter['analysis']>> {
    const characters = await this.characterModel.find({ projectId }).exec()
    const results: Record<string, ICharacter['analysis']> = {}

    for (const character of characters) {
      results[character.id] = await this.analyzeCharacter(character.id)
    }

    return results
  }

  // 导出角色
  async exportCharacter(id: string): Promise<ICharacter> {
    const character = await this.characterModel.findOne({ id }).exec()
    if (!character) throw new Error('角色不存在')
    return character
  }

  // 导入角色
  async importCharacter(projectId: string, data: Omit<ICharacter, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>): Promise<ICharacter> {
    const character = new this.characterModel({
      ...data,
      id: nanoid(),
      projectId
    })
    return character.save()
  }

  // 复制角色
  async copyCharacter(id: string, projectId: string): Promise<ICharacter> {
    const character = await this.characterModel.findOne({ id }).exec()
    if (!character) throw new Error('角色不存在')

    const { id: _, projectId: __, createdAt, updatedAt, ...data } = character.toJSON()
    return this.importCharacter(projectId, data)
  }

  // 合并角色
  async mergeCharacters(sourceId: string, targetId: string): Promise<void> {
    const [source, target] = await Promise.all([
      this.characterModel.findOne({ id: sourceId }).exec(),
      this.characterModel.findOne({ id: targetId }).exec()
    ])

    if (!source || !target) throw new Error('角色不存在')

    // 合并基本信息
    const mergedData = {
      personality: {
        traits: [...new Set([...target.personality.traits, ...source.personality.traits])],
        strengths: [...new Set([...target.personality.strengths, ...source.personality.strengths])],
        weaknesses: [...new Set([...target.personality.weaknesses, ...source.personality.weaknesses])]
      },
      motivation: {
        goals: [...new Set([...target.motivation.goals, ...source.motivation.goals])],
        fears: [...new Set([...target.motivation.fears, ...source.motivation.fears])],
        desires: [...new Set([...target.motivation.desires, ...source.motivation.desires])]
      },
      arc: {
        keyEvents: [...new Set([...target.arc.keyEvents, ...source.arc.keyEvents])]
      }
    }

    // 更新目标角色
    await this.updateCharacter(targetId, mergedData)

    // 更新关系
    await this.characterModel.updateMany(
      { 'relationships.characterId': sourceId },
      { $set: { 'relationships.$.characterId': targetId } }
    )

    // 删除源角色
    await this.deleteCharacter(sourceId)
  }
} 