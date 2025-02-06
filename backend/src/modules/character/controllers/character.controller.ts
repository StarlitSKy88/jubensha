import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { CharacterService } from '../services/character.service';
import { 
  CharacterNotFoundError,
  CharacterCreateError,
  CharacterUpdateError,
  CharacterDeleteError,
  CharacterValidationError,
  CharacterPermissionError,
  CharacterRelationshipError
} from '../errors/character.error';
import {
  CreateCharacterDto,
  UpdateCharacterDto,
  CharacterQueryDto,
  CharacterRelationshipDto,
  BulkCharacterOperationDto
} from '../dtos/character.dto';
import { logger } from '@utils/logger';

interface RequestWithFile extends Request {
  file?: {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
  };
}

export class CharacterController {
  private characterService: CharacterService;

  constructor() {
    this.characterService = new CharacterService();
  }

  /**
   * 创建角色
   */
  async createCharacter(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId, scriptId } = req.params;
      const characterData = req.body;

      const character = await this.characterService.createCharacter({
        name: characterData.name,
        type: characterData.type,
        description: characterData.description,
        background: characterData.background,
        clues: characterData.clues,
        relationships: characterData.relationships,
        scriptId,
        projectId,
        createdBy: (req as any).user.id,
        isPublic: characterData.isPublic
      });

      logger.info('角色创建成功:', character.id);

      res.status(201).json({
        success: true,
        message: '创建成功',
        data: character
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取角色列表
   */
  async getCharacters(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const query: CharacterQueryDto = {
        projectId: req.params.projectId,
        search: req.query.search as string,
        tags: req.query.tags as string[],
        age: req.query.age ? JSON.parse(req.query.age as string) : undefined,
        gender: req.query.gender as string,
        isPublic: req.query.isPublic === 'true',
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sortBy: req.query.sortBy as string,
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc'
      };

      const result = await this.characterService.getCharacters(userId, query);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取单个角色
   */
  async getCharacter(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId, scriptId, id } = req.params;
      const userId = (req as any).user.id;
      const character = await this.characterService.getCharacter(userId, id);

      res.json({
        success: true,
        data: character
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新角色
   */
  async updateCharacter(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId, scriptId, id } = req.params;
      const updateData: UpdateCharacterDto = req.body;

      const character = await this.characterService.updateCharacter(id, {
        ...updateData,
        updatedBy: (req as any).user.id
      });

      logger.info('角色更新成功:', id);

      res.json({
        success: true,
        message: '更新成功',
        data: character
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除角色
   */
  async deleteCharacter(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId, scriptId, id } = req.params;
      await this.characterService.deleteCharacter(id);

      logger.info('角色删除成功:', id);

      res.json({
        success: true,
        message: '删除成功'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 添加角色关系
   */
  async addRelationships(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId, scriptId, id } = req.params;
      const userId = (req as any).user.id;
      const relationships: CharacterRelationshipDto[] = req.body.relationships;

      const character = await this.characterService.addRelationships(userId, id, relationships);

      logger.info('角色关系添加成功:', id);

      res.json({
        success: true,
        message: '关系添加成功',
        data: character
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除角色关系
   */
  async removeRelationship(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId, scriptId, id, relationshipId } = req.params;
      const userId = (req as any).user.id;
      const character = await this.characterService.removeRelationship(userId, id, relationshipId);

      logger.info('角色关系移除成功:', id);

      res.json({
        success: true,
        message: '关系移除成功',
        data: character
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 批量操作
   */
  async bulkOperation(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const projectId = req.params.projectId;
      const operationData: BulkCharacterOperationDto = req.body;

      await this.characterService.bulkOperation(userId, projectId, operationData);
      res.json({
        success: true,
        message: '批量操作成功'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 上传角色图片
   */
  async uploadImage(req: RequestWithFile, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        throw new CharacterValidationError('请选择要上传的图片');
      }

      const { id } = req.params;
      const userId = (req as any).user.id;

      const character = await this.characterService.getCharacter(userId, id);
      if (!character) {
        throw new CharacterNotFoundError(id);
      }

      const creatorId = character.get('creator')?.toString();
      if (creatorId !== userId) {
        throw new CharacterPermissionError('无权修改该角色的图片');
      }

      // 保存图片路径到角色记录
      const imageUrl = `/uploads/characters/${req.file.filename}`;
      await this.characterService.updateCharacter(id, {
        imageUrl,
        updatedBy: userId
      });

      res.json({
        success: true,
        message: '图片上传成功',
        data: { imageUrl }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除角色图片
   */
  async deleteImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;

      const character = await this.characterService.getCharacter(userId, id);
      if (!character) {
        throw new CharacterNotFoundError(id);
      }

      const creatorId = character.get('creator')?.toString();
      if (creatorId !== userId) {
        throw new CharacterPermissionError('无权修改该角色的图片');
      }

      // 清除角色记录中的图片路径
      await this.characterService.updateCharacter(id, {
        imageUrl: null,
        updatedBy: userId
      });

      res.json({
        success: true,
        message: '图片删除成功'
      });
    } catch (error) {
      next(error);
    }
  }
}

// 创建控制器实例
export const characterController = new CharacterController(); 