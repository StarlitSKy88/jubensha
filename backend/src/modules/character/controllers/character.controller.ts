import { Request, Response } from 'express';
import { characterService } from '../services/character.service';
import { successResponse, errorResponse } from '../../../middleware/validator';
import { CharacterError } from '../errors/character.error';
import {
  CreateCharacterDto,
  UpdateCharacterDto,
  CharacterQueryDto,
  CharacterRelationshipDto,
  BulkCharacterOperationDto
} from '../dtos/character.dto';
import { upload, uploadService } from '../services/upload.service';

export class CharacterController {
  /**
   * 创建角色
   */
  async createCharacter(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const projectId = req.params.projectId;
      const characterData: CreateCharacterDto = req.body;

      const character = await characterService.createCharacter(
        userId,
        projectId,
        characterData
      );

      return successResponse(res, character, '角色创建成功');
    } catch (error) {
      if (error instanceof CharacterError) {
        return errorResponse(res, error.statusCode, error.message);
      }
      return errorResponse(res, 500, '创建角色失败');
    }
  }

  /**
   * 获取角色列表
   */
  async getCharacters(req: Request, res: Response) {
    try {
      const userId = req.user.id;
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

      const result = await characterService.getCharacters(userId, query);
      return successResponse(res, result, '获取角色列表成功');
    } catch (error) {
      if (error instanceof CharacterError) {
        return errorResponse(res, error.statusCode, error.message);
      }
      return errorResponse(res, 500, '获取角色列表失败');
    }
  }

  /**
   * 获取单个角色
   */
  async getCharacter(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const characterId = req.params.characterId;

      const character = await characterService.getCharacter(userId, characterId);
      return successResponse(res, character, '获取角色成功');
    } catch (error) {
      if (error instanceof CharacterError) {
        return errorResponse(res, error.statusCode, error.message);
      }
      return errorResponse(res, 500, '获取角色失败');
    }
  }

  /**
   * 更新角色
   */
  async updateCharacter(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const characterId = req.params.characterId;
      const updateData: UpdateCharacterDto = req.body;

      const character = await characterService.updateCharacter(
        userId,
        characterId,
        updateData
      );

      return successResponse(res, character, '角色更新成功');
    } catch (error) {
      if (error instanceof CharacterError) {
        return errorResponse(res, error.statusCode, error.message);
      }
      return errorResponse(res, 500, '更新角色失败');
    }
  }

  /**
   * 删除角色
   */
  async deleteCharacter(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const characterId = req.params.characterId;

      await characterService.deleteCharacter(userId, characterId);
      return successResponse(res, null, '角色删除成功');
    } catch (error) {
      if (error instanceof CharacterError) {
        return errorResponse(res, error.statusCode, error.message);
      }
      return errorResponse(res, 500, '删除角色失败');
    }
  }

  /**
   * 添加角色关系
   */
  async addRelationships(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const characterId = req.params.characterId;
      const relationships: CharacterRelationshipDto[] = req.body.relationships;

      const character = await characterService.addRelationships(
        userId,
        characterId,
        relationships
      );

      return successResponse(res, character, '角色关系添加成功');
    } catch (error) {
      if (error instanceof CharacterError) {
        return errorResponse(res, error.statusCode, error.message);
      }
      return errorResponse(res, 500, '添加角色关系失败');
    }
  }

  /**
   * 删除角色关系
   */
  async removeRelationship(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const characterId = req.params.characterId;
      const targetCharacterId = req.params.targetCharacterId;

      const character = await characterService.removeRelationship(
        userId,
        characterId,
        targetCharacterId
      );

      return successResponse(res, character, '角色关系删除成功');
    } catch (error) {
      if (error instanceof CharacterError) {
        return errorResponse(res, error.statusCode, error.message);
      }
      return errorResponse(res, 500, '删除角色关系失败');
    }
  }

  /**
   * 批量操作
   */
  async bulkOperation(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const projectId = req.params.projectId;
      const operationData: BulkCharacterOperationDto = req.body;

      await characterService.bulkOperation(userId, projectId, operationData);
      return successResponse(res, null, '批量操作成功');
    } catch (error) {
      if (error instanceof CharacterError) {
        return errorResponse(res, error.statusCode, error.message);
      }
      return errorResponse(res, 500, '批量操作失败');
    }
  }

  /**
   * 上传角色图片
   */
  async uploadImage(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        throw new CharacterError('请选择要上传的图片', 400);
      }

      const imageUrl = await uploadService.uploadImage(req.file);
      res.json(successResponse('图片上传成功', { imageUrl }));
    } catch (error) {
      res.status(error.statusCode || 500).json(errorResponse(error.message));
    }
  }

  /**
   * 删除角色图片
   */
  async deleteImage(req: Request, res: Response): Promise<void> {
    try {
      const { imageUrl } = req.body;
      if (!imageUrl || !uploadService.validateImageUrl(imageUrl)) {
        throw new CharacterError('无效的图片URL', 400);
      }

      await uploadService.deleteImage(imageUrl);
      res.json(successResponse('图片删除成功'));
    } catch (error) {
      res.status(error.statusCode || 500).json(errorResponse(error.message));
    }
  }
}

export const characterController = new CharacterController(); 