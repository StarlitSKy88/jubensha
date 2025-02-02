import request from '@/utils/request'
import type { CharacterSuggestion } from './ai/character.service'
import { Model } from 'mongoose'
import { nanoid } from 'nanoid'
import { Character } from '../models/character.model'
import type { ICharacter, ICharacterRelationship } from '@/types/character'
import { analyzeCharacterDepth, analyzeCharacterConsistency, analyzeCharacterDevelopment } from './ai/character.service'

export interface Character extends CharacterSuggestion {
  avatar?: string
  projectId: string
  analysis: {
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
  }
}

/**
 * 获取角色列表
 */
export const getCharacters = (projectId: string): Promise<Character[]> => {
  return request.get(`/api/characters`, { params: { projectId } })
}

/**
 * 获取角色详情
 */
export const getCharacter = (id: string): Promise<Character> => {
  return request.get(`/api/characters/${id}`)
}

/**
 * 创建角色
 */
export const createCharacter = (data: Omit<Character, 'id' | 'createdAt' | 'analysis'>): Promise<Character> => {
  return request.post('/api/characters', data)
}

/**
 * 更新角色
 */
export const updateCharacter = (id: string, data: Partial<Character>): Promise<void> => {
  return request.put(`/api/characters/${id}`, data)
}

/**
 * 删除角色
 */
export const deleteCharacter = (id: string): Promise<void> => {
  return request.delete(`/api/characters/${id}`)
}

/**
 * 获取角色关系
 */
export const getCharacterRelationships = (characterId: string): Promise<Array<{
  id: string
  sourceId: string
  targetId: string
  type: string
  description: string
}>> => {
  return request.get(`/api/characters/${characterId}/relationships`)
}

/**
 * 创建角色关系
 */
export const createCharacterRelationship = (data: {
  sourceId: string
  targetId: string
  type: string
  description: string
}): Promise<void> => {
  return request.post('/api/character-relationships', data)
}

/**
 * 更新角色关系
 */
export const updateCharacterRelationship = (id: string, data: {
  type: string
  description: string
}): Promise<void> => {
  return request.put(`/api/character-relationships/${id}`, data)
}

/**
 * 删除角色关系
 */
export const deleteCharacterRelationship = (id: string): Promise<void> => {
  return request.delete(`/api/character-relationships/${id}`)
}

/**
 * 分析角色
 */
export const analyzeCharacter = (id: string): Promise<Character['analysis']> => {
  return request.post(`/api/characters/${id}/analyze`)
}

/**
 * 批量分析角色
 */
export const batchAnalyzeCharacters = (ids: string[]): Promise<Record<string, Character['analysis']>> => {
  return request.post('/api/characters/batch-analyze', { ids })
}

/**
 * 导出角色设定
 */
export const exportCharacter = (id: string, format: 'md' | 'pdf' = 'md'): Promise<Blob> => {
  return request.get(`/api/characters/${id}/export`, {
    params: { format },
    responseType: 'blob'
  })
}

/**
 * 导入角色设定
 */
export const importCharacter = (projectId: string, file: File): Promise<Character> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('projectId', projectId)
  return request.post('/api/characters/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 复制角色
 */
export const copyCharacter = (id: string, projectId: string): Promise<Character> => {
  return request.post(`/api/characters/${id}/copy`, { projectId })
}

/**
 * 合并角色
 */
export const mergeCharacters = (sourceId: string, targetId: string): Promise<void> => {
  return request.post('/api/characters/merge', { sourceId, targetId })
}

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

  // 分析角色
  async analyzeCharacter(id: string): Promise<ICharacter | null> {
    const character = await this.getCharacter(id)
    if (!character) return null

    const analysis = {
      depth: await analyzeCharacterDepth(character),
      consistency: await analyzeCharacterConsistency(character),
      development: await analyzeCharacterDevelopment(character)
    }

    return this.updateCharacter(id, { analysis })
  }

  // 批量分析角色
  async batchAnalyzeCharacters(ids?: string[]): Promise<ICharacter[]> {
    const query = ids ? { id: { $in: ids } } : {}
    const characters = await this.characterModel.find(query).exec()
    
    const analyzedCharacters = await Promise.all(
      characters.map(async character => {
        const analysis = {
          depth: await analyzeCharacterDepth(character),
          consistency: await analyzeCharacterConsistency(character),
          development: await analyzeCharacterDevelopment(character)
        }
        return this.updateCharacter(character.id, { analysis })
      })
    )

    return analyzedCharacters.filter((char): char is ICharacter => char !== null)
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
  async addCharacterRelationship(
    characterId: string,
    relationship: ICharacterRelationship
  ): Promise<ICharacter | null> {
    return this.characterModel.findOneAndUpdate(
      { id: characterId },
      { $push: { relationships: relationship } },
      { new: true }
    ).exec()
  }

  // 更新角色关系
  async updateCharacterRelationship(
    characterId: string,
    targetId: string,
    data: Partial<ICharacterRelationship>
  ): Promise<ICharacter | null> {
    return this.characterModel.findOneAndUpdate(
      {
        id: characterId,
        'relationships.characterId': targetId
      },
      {
        $set: {
          'relationships.$.type': data.type,
          'relationships.$.description': data.description
        }
      },
      { new: true }
    ).exec()
  }

  // 删除角色关系
  async deleteCharacterRelationship(
    characterId: string,
    targetId: string
  ): Promise<ICharacter | null> {
    return this.characterModel.findOneAndUpdate(
      { id: characterId },
      { $pull: { relationships: { characterId: targetId } } },
      { new: true }
    ).exec()
  }
} 