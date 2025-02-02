import { Request, Response } from 'express'
import { CharacterService } from '../services/character.service'
import { BusinessError } from '../utils/errors'

export class CharacterController {
  private characterService: CharacterService

  constructor() {
    this.characterService = new CharacterService()
  }

  /**
   * 获取角色列表
   */
  async getCharacters(req: Request, res: Response) {
    try {
      const { projectId } = req.query
      if (!projectId) {
        throw new BusinessError('VALIDATION_ERROR', 'projectId 为必填项', 400)
      }

      const characters = await this.characterService.getCharacters(projectId as string)
      res.json({
        message: '获取成功',
        data: characters
      })
    } catch (error) {
      if (error instanceof BusinessError) {
        res.status(error.status).json({
          code: error.code,
          message: error.message
        })
      } else {
        res.status(500).json({
          code: 'INTERNAL_ERROR',
          message: '服务器内部错误'
        })
      }
    }
  }

  /**
   * 获取单个角色
   */
  async getCharacter(req: Request, res: Response) {
    try {
      const { id } = req.params
      const character = await this.characterService.getCharacter(id)

      if (!character) {
        throw new BusinessError('NOT_FOUND', '角色不存在', 404)
      }

      res.json({
        message: '获取成功',
        data: character
      })
    } catch (error) {
      if (error instanceof BusinessError) {
        res.status(error.status).json({
          code: error.code,
          message: error.message
        })
      } else {
        res.status(500).json({
          code: 'INTERNAL_ERROR',
          message: '服务器内部错误'
        })
      }
    }
  }

  /**
   * 创建角色
   */
  async createCharacter(req: Request, res: Response) {
    try {
      const character = await this.characterService.createCharacter(req.body)
      res.status(201).json({
        message: '创建成功',
        data: character
      })
    } catch (error) {
      if (error instanceof BusinessError) {
        res.status(error.status).json({
          code: error.code,
          message: error.message
        })
      } else {
        res.status(500).json({
          code: 'INTERNAL_ERROR',
          message: '服务器内部错误'
        })
      }
    }
  }

  /**
   * 更新角色
   */
  async updateCharacter(req: Request, res: Response) {
    try {
      const { id } = req.params
      const character = await this.characterService.updateCharacter(id, req.body)

      if (!character) {
        throw new BusinessError('NOT_FOUND', '角色不存在', 404)
      }

      res.json({
        message: '更新成功',
        data: character
      })
    } catch (error) {
      if (error instanceof BusinessError) {
        res.status(error.status).json({
          code: error.code,
          message: error.message
        })
      } else {
        res.status(500).json({
          code: 'INTERNAL_ERROR',
          message: '服务器内部错误'
        })
      }
    }
  }

  /**
   * 删除角色
   */
  async deleteCharacter(req: Request, res: Response) {
    try {
      const { id } = req.params
      const success = await this.characterService.deleteCharacter(id)

      if (!success) {
        throw new BusinessError('NOT_FOUND', '角色不存在', 404)
      }

      res.json({
        message: '删除成功'
      })
    } catch (error) {
      if (error instanceof BusinessError) {
        res.status(error.status).json({
          code: error.code,
          message: error.message
        })
      } else {
        res.status(500).json({
          code: 'INTERNAL_ERROR',
          message: '服务器内部错误'
        })
      }
    }
  }

  /**
   * 获取角色关系
   */
  async getCharacterRelationships(req: Request, res: Response) {
    try {
      const { id } = req.params
      const relationships = await this.characterService.getCharacterRelationships(id)
      res.json({
        message: '获取成功',
        data: relationships
      })
    } catch (error) {
      if (error instanceof BusinessError) {
        res.status(error.status).json({
          code: error.code,
          message: error.message
        })
      } else {
        res.status(500).json({
          code: 'INTERNAL_ERROR',
          message: '服务器内部错误'
        })
      }
    }
  }

  /**
   * 添加角色关系
   */
  async addCharacterRelationship(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { targetId, type, description } = req.body

      if (!targetId || !type) {
        throw new BusinessError('VALIDATION_ERROR', 'targetId 和 type 为必填项', 400)
      }

      await this.characterService.addCharacterRelationship({
        sourceId: id,
        targetId,
        type,
        description
      })

      res.json({
        message: '添加成功'
      })
    } catch (error) {
      if (error instanceof BusinessError) {
        res.status(error.status).json({
          code: error.code,
          message: error.message
        })
      } else {
        res.status(500).json({
          code: 'INTERNAL_ERROR',
          message: '服务器内部错误'
        })
      }
    }
  }

  /**
   * 更新角色关系
   */
  async updateCharacterRelationship(req: Request, res: Response) {
    try {
      const { id, targetId } = req.params
      const { type, description } = req.body

      if (!type) {
        throw new BusinessError('VALIDATION_ERROR', 'type 为必填项', 400)
      }

      await this.characterService.updateCharacterRelationship(id, targetId, {
        type,
        description
      })

      res.json({
        message: '更新成功'
      })
    } catch (error) {
      if (error instanceof BusinessError) {
        res.status(error.status).json({
          code: error.code,
          message: error.message
        })
      } else {
        res.status(500).json({
          code: 'INTERNAL_ERROR',
          message: '服务器内部错误'
        })
      }
    }
  }

  /**
   * 删除角色关系
   */
  async deleteCharacterRelationship(req: Request, res: Response) {
    try {
      const { id, targetId } = req.params
      await this.characterService.deleteCharacterRelationship(id, targetId)
      res.json({
        message: '删除成功'
      })
    } catch (error) {
      if (error instanceof BusinessError) {
        res.status(error.status).json({
          code: error.code,
          message: error.message
        })
      } else {
        res.status(500).json({
          code: 'INTERNAL_ERROR',
          message: '服务器内部错误'
        })
      }
    }
  }

  // 分析角色
  async analyzeCharacter(req: Request, res: Response) {
    try {
      const { id } = req.params
      const analysis = await this.characterService.analyzeCharacter(id)
      res.json(analysis)
    } catch (error) {
      res.status(500).json({
        message: '分析角色失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }

  // 批量分析角色
  async batchAnalyzeCharacters(req: Request, res: Response) {
    try {
      const { projectId } = req.query
      if (!projectId || typeof projectId !== 'string') {
        return res.status(400).json({ message: '缺少项目ID' })
      }

      const results = await this.characterService.batchAnalyzeCharacters(projectId)
      res.json(results)
    } catch (error) {
      res.status(500).json({
        message: '批量分析角色失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }

  // 导出角色
  async exportCharacter(req: Request, res: Response) {
    try {
      const { id } = req.params
      const character = await this.characterService.exportCharacter(id)
      res.json(character)
    } catch (error) {
      res.status(500).json({
        message: '导出角色失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }

  // 导入角色
  async importCharacter(req: Request, res: Response) {
    try {
      const { projectId } = req.query
      if (!projectId || typeof projectId !== 'string') {
        return res.status(400).json({ message: '缺少项目ID' })
      }

      const character = await this.characterService.importCharacter(projectId, req.body)
      res.status(201).json(character)
    } catch (error) {
      res.status(500).json({
        message: '导入角色失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }

  // 复制角色
  async copyCharacter(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { projectId } = req.body

      if (!projectId) {
        return res.status(400).json({ message: '缺少目标项目ID' })
      }

      const character = await this.characterService.copyCharacter(id, projectId)
      res.status(201).json(character)
    } catch (error) {
      res.status(500).json({
        message: '复制角色失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }

  // 合并角色
  async mergeCharacters(req: Request, res: Response) {
    try {
      const { sourceId, targetId } = req.params
      await this.characterService.mergeCharacters(sourceId, targetId)
      res.status(204).send()
    } catch (error) {
      res.status(500).json({
        message: '合并角色失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }
} 