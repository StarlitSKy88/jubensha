import { Request, Response } from 'express'
import { CharacterService } from '../services/character.service'
import { ICharacter } from '../models/character.model'

export class CharacterController {
  private characterService: CharacterService

  constructor() {
    this.characterService = new CharacterService()
  }

  // 获取角色列表
  async getCharacters(req: Request, res: Response) {
    try {
      const { projectId } = req.query
      if (!projectId) {
        return res.status(400).json({ message: '缺少项目ID' })
      }
      const characters = await this.characterService.getCharacters(projectId as string)
      res.json(characters)
    } catch (error) {
      res.status(500).json({ message: '获取角色列表失败' })
    }
  }

  // 获取单个角色
  async getCharacter(req: Request, res: Response) {
    try {
      const { id } = req.params
      const character = await this.characterService.getCharacter(id)
      if (!character) {
        return res.status(404).json({ message: '角色不存在' })
      }
      res.json(character)
    } catch (error) {
      res.status(500).json({ message: '获取角色信息失败' })
    }
  }

  // 创建角色
  async createCharacter(req: Request, res: Response) {
    try {
      const character = await this.characterService.createCharacter(req.body)
      res.status(201).json(character)
    } catch (error) {
      res.status(500).json({ message: '创建角色失败' })
    }
  }

  // 更新角色
  async updateCharacter(req: Request, res: Response) {
    try {
      const { id } = req.params
      const character = await this.characterService.updateCharacter(id, req.body)
      if (!character) {
        return res.status(404).json({ message: '角色不存在' })
      }
      res.json(character)
    } catch (error) {
      res.status(500).json({ message: '更新角色失败' })
    }
  }

  // 删除角色
  async deleteCharacter(req: Request, res: Response) {
    try {
      const { id } = req.params
      const result = await this.characterService.deleteCharacter(id)
      if (!result) {
        return res.status(404).json({ message: '角色不存在' })
      }
      res.status(204).send()
    } catch (error) {
      res.status(500).json({ message: '删除角色失败' })
    }
  }

  // 分析角色
  async analyzeCharacter(req: Request, res: Response) {
    try {
      const { id } = req.params
      const character = await this.characterService.analyzeCharacter(id)
      if (!character) {
        return res.status(404).json({ message: '角色不存在' })
      }
      res.json(character)
    } catch (error) {
      res.status(500).json({ message: '分析角色失败' })
    }
  }

  // 批量分析角色
  async batchAnalyzeCharacters(req: Request, res: Response) {
    try {
      const { ids } = req.body
      const characters = await this.characterService.batchAnalyzeCharacters(ids)
      res.json(characters)
    } catch (error) {
      res.status(500).json({ message: '批量分析角色失败' })
    }
  }

  // 导出角色
  async exportCharacters(req: Request, res: Response) {
    try {
      const { ids } = req.body
      const characters = await this.characterService.getCharacters(ids)
      res.json(characters)
    } catch (error) {
      res.status(500).json({ message: '导出角色失败' })
    }
  }

  // 导入角色
  async importCharacters(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: '请上传文件' })
      }

      const fileContent = req.file.buffer.toString()
      const characters = JSON.parse(fileContent) as ICharacter[]
      
      // TODO: 验证导入的数据格式

      const importedCharacters = await Promise.all(
        characters.map(char => this.characterService.createCharacter(char))
      )

      res.json(importedCharacters)
    } catch (error) {
      res.status(500).json({ message: '导入角色失败' })
    }
  }

  // 获取角色关系
  async getCharacterRelationships(req: Request, res: Response) {
    try {
      const { id } = req.params
      const relationships = await this.characterService.getCharacterRelationships(id)
      res.json(relationships)
    } catch (error) {
      res.status(500).json({ message: '获取角色关系失败' })
    }
  }

  // 添加角色关系
  async addCharacterRelationship(req: Request, res: Response) {
    try {
      const { id, targetId } = req.params
      const { type, description } = req.body
      const character = await this.characterService.addCharacterRelationship(id, {
        characterId: targetId,
        type,
        description
      })
      res.json(character)
    } catch (error) {
      res.status(500).json({ message: '添加角色关系失败' })
    }
  }

  // 更新角色关系
  async updateCharacterRelationship(req: Request, res: Response) {
    try {
      const { id, targetId } = req.params
      const { type, description } = req.body
      const character = await this.characterService.updateCharacterRelationship(id, targetId, {
        type,
        description
      })
      res.json(character)
    } catch (error) {
      res.status(500).json({ message: '更新角色关系失败' })
    }
  }

  // 删除角色关系
  async deleteCharacterRelationship(req: Request, res: Response) {
    try {
      const { id, targetId } = req.params
      const character = await this.characterService.deleteCharacterRelationship(id, targetId)
      res.json(character)
    } catch (error) {
      res.status(500).json({ message: '删除角色关系失败' })
    }
  }
} 