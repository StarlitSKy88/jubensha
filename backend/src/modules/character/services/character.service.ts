import { Types } from 'mongoose';
import { Character, ICharacter, CharacterType, CharacterStatus } from '../models/character.model';
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
  CharacterResponseDto,
  CharacterRelationshipDto,
  BulkCharacterOperationDto
} from '../dtos/character.dto';
import { logger } from '@utils/logger';

export class CharacterService {
  /**
   * 创建角色
   */
  async createCharacter(data: {
    name: string;
    type: CharacterType;
    description: string;
    background: string;
    clues?: string[];
    relationships?: {
      character: string;
      type: string;
      description: string;
    }[];
    scriptId: string;
    projectId: string;
    createdBy: string;
    isPublic?: boolean;
  }): Promise<ICharacter> {
    try {
      // 创建角色
      const character = await Character.create({
        ...data,
        status: CharacterStatus.ACTIVE,
        metadata: {
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        updatedBy: data.createdBy,
        creator: data.createdBy,
        isPublic: data.isPublic ?? false
      });

      logger.info('角色创建成功:', character.id);
      return character;
    } catch (error) {
      logger.error('角色创建失败:', error);
      throw new CharacterCreateError((error as Error).message);
    }
  }

  /**
   * 获取角色列表
   */
  async getCharacters(
    userId: string,
    query: CharacterQueryDto
  ): Promise<{
    characters: ICharacter[];
    total: number;
  }> {
    try {
      const {
        projectId,
        search,
        tags,
        age,
        gender,
        isPublic,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = query;

      // 构建查询条件
      const filter: any = {
        projectId: new Types.ObjectId(projectId),
        $or: [
          { creator: new Types.ObjectId(userId) },
          { isPublic: true }
        ]
      };

      if (search) {
        filter.$text = { $search: search };
      }

      if (tags?.length) {
        filter.tags = { $in: tags };
      }

      if (age) {
        if (age.min !== undefined) {
          filter.age = { ...filter.age, $gte: age.min };
        }
        if (age.max !== undefined) {
          filter.age = { ...filter.age, $lte: age.max };
        }
      }

      if (gender) {
        filter.gender = gender;
      }

      if (typeof isPublic === 'boolean') {
        filter.isPublic = isPublic;
      }

      // 计算总数
      const total = await Character.countDocuments(filter);

      // 获取分页数据
      const characters = await Character.find(filter)
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('creator', 'username')
        .populate('relationships.character', 'name');

      return { characters, total };
    } catch (error) {
      throw new CharacterValidationError((error as Error).message);
    }
  }

  /**
   * 获取单个角色
   */
  async getCharacter(userId: string, characterId: string): Promise<ICharacter> {
    const character = await Character.findById(characterId)
      .populate('creator', 'username')
      .populate('relationships.character', 'name');

    if (!character) {
      throw new CharacterNotFoundError(characterId);
    }

    const creatorId = character.get('creator')?.toString();
    const isPublic = character.get('isPublic') || false;

    if (!isPublic && creatorId !== userId) {
      throw new CharacterPermissionError('无权访问该角色');
    }

    return character;
  }

  /**
   * 更新角色
   */
  async updateCharacter(
    id: string,
    data: {
      name?: string;
      type?: CharacterType;
      status?: CharacterStatus;
      description?: string;
      background?: string;
      clues?: string[];
      relationships?: {
        character: string;
        type: string;
        description: string;
      }[];
      imageUrl?: string | null;
      updatedBy: string;
    }
  ): Promise<ICharacter> {
    try {
      // 验证角色存在
      const character = await Character.findById(id);
      if (!character) {
        throw new CharacterNotFoundError(id);
      }

      // 更新角色
      const updatedCharacter = await Character.findByIdAndUpdate(
        id,
        {
          ...data,
          'metadata.updatedAt': new Date(),
          updatedBy: data.updatedBy
        },
        { new: true }
      );

      if (!updatedCharacter) {
        throw new CharacterUpdateError(id, '更新失败');
      }

      logger.info('角色更新成功:', id);
      return updatedCharacter;
    } catch (error) {
      logger.error('角色更新失败:', error);
      if (error instanceof CharacterNotFoundError) {
        throw error;
      }
      throw new CharacterUpdateError(id, (error as Error).message);
    }
  }

  /**
   * 删除角色
   */
  async deleteCharacter(id: string): Promise<void> {
    try {
      const character = await Character.findById(id);
      if (!character) {
        throw new CharacterNotFoundError(id);
      }

      // 软删除
      await Character.findByIdAndUpdate(id, {
        status: CharacterStatus.INACTIVE,
        'metadata.updatedAt': new Date()
      });

      logger.info('角色删除成功:', id);
    } catch (error) {
      logger.error('角色删除失败:', error);
      if (error instanceof CharacterNotFoundError) {
        throw error;
      }
      throw new CharacterDeleteError(id, (error as Error).message);
    }
  }

  /**
   * 添加角色关系
   */
  async addRelationships(
    userId: string,
    characterId: string,
    relationships: CharacterRelationshipDto[]
  ): Promise<ICharacter> {
    const character = await Character.findById(characterId);

    if (!character) {
      throw new CharacterNotFoundError(characterId);
    }

    const creatorId = character.get('creator')?.toString();
    if (creatorId !== userId) {
      throw new CharacterPermissionError('无权修改该角色的关系');
    }

    // 验证目标角色是否存在
    for (const relationship of relationships) {
      const targetCharacter = await Character.findById(relationship.character);
      if (!targetCharacter) {
        throw new CharacterRelationshipError(`目标角色 ${relationship.character} 不存在`);
      }
    }

    // 添加关系
    character.relationships = character.relationships || [];
    character.relationships.push(...relationships.map(r => ({
      character: new Types.ObjectId(r.character),
      type: r.type,
      description: r.description
    })));

    await character.save();
    return character;
  }

  /**
   * 删除角色关系
   */
  async removeRelationship(
    userId: string,
    characterId: string,
    targetCharacterId: string
  ): Promise<ICharacter> {
    const character = await Character.findById(characterId);

    if (!character) {
      throw new CharacterNotFoundError(characterId);
    }

    const creatorId = character.get('creator')?.toString();
    if (creatorId !== userId) {
      throw new CharacterPermissionError('无权修改该角色的关系');
    }

    character.relationships = character.relationships?.filter(
      (r: { character: Types.ObjectId }) => r.character.toString() !== targetCharacterId
    );

    await character.save();
    return character;
  }

  /**
   * 批量操作
   */
  async bulkOperation(
    userId: string,
    projectId: string,
    data: BulkCharacterOperationDto
  ): Promise<void> {
    try {
      const { characterIds, operation, data: operationData } = data;

      // 验证所有角色是否存在且用户有权限
      const characters = await Character.find({
        _id: { $in: characterIds.map(id => new Types.ObjectId(id)) },
        projectId: new Types.ObjectId(projectId)
      });

      if (characters.length !== characterIds.length) {
        throw new CharacterValidationError('部分角色不存在');
      }

      const unauthorizedCharacters = characters.filter(
        character => character.get('creator')?.toString() !== userId
      );

      if (unauthorizedCharacters.length > 0) {
        throw new CharacterPermissionError('对部分角色没有操作权限');
      }

      // 执行批量操作
      switch (operation) {
        case 'delete':
          await Character.deleteMany({
            _id: { $in: characterIds.map(id => new Types.ObjectId(id)) }
          });
          break;

        case 'makePublic':
          await Character.updateMany(
            { _id: { $in: characterIds.map(id => new Types.ObjectId(id)) } },
            { $set: { isPublic: true } }
          );
          break;

        case 'makePrivate':
          await Character.updateMany(
            { _id: { $in: characterIds.map(id => new Types.ObjectId(id)) } },
            { $set: { isPublic: false } }
          );
          break;

        case 'addTags':
          if (!operationData?.tags?.length) {
            throw new CharacterValidationError('未指定要添加的标签');
          }
          await Character.updateMany(
            { _id: { $in: characterIds.map(id => new Types.ObjectId(id)) } },
            { $addToSet: { tags: { $each: operationData.tags } } }
          );
          break;

        case 'removeTags':
          if (!operationData?.tags?.length) {
            throw new CharacterValidationError('未指定要移除的标签');
          }
          await Character.updateMany(
            { _id: { $in: characterIds.map(id => new Types.ObjectId(id)) } },
            { $pullAll: { tags: operationData.tags } }
          );
          break;

        default:
          throw new CharacterValidationError('不支持的操作类型');
      }
    } catch (error) {
      if (error instanceof CharacterNotFoundError ||
          error instanceof CharacterPermissionError ||
          error instanceof CharacterValidationError) {
        throw error;
      }
      throw new CharacterValidationError((error as Error).message);
    }
  }
}

export const characterService = new CharacterService(); 