import { Model } from 'mongoose'
import { ICharacter } from '../models/character.model'
import { BusinessError } from '../utils/errors'
import { validateId } from '../utils/validators'
import { nanoid } from 'nanoid'

export class CharacterService {
  private characterModel: Model<ICharacter>

  constructor() {
    this.characterModel = require('../models/character.model').Character
  }

  /**
   * 获取角色列表
   */
  async getCharacters(projectId: string): Promise<ICharacter[]> {
    return this.characterModel.find({ projectId }).sort({ createdAt: -1 })
  }

  /**
   * 获取单个角色
   */
  async getCharacter(id: string): Promise<ICharacter | null> {
    if (!validateId(id)) {
      throw new BusinessError('VALIDATION_ERROR', '无效的角色ID', 400)
    }
    return this.characterModel.findOne({ id })
  }

  /**
   * 创建角色
   */
  async createCharacter(data: Omit<ICharacter, 'id' | 'createdAt' | 'updatedAt'>): Promise<ICharacter> {
    // 验证必填字段
    if (!data.name || !data.role) {
      throw new BusinessError('VALIDATION_ERROR', '角色名称和类型为必填项', 400)
    }

    // 检查同名角色
    const existingCharacter = await this.characterModel.findOne({
      projectId: data.projectId,
      name: data.name
    })

    if (existingCharacter) {
      throw new BusinessError('CONFLICT', '角色名称已存在', 409)
    }

    // 创建角色
    const character = new this.characterModel(data)
    return character.save()
  }

  /**
   * 更新角色
   */
  async updateCharacter(id: string, data: Partial<ICharacter>): Promise<ICharacter | null> {
    if (!validateId(id)) {
      throw new BusinessError('VALIDATION_ERROR', '无效的角色ID', 400)
    }

    // 检查角色是否存在
    const character = await this.characterModel.findOne({ id })
    if (!character) {
      throw new BusinessError('NOT_FOUND', '角色不存在', 404)
    }

    // 如果更新名称，检查是否重复
    if (data.name && data.name !== character.name) {
      const existingCharacter = await this.characterModel.findOne({
        projectId: character.projectId,
        name: data.name,
        id: { $ne: id }
      })

      if (existingCharacter) {
        throw new BusinessError('CONFLICT', '角色名称已存在', 409)
      }
    }

    // 更新角色
    return this.characterModel.findOneAndUpdate(
      { id },
      { $set: data },
      { new: true, runValidators: true }
    )
  }

  /**
   * 删除角色
   */
  async deleteCharacter(id: string): Promise<boolean> {
    if (!validateId(id)) {
      throw new BusinessError('VALIDATION_ERROR', '无效的角色ID', 400)
    }

    const result = await this.characterModel.deleteOne({ id })
    return result.deletedCount > 0
  }

  /**
   * 获取角色关系
   */
  async getCharacterRelationships(characterId: string): Promise<Array<{
    id: string
    sourceId: string
    targetId: string
    type: string
    description: string
  }>> {
    const character = await this.characterModel.findOne({ id: characterId })
    if (!character) {
      throw new BusinessError('NOT_FOUND', '角色不存在', 404)
    }

    return character.relationships.map(r => ({
      id: `${characterId}-${r.characterId}`,
      sourceId: characterId,
      targetId: r.characterId,
      type: r.type,
      description: r.description
    }))
  }

  /**
   * 添加角色关系
   */
  async addCharacterRelationship(data: {
    sourceId: string
    targetId: string
    type: string
    description: string
  }): Promise<void> {
    // 检查源角色和目标角色是否存在
    const [sourceCharacter, targetCharacter] = await Promise.all([
      this.characterModel.findOne({ id: data.sourceId }),
      this.characterModel.findOne({ id: data.targetId })
    ])

    if (!sourceCharacter || !targetCharacter) {
      throw new BusinessError('NOT_FOUND', '角色不存在', 404)
    }

    // 检查关系是否已存在
    const existingRelationship = sourceCharacter.relationships.find(
      r => r.characterId === data.targetId
    )

    if (existingRelationship) {
      throw new BusinessError('CONFLICT', '角色关系已存在', 409)
    }

    // 添加关系
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

  /**
   * 更新角色关系
   */
  async updateCharacterRelationship(sourceId: string, targetId: string, data: {
    type: string
    description: string
  }): Promise<void> {
    // 检查源角色是否存在
    const sourceCharacter = await this.characterModel.findOne({ id: sourceId })
    if (!sourceCharacter) {
      throw new BusinessError('NOT_FOUND', '角色不存在', 404)
    }

    // 检查关系是否存在
    const relationshipIndex = sourceCharacter.relationships.findIndex(
      r => r.characterId === targetId
    )

    if (relationshipIndex === -1) {
      throw new BusinessError('NOT_FOUND', '角色关系不存在', 404)
    }

    // 更新关系
    await this.characterModel.updateOne(
      { id: sourceId, 'relationships.characterId': targetId },
      {
        $set: {
          'relationships.$.type': data.type,
          'relationships.$.description': data.description
        }
      }
    )
  }

  /**
   * 删除角色关系
   */
  async deleteCharacterRelationship(sourceId: string, targetId: string): Promise<void> {
    // 检查源角色是否存在
    const sourceCharacter = await this.characterModel.findOne({ id: sourceId })
    if (!sourceCharacter) {
      throw new BusinessError('NOT_FOUND', '角色不存在', 404)
    }

    // 删除关系
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